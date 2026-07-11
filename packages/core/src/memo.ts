import { contextSourceLabelForId } from "./contextSources";
import { nextWeekIsoDate, nowIsoString, tomorrowIsoDate } from "./date";
import { extractSourceSnippets } from "./sourceSnippets";
import {
  structuredContextValue,
  structuredEvidenceLines,
  structuredSubjectCandidates
} from "./structuredContext";
import type {
  FounderDiagnosis,
  InvestorUpdateVersions,
  MemoAssumption,
  Priority,
  SavedDecision,
  SavedFounderAction,
  SavedMemo,
  Settings,
  WorkflowName
} from "./types";

function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function neutralSubject(workflow: WorkflowName): string {
  const subjects: Record<WorkflowName, string> = {
    "Revenue Rescue": "the priority revenue account",
    "Weekly Operating Review": "this week's operating focus",
    "Investor Update": "this investor update",
    "Onboarding Risk": "the onboarding risk",
    "Hiring Bottleneck": "the priority hiring decision"
  };

  return subjects[workflow];
}

function subjectFromDiagnosis(diagnosis: FounderDiagnosis, settings?: Partial<Settings>): string {
  const structuredSubject = structuredSubjectCandidates(
    diagnosis.workflow.id,
    diagnosis.structuredContext
  )[0];
  const extractedSubject = diagnosis.extractedCompaniesOrDeals.find((item) => item.trim())?.trim();
  const settingsSubject = settings?.companyName?.trim();

  if (structuredSubject) {
    return structuredSubject;
  }

  if (diagnosis.workflow.id === "weekly-review") {
    return settingsSubject || neutralSubject(diagnosis.workflow.name);
  }

  return extractedSubject || settingsSubject || neutralSubject(diagnosis.workflow.name);
}

function withoutTerminalPunctuation(value: string): string {
  return value.trim().replace(/[.!?]+$/, "");
}

function lowerFirst(value: string): string {
  const trimmed = value.trim();
  return trimmed ? `${trimmed[0].toLowerCase()}${trimmed.slice(1)}` : "";
}

function asSentence(value: string): string {
  const trimmed = withoutTerminalPunctuation(value);
  return trimmed ? `${trimmed}.` : "";
}

function withTerminalPunctuation(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "Not provided.";
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function asDecisionQuestion(value: string): string {
  const original = value.trim();
  const trimmed = withoutTerminalPunctuation(original);

  if (!trimmed) {
    return "";
  }

  if (/^whether\b/i.test(trimmed)) {
    return `Decide ${lowerFirst(trimmed)}?`;
  }

  if (original.endsWith("?") || /^(should|can|could|will|would|do|does|is|are|has|have)\b/i.test(trimmed)) {
    return `${trimmed}?`;
  }

  return `Decide: ${asSentence(trimmed)}`;
}

type MemoCopy = Pick<
  SavedMemo,
  | "title"
  | "problem"
  | "diagnosis"
  | "recommendedDecision"
  | "founderAction"
  | "doneWhen"
  | "investorSafeSummary"
>;

function priorityForWorkflow(workflow: WorkflowName): Priority {
  if (workflow === "Revenue Rescue" || workflow === "Onboarding Risk") {
    return "High";
  }

  if (workflow === "Hiring Bottleneck") {
    return "Medium";
  }

  return "Medium";
}

function memoCopyForWorkflow(diagnosis: FounderDiagnosis, subject: string): MemoCopy {
  const fields = diagnosis.structuredContext;
  const workflow = diagnosis.workflow.name;

  if (workflow === "Revenue Rescue") {
    const nextStep = structuredContextValue(fields, "nextStep");
    const founderAction = nextStep
      ? `Follow up with ${subject} and complete this next step: ${asSentence(nextStep)}`
      : `Send one founder-led follow-up to ${subject} and confirm the next decision step.`;
    const recommendedDecision = `Decide whether ${subject} should remain in founder-led follow-up next week.`;

    return {
      title: `Revenue Rescue: ${subject}`,
      problem: `${subject} shows revenue motion risk because late-stage follow-up, pricing, or proposal activity may be slipping.`,
      diagnosis: `Revenue Rescue: the bottleneck is the unresolved next decision for ${subject}.`,
      recommendedDecision,
      founderAction,
      doneWhen: `${subject} has a confirmed decision owner, next step, and dated follow-up.`,
      investorSafeSummary: `Revenue Rescue: ${recommendedDecision} The next founder action is to ${lowerFirst(founderAction)}`
    };
  }

  if (workflow === "Onboarding Risk") {
    const nextMilestone = structuredContextValue(fields, "nextMilestone");
    const founderAction = nextMilestone
      ? `Confirm the blocker for ${subject} and secure the next milestone: ${asSentence(nextMilestone)}`
      : `Contact the owner for ${subject} and confirm the blocker, next milestone, and date to activation.`;
    const recommendedDecision = `Decide whether ${subject} needs founder intervention to unblock activation.`;

    return {
      title: `Onboarding Risk: ${subject}`,
      problem: `${subject} may be exposed to post-sale activation risk before value is fully delivered.`,
      diagnosis: `Onboarding Risk: the bottleneck is the unresolved activation handoff for ${subject}.`,
      recommendedDecision,
      founderAction,
      doneWhen: `${subject} has one owner, one written blocker, and one dated activation milestone.`,
      investorSafeSummary: `Onboarding Risk: ${recommendedDecision} The next founder action is to ${lowerFirst(founderAction)}`
    };
  }

  if (workflow === "Hiring Bottleneck") {
    const structuredRole = structuredContextValue(fields, "role");
    const role = structuredRole.replace(/^the\s+/i, "") || "priority role";
    const rolePhrase = structuredRole ? `the ${role}` : "the priority hiring";
    const decisionLabel = `${rolePhrase} decision`;
    const candidate = structuredContextValue(fields, "candidate");
    const nextStep = structuredContextValue(fields, "nextStep");
    const candidateClause = candidate ? ` for ${candidate}` : "";
    const processSubject = `${rolePhrase.charAt(0).toUpperCase()}${rolePhrase.slice(1)} process`;
    const founderAction = nextStep
      ? `Resolve ${decisionLabel}${candidateClause}: ${asSentence(nextStep)}`
      : `Close ${decisionLabel}${candidateClause} and document the reason.`;
    const recommendedDecision = candidate
      ? `Decide whether ${candidate} should advance for ${rolePhrase}.`
      : `Decide whether the current ${role} process should advance, pause, or change.`;

    return {
      title: `Hiring Bottleneck: ${subject}`,
      problem: `${subject} needs a hiring decision because the current role or candidate flow appears stuck.`,
      diagnosis: `Hiring Bottleneck: the bottleneck is ${decisionLabel}${candidateClause}.`,
      recommendedDecision,
      founderAction,
      doneWhen: `${candidate || processSubject} is advanced, rejected, or paused with one written reason.`,
      investorSafeSummary: `Hiring Bottleneck: ${recommendedDecision} The next founder action is to ${lowerFirst(founderAction)}`
    };
  }

  if (workflow === "Investor Update") {
    const reportingPeriod = structuredContextValue(fields, "reportingPeriod") || "current period";
    const periodReference = reportingPeriod === "current period" ? "the current period" : reportingPeriod;
    const investorAsk = structuredContextValue(fields, "investorAsks");
    const founderAction = investorAsk
      ? `Draft the ${reportingPeriod} investor update and make the ask explicit: ${asSentence(investorAsk)}`
      : `Draft the ${reportingPeriod} investor update around progress, risks, metrics, and one clear ask.`;
    const recommendedDecision = `Decide the investor narrative and ask that should be shared for ${periodReference}.`;

    return {
      title: `Investor Update: ${subject}`,
      problem: `${subject} needs a clearer investor narrative that separates progress, risks, and asks.`,
      diagnosis: `Investor Update: the bottleneck is narrative discipline for ${periodReference}, not update volume.`,
      recommendedDecision,
      founderAction,
      doneWhen: `The update has one progress section, one risk section, one metrics snapshot, and one explicit ask.`,
      investorSafeSummary: `${recommendedDecision} The next founder action is to ${lowerFirst(founderAction)}`
    };
  }

  const decisions = structuredContextValue(fields, "decisions");
  const nextWeek = structuredContextValue(fields, "nextWeek");
  const isProductFeedback = /product feedback|roadmap|customer feedback/i.test(diagnosis.rawInput);
  const founderAction = nextWeek
    ? asSentence(nextWeek)
    : isProductFeedback
      ? "Choose one product feedback theme to test this week and park the rest."
      : "Choose one operating focus for next week and close or defer the rest of the decision queue.";
  const recommendedDecision = decisions
    ? asDecisionQuestion(decisions)
    : isProductFeedback
      ? "Decide which product feedback theme deserves founder attention next week."
      : "Decide the one operating focus that should receive founder attention next week.";
  const diagnosisCopy = decisions
    ? "Weekly Operating Review: the bottleneck is the unresolved founder decision, not more context."
    : isProductFeedback
      ? "Weekly Operating Review: the bottleneck is prioritization, not customer feedback volume."
      : "Weekly Operating Review: the bottleneck is operating focus, not more context.";

  return {
    title: `Weekly Operating Review: ${subject}`,
    problem: `${subject} needs one operating focus because the current context is mixed, thin, or scattered.`,
    diagnosis: diagnosisCopy,
    recommendedDecision,
    founderAction,
    doneWhen: "The focus has one owner, one metric, and one review date.",
    investorSafeSummary: `Weekly Operating Review: ${recommendedDecision} The next founder action is to ${lowerFirst(founderAction)}`
  };
}

function evidenceFromDiagnosis(diagnosis: FounderDiagnosis): string {
  const riskSignals = diagnosis.extractedRiskSignals.filter((signal) => !signal.toLowerCase().includes("too thin"));
  const source = contextSourceLabelForId(diagnosis.contextSource);
  const evidence: string[] = [];

  if (riskSignals.length) {
    evidence.push(`Risk signals: ${riskSignals.join("; ")}.`);
  }

  if (diagnosis.extractedCompaniesOrDeals.length) {
    evidence.push(`Named context: ${diagnosis.extractedCompaniesOrDeals.join(", ")}.`);
  }

  if (diagnosis.matchedKeywords.length) {
    evidence.push(`Operating signals: ${diagnosis.matchedKeywords.slice(0, 6).join(", ")}.`);
  }

  const structuredEvidence = structuredEvidenceLines(diagnosis.structuredContext);

  if (structuredEvidence.length) {
    evidence.push(`Structured context:\n${structuredEvidence.map((line) => `- ${line}`).join("\n")}`);
  }

  if (!evidence.length) {
    evidence.push("The notes were too thin to produce strong operating evidence.");
  }

  evidence.push(`Source label: ${source}.`);

  return evidence.join("\n");
}

function assumptionsFromMissingContext(diagnosis: FounderDiagnosis): MemoAssumption[] {
  return diagnosis.missingContext.map((item) => ({
    assumption: `${item} is not provided.`,
    whyItMatters: `Prioritization may change once ${item.toLowerCase()} is known.`,
    whatToVerifyNext: `Add ${item.toLowerCase()} before finalizing the founder action.`
  }));
}

export function generateFounderMemo(
  diagnosis: FounderDiagnosis,
  settings?: Partial<Settings>
): SavedMemo {
  const subject = subjectFromDiagnosis(diagnosis, settings);
  const owner = structuredContextValue(diagnosis.structuredContext, "owner") || settings?.founderName?.trim() || "Founder";
  const workflow = diagnosis.workflow.name;
  const copy = memoCopyForWorkflow(diagnosis, subject);
  const evidence = evidenceFromDiagnosis(diagnosis);
  const reviewDate = nextWeekIsoDate();

  return {
    id: createId("memo"),
    createdAt: nowIsoString(),
    contextSource: diagnosis.contextSource,
    workflow,
    title: copy.title,
    problem: copy.problem,
    evidence,
    diagnosis: copy.diagnosis,
    recommendedDecision: copy.recommendedDecision,
    founderAction: copy.founderAction,
    doneWhen: copy.doneWhen,
    owner,
    dueDate: tomorrowIsoDate(),
    reviewDate,
    metricToWatch: diagnosis.workflow.defaultMetricToWatch,
    ignoreThisWeek: diagnosis.workflow.ignoreThisWeek,
    assumptionsMade: assumptionsFromMissingContext(diagnosis),
    sourceSnippets: extractSourceSnippets(diagnosis),
    investorSafeSummary: copy.investorSafeSummary,
    rawInput: diagnosis.rawInput
  };
}

export function applyMemoEdits(memo: SavedMemo, patch: Partial<SavedMemo>): SavedMemo {
  const nextMemo = { ...memo, ...patch };

  if ("founderAction" in patch || "recommendedDecision" in patch) {
    nextMemo.investorSafeSummary = [
      `${nextMemo.workflow}: ${withTerminalPunctuation(nextMemo.recommendedDecision)}`,
      `Founder action: ${withTerminalPunctuation(nextMemo.founderAction)}`
    ].join(" ");
  }

  return nextMemo;
}

export function memoToFounderAction(memo: SavedMemo): SavedFounderAction {
  return {
    id: createId("action"),
    createdAt: nowIsoString(),
    contextSource: memo.contextSource,
    workflow: memo.workflow,
    founderAction: memo.founderAction,
    ...(memo.doneWhen ? { doneWhen: memo.doneWhen } : {}),
    whyItMatters: memo.diagnosis,
    sourceMemoId: memo.id,
    owner: memo.owner,
    priority: priorityForWorkflow(memo.workflow),
    dueDate: memo.dueDate,
    status: "Open",
    metricToWatch: memo.metricToWatch,
    followUpResult: "",
    decisionStatus: "Open"
  };
}

export function memoToDecision(memo: SavedMemo): SavedDecision {
  return {
    id: createId("decision"),
    createdAt: nowIsoString(),
    sourceMemoId: memo.id,
    contextSource: memo.contextSource,
    workflow: memo.workflow,
    decisionRecommended: memo.recommendedDecision,
    evidenceUsed: memo.evidence,
    actionAssigned: memo.founderAction,
    owner: memo.owner,
    metricToWatch: memo.metricToWatch,
    reviewDate: memo.reviewDate ?? nextWeekIsoDate(),
    outcomeNote: "",
    status: "Open"
  };
}

export function formatMemoForCopy(memo: SavedMemo): string {
  const assumptions = memo.assumptionsMade
    .map(
      (item) =>
        `Assumption: ${item.assumption}\nWhy it matters: ${item.whyItMatters}\nWhat to verify next: ${item.whatToVerifyNext}`
    )
    .join("\n\n");
  const sourceSupport = memo.sourceSnippets?.length
    ? memo.sourceSnippets.map((snippet) => `${snippet.reason}: ${snippet.text}`).join("\n")
    : "No source snippets captured.";

  return [
    memo.title,
    "",
    `Source\n${contextSourceLabelForId(memo.contextSource)}`,
    `Founder action\n${memo.founderAction}`,
    `Done when\n${memo.doneWhen ?? "Not provided"}`,
    `Recommended decision\n${memo.recommendedDecision}`,
    `Review date\n${memo.reviewDate ?? "Not set"}`,
    `Problem\n${memo.problem}`,
    `Diagnosis\n${memo.diagnosis}`,
    `Evidence\n${memo.evidence}`,
    `Source support\n${sourceSupport}`,
    `Owner\n${memo.owner}`,
    `Due date\n${memo.dueDate}`,
    `Metric to watch\n${memo.metricToWatch}`,
    `What to ignore this week\n${memo.ignoreThisWeek}`,
    `Assumptions made\n${assumptions}`,
    `Investor-safe summary\n${memo.investorSafeSummary}`
  ].join("\n\n");
}

export function generateInvestorUpdateVersions(
  memo: SavedMemo,
  options: {
    reportingPeriod?: string;
    keyWins?: string;
    keyRisks?: string;
    investorAsks?: string;
    tone?: string;
  } = {}
): InvestorUpdateVersions {
  const period = options.reportingPeriod?.trim() || "Current period";
  const wins = options.keyWins?.trim() || "Progress is described in the source memo.";
  const risks = options.keyRisks?.trim() || memo.problem;
  const asks = options.investorAsks?.trim() || memo.recommendedDecision;
  const tone = options.tone?.trim() || "Neutral";

  return {
    fullInvestorUpdate: [
      `Reporting period: ${period}`,
      `Tone: ${tone}`,
      `Progress: ${wins}`,
      `Risk: ${risks}`,
      `Decision: ${memo.recommendedDecision}`,
      `Founder action: ${memo.founderAction}`,
      `Metric to watch: ${memo.metricToWatch}`,
      `Ask: ${asks}`
    ].join("\n\n"),
    whatsappShortVersion: `${period}: ${memo.investorSafeSummary} Ask: ${asks}`,
    boardStyleVersion: [
      `Period: ${period}`,
      `Operating diagnosis: ${memo.diagnosis}`,
      `Evidence used: ${memo.evidence}`,
      `Decision needed: ${memo.recommendedDecision}`,
      `Action owner: ${memo.owner}`,
      `Metric to watch: ${memo.metricToWatch}`
    ].join("\n")
  };
}
