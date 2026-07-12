import type { StructuredContextField, WorkflowDefinition, WorkflowId } from "./types";
import { uniqueValues } from "./validation";

const missingContextKeys: Record<WorkflowId, Record<string, string[]>> = {
  "revenue-rescue": {
    "Deal value": ["dealValue"],
    Owner: ["owner"],
    "Last activity date": ["lastActivity"],
    "Next step": ["nextStep"],
    "Close probability": ["closeProbability"]
  },
  "weekly-review": {
    "What moved this week": ["moved"],
    "What got stuck": ["stuck"],
    "Decisions needed": ["decisions"],
    "Next week priorities": ["nextWeek"]
  },
  "investor-update": {
    "Reporting period": ["reportingPeriod"],
    "Key wins": ["keyWins"],
    "Key risks": ["keyRisks"],
    "Investor asks": ["investorAsks"],
    "Metrics snapshot": ["metricsSnapshot", "metrics"]
  },
  "onboarding-risk": {
    "Customer name": ["customerName"],
    "Activation stage": ["onboardingStage", "activationStage"],
    Blocker: ["blocker"],
    Owner: ["owner"],
    "Next milestone": ["nextMilestone"]
  },
  "hiring-bottleneck": {
    Role: ["role"],
    "Candidate stage": ["stage", "candidateStage"],
    "Hiring priority": ["hiringPriority", "priority"],
    Owner: ["owner"],
    "Next step": ["nextStep"]
  }
};

const subjectKeys: Record<WorkflowId, string[]> = {
  "revenue-rescue": ["dealName", "accountName", "companyName"],
  "weekly-review": ["operatingFocus", "projectName", "companyName"],
  "investor-update": ["companyName"],
  "onboarding-risk": ["customerName", "companyName"],
  "hiring-bottleneck": ["candidate", "role"]
};

const entityKeys = new Set(["dealName", "accountName", "companyName", "customerName", "candidate"]);

export function normalizeStructuredContext(fields: StructuredContextField[] = []): StructuredContextField[] {
  const normalized = fields
    .map((field) => ({
      key: field.key.trim(),
      label: field.label.trim(),
      value: field.value.trim()
    }))
    .filter((field) => field.key && field.label && field.value);

  const seen = new Set<string>();

  return normalized.filter((field) => {
    if (seen.has(field.key)) {
      return false;
    }

    seen.add(field.key);
    return true;
  });
}

export function structuredContextValue(fields: StructuredContextField[], key: string): string {
  return fields.find((field) => field.key === key)?.value ?? "";
}

export function structuredSubjectCandidates(
  workflowId: WorkflowId,
  fields: StructuredContextField[]
): string[] {
  return uniqueValues(
    subjectKeys[workflowId]
      .map((key) => structuredContextValue(fields, key))
      .map((value) => value.trim())
      .filter(Boolean)
  );
}

export function structuredEntityCandidates(fields: StructuredContextField[]): string[] {
  return uniqueValues(
    fields
      .filter((field) => entityKeys.has(field.key))
      .map((field) => field.value.trim())
      .filter(Boolean)
  );
}

export function missingContextForStructuredInput(
  workflow: WorkflowDefinition,
  fields: StructuredContextField[]
): string[] {
  const providedKeys = new Set(fields.map((field) => field.key));
  const keyMap = missingContextKeys[workflow.id];

  return workflow.missingContext.filter((item) => {
    const matchingKeys = keyMap[item] ?? [];
    return !matchingKeys.some((key) => providedKeys.has(key));
  });
}

export function structuredEvidenceLines(fields: StructuredContextField[]): string[] {
  return fields.map((field) => `${field.label}: ${field.value}`);
}
