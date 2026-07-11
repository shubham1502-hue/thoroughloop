import { normalizeContextSourceId, type ContextSourceId } from "./contextSources";
import { nowIsoString } from "./date";
import {
  missingContextForStructuredInput,
  normalizeStructuredContext,
  structuredEntityCandidates
} from "./structuredContext";
import type {
  DiagnosisConfidence,
  FounderDiagnosis,
  StructuredContextField,
  WorkflowDefinition,
  WorkflowId
} from "./types";
import { getWorkflowById, WORKFLOWS } from "./workflows";
import { normalizeText, uniqueValues } from "./validation";

const THIN_INPUT_LENGTH = 35;

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function keywordMatches(input: string, workflow: WorkflowDefinition): string[] {
  const lowerInput = input.toLowerCase();

  return workflow.keywords.filter((keyword) => lowerInput.includes(keyword.toLowerCase()));
}

function confidenceFromMatchCount(count: number): DiagnosisConfidence {
  if (count >= 3) {
    return "High";
  }

  if (count === 2) {
    return "Medium";
  }

  return "Low";
}

function detectWorkflow(rawInput: string): { workflow: WorkflowDefinition; matchedKeywords: string[]; confidence: DiagnosisConfidence } {
  const input = normalizeText(rawInput);
  const scored = WORKFLOWS.filter((workflow) => workflow.id !== "weekly-review")
    .map((workflow) => ({
      workflow,
      matchedKeywords: keywordMatches(input, workflow)
    }))
    .sort((a, b) => b.matchedKeywords.length - a.matchedKeywords.length);

  const [top, second] = scored;
  const isThin = input.length < THIN_INPUT_LENGTH;
  const isTie = Boolean(top && second && top.matchedKeywords.length === second.matchedKeywords.length);

  if (!top || top.matchedKeywords.length === 0 || isThin || isTie) {
    return {
      workflow: getWorkflowById("weekly-review"),
      matchedKeywords: top?.matchedKeywords ?? [],
      confidence: "Low"
    };
  }

  return {
    workflow: top.workflow,
    matchedKeywords: top.matchedKeywords,
    confidence: confidenceFromMatchCount(top.matchedKeywords.length)
  };
}

export function extractRiskSignals(rawInput: string): string[] {
  const lowerInput = rawInput.toLowerCase();
  const signals: string[] = [];

  if (lowerInput.includes("stuck")) {
    signals.push("Stuck deal or blocked workflow detected");
  }

  if (lowerInput.includes("pricing")) {
    signals.push("Pricing concern detected");
  }

  if (lowerInput.includes("no reply") || lowerInput.includes("not replied")) {
    signals.push("Follow-up decay detected");
  }

  if (lowerInput.includes("proposal")) {
    signals.push("Proposal-stage risk detected");
  }

  if (lowerInput.includes("negotiation")) {
    signals.push("Late-stage revenue risk detected");
  }

  if (lowerInput.includes("onboarding") || lowerInput.includes("activation")) {
    signals.push("Post-sale activation risk detected");
  }

  if (lowerInput.includes("investor") || lowerInput.includes("board")) {
    signals.push("Investor narrative need detected");
  }

  if (lowerInput.includes("hiring") || lowerInput.includes("candidate") || lowerInput.includes("interview")) {
    signals.push("Hiring bottleneck detected");
  }

  return signals.length > 0 ? uniqueValues(signals) : ["Context is too thin to extract strong risk signals"];
}

export function extractCompanyOrDealNames(rawInput: string): string[] {
  const entityPattern = /\b([A-Z][A-Za-z0-9&.-]+(?:[ \t]+[A-Z][A-Za-z0-9&.-]+){1,3})\b/g;
  const blocked = new Set([
    "Revenue Rescue",
    "Weekly Operating",
    "Investor Update",
    "Onboarding Risk",
    "Hiring Bottleneck",
    "Founder Action",
    "Decision Log",
    "Final Interview",
    "Founding Account Executive"
  ]);
  const ignoredFieldLabels = new Set([
    "stage",
    "status",
    "role",
    "metric",
    "date",
    "priority",
    "source",
    "next step",
    "last activity",
    "days stuck",
    "days in stage"
  ]);
  const namedFieldLabels = new Set(["company", "account", "customer", "candidate", "owner", "deal", "deal name"]);
  const blockedTailWords = new Set(["stage", "owner", "status", "role", "metric", "date", "priority", "source"]);
  const candidates: string[] = [];

  for (const rawLine of rawInput.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    const fieldMatch = line.match(/^([A-Za-z][A-Za-z ]+):\s*(.*)$/);
    const fieldLabel = fieldMatch?.[1]?.trim().toLowerCase();
    const searchableText = fieldLabel && namedFieldLabels.has(fieldLabel)
      ? fieldMatch?.[2]?.trim() ?? line
      : line;

    if (fieldLabel && ignoredFieldLabels.has(fieldLabel)) {
      continue;
    }

    const matches = searchableText.match(entityPattern) ?? [];

    for (const match of matches) {
      const words = match.trim().split(/[ \t]+/);

      while (words.length > 1 && blockedTailWords.has(words[words.length - 1].toLowerCase())) {
        words.pop();
      }

      const candidate = words.join(" ");

      if (candidate.split(" ").length >= 2 && !blocked.has(candidate)) {
        candidates.push(candidate);
      }
    }
  }

  return uniqueValues(candidates).slice(0, 6);
}

export function createDiagnosis(
  rawInput: string,
  forcedWorkflowId?: WorkflowId,
  contextSource?: ContextSourceId,
  structuredContextInput: StructuredContextField[] = []
): FounderDiagnosis {
  const structuredContext = normalizeStructuredContext(structuredContextInput);
  const detected = forcedWorkflowId
    ? {
        workflow: getWorkflowById(forcedWorkflowId),
        matchedKeywords: keywordMatches(rawInput, getWorkflowById(forcedWorkflowId)),
        confidence: confidenceFromMatchCount(keywordMatches(rawInput, getWorkflowById(forcedWorkflowId)).length)
      }
    : detectWorkflow(rawInput);

  return {
    id: createId("diagnosis"),
    createdAt: nowIsoString(),
    contextSource: normalizeContextSourceId(contextSource),
    workflow: detected.workflow,
    confidence: detected.confidence,
    matchedKeywords: detected.matchedKeywords,
    extractedCompaniesOrDeals: uniqueValues([
      ...extractCompanyOrDealNames(rawInput),
      ...structuredEntityCandidates(structuredContext)
    ]).slice(0, 6),
    extractedRiskSignals: extractRiskSignals(rawInput),
    structuredContext,
    missingContext: missingContextForStructuredInput(detected.workflow, structuredContext),
    recommendedNextStep: detected.workflow.recommendedNextStep,
    rawInput
  };
}
