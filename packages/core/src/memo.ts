import { contextSourceLabelForId } from "./contextSources";
import { nextWeekIsoDate, nowIsoString, tomorrowIsoDate } from "./date";
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

function subjectFromDiagnosis(diagnosis: FounderDiagnosis, settings?: Partial<Settings>): string {
  return diagnosis.extractedCompaniesOrDeals[0] ?? settings?.companyName ?? "the current operating focus";
}

function priorityForWorkflow(workflow: WorkflowName): Priority {
  if (workflow === "Revenue Rescue" || workflow === "Onboarding Risk") {
    return "High";
  }

  if (workflow === "Hiring Bottleneck") {
    return "Medium";
  }

  return "Medium";
}

function problemForWorkflow(workflow: WorkflowName, subject: string): string {
  const copy: Record<WorkflowName, string> = {
    "Revenue Rescue": `${subject} shows revenue motion risk because late-stage follow-up, pricing, or proposal activity may be slipping.`,
    "Weekly Operating Review": `${subject} needs one operating focus because the current context is mixed, thin, or scattered.`,
    "Investor Update": `${subject} needs a clearer investor narrative that separates progress, risks, and asks.`,
    "Onboarding Risk": `${subject} may be exposed to post-sale activation risk before value is fully delivered.`,
    "Hiring Bottleneck": `${subject} needs a hiring decision because the current role or candidate flow appears stuck.`
  };

  return copy[workflow];
}

function decisionForWorkflow(workflow: WorkflowName, subject: string): string {
  const copy: Record<WorkflowName, string> = {
    "Revenue Rescue": `Decide whether founder-led follow-up should focus on ${subject} before adding new top-of-funnel work.`,
    "Weekly Operating Review": `Decide the one operating focus that should receive founder attention next week.`,
    "Investor Update": `Decide the investor narrative and ask that should be shared this period.`,
    "Onboarding Risk": `Decide whether ${subject} needs founder intervention to unblock activation.`,
    "Hiring Bottleneck": `Decide which role or candidate needs founder action this week.`
  };

  return copy[workflow];
}

function actionForWorkflow(workflow: WorkflowName, subject: string): string {
  const copy: Record<WorkflowName, string> = {
    "Revenue Rescue": `Send one founder-led follow-up to the highest-risk late-stage account and confirm the next decision step.`,
    "Weekly Operating Review": "Choose one operating focus for next week and close or defer the rest of the decision queue.",
    "Investor Update": "Draft the investor update around progress, risks, metrics, and one clear ask.",
    "Onboarding Risk": `Contact the owner for ${subject} and confirm the blocker, next milestone, and date to activation.`,
    "Hiring Bottleneck": "Choose the priority hiring bottleneck and make the next candidate or role decision this week."
  };

  return copy[workflow];
}

function evidenceFromDiagnosis(diagnosis: FounderDiagnosis): string {
  const companies = diagnosis.extractedCompaniesOrDeals.length
    ? diagnosis.extractedCompaniesOrDeals.join(", ")
    : "None detected";
  const keywords = diagnosis.matchedKeywords.length ? diagnosis.matchedKeywords.join(", ") : "No strong keyword cluster";
  const signals = diagnosis.extractedRiskSignals.join("; ");
  const source = contextSourceLabelForId(diagnosis.contextSource);

  return `Source: ${source}. Workflow evidence: ${diagnosis.workflow.name}. Matched keywords: ${keywords}. Extracted companies or deal names: ${companies}. Risk signals: ${signals}.`;
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
  const owner = settings?.founderName?.trim() || "Founder";
  const workflow = diagnosis.workflow.name;
  const problem = problemForWorkflow(workflow, subject);
  const evidence = evidenceFromDiagnosis(diagnosis);
  const founderAction = actionForWorkflow(workflow, subject);
  const recommendedDecision = decisionForWorkflow(workflow, subject);

  return {
    id: createId("memo"),
    createdAt: nowIsoString(),
    contextSource: diagnosis.contextSource,
    workflow,
    title: `${workflow} memo for ${subject}`,
    problem,
    evidence,
    diagnosis: `${diagnosis.workflow.name} is the current operating diagnosis with ${diagnosis.confidence.toLowerCase()} confidence.`,
    recommendedDecision,
    founderAction,
    owner,
    dueDate: tomorrowIsoDate(),
    metricToWatch: diagnosis.workflow.defaultMetricToWatch,
    ignoreThisWeek: diagnosis.workflow.ignoreThisWeek,
    assumptionsMade: assumptionsFromMissingContext(diagnosis),
    investorSafeSummary: `${workflow}: ${recommendedDecision} The next founder action is to ${founderAction.toLowerCase()}`,
    rawInput: diagnosis.rawInput
  };
}

export function memoToFounderAction(memo: SavedMemo): SavedFounderAction {
  return {
    id: createId("action"),
    createdAt: nowIsoString(),
    contextSource: memo.contextSource,
    workflow: memo.workflow,
    founderAction: memo.founderAction,
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
    contextSource: memo.contextSource,
    workflow: memo.workflow,
    decisionRecommended: memo.recommendedDecision,
    evidenceUsed: memo.evidence,
    actionAssigned: memo.founderAction,
    owner: memo.owner,
    metricToWatch: memo.metricToWatch,
    reviewDate: nextWeekIsoDate(),
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

  return [
    memo.title,
    "",
    `Source\n${contextSourceLabelForId(memo.contextSource)}`,
    `Problem\n${memo.problem}`,
    `Evidence\n${memo.evidence}`,
    `Diagnosis\n${memo.diagnosis}`,
    `Recommended decision\n${memo.recommendedDecision}`,
    `Founder action\n${memo.founderAction}`,
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
