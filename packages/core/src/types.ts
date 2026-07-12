import type { ContextSourceId } from "./contextSources";

export type WorkflowId =
  | "revenue-rescue"
  | "weekly-review"
  | "investor-update"
  | "onboarding-risk"
  | "hiring-bottleneck";

export type WorkflowName =
  | "Revenue Rescue"
  | "Weekly Operating Review"
  | "Investor Update"
  | "Onboarding Risk"
  | "Hiring Bottleneck";

export type DiagnosisConfidence = "High" | "Medium" | "Low";
export type Priority = "Low" | "Medium" | "High" | "Critical";
export type Status = "Open" | "In Progress" | "Done" | "Blocked" | "Reviewed";

export interface WorkflowDefinition {
  id: WorkflowId;
  name: WorkflowName;
  path: string;
  purpose: string;
  problemItSolves: string;
  bestInputToPaste: string;
  outputGenerated: string;
  estimatedTime: string;
  keywords: string[];
  missingContext: string[];
  recommendedNextStep: string;
  defaultMetricToWatch: string;
  ignoreThisWeek: string;
}

export interface StructuredContextField {
  key: string;
  label: string;
  value: string;
}

export interface FounderDiagnosis {
  id: string;
  createdAt: string;
  contextSource: ContextSourceId;
  workflow: WorkflowDefinition;
  confidence: DiagnosisConfidence;
  matchedKeywords: string[];
  extractedCompaniesOrDeals: string[];
  extractedRiskSignals: string[];
  structuredContext: StructuredContextField[];
  missingContext: string[];
  recommendedNextStep: string;
  rawInput: string;
}

export interface MemoAssumption {
  assumption: string;
  whyItMatters: string;
  whatToVerifyNext: string;
}

export interface SourceSnippet {
  id: string;
  text: string;
  reason: string;
}

export interface SavedMemo {
  id: string;
  createdAt: string;
  contextSource?: ContextSourceId;
  workflow: WorkflowName;
  title: string;
  problem: string;
  evidence: string;
  diagnosis: string;
  recommendedDecision: string;
  founderAction: string;
  doneWhen?: string;
  owner: string;
  dueDate: string;
  reviewDate?: string;
  metricToWatch: string;
  ignoreThisWeek: string;
  assumptionsMade: MemoAssumption[];
  sourceSnippets?: SourceSnippet[];
  investorSafeSummary: string;
  rawInput: string;
}

export interface SavedFounderAction {
  id: string;
  createdAt: string;
  contextSource?: ContextSourceId;
  workflow: WorkflowName;
  founderAction: string;
  doneWhen?: string;
  whyItMatters: string;
  sourceMemoId: string;
  owner: string;
  priority: Priority;
  dueDate: string;
  status: Status;
  metricToWatch: string;
  followUpResult: string;
  decisionStatus: Status;
}

export interface SavedDecision {
  id: string;
  createdAt: string;
  sourceMemoId?: string;
  contextSource?: ContextSourceId;
  workflow: WorkflowName;
  decisionRecommended: string;
  evidenceUsed: string;
  actionAssigned: string;
  owner: string;
  metricToWatch: string;
  reviewDate: string;
  outcomeNote: string;
  status: Status;
}

export interface Settings {
  founderName: string;
  companyName: string;
  companyStage: string;
  industry: string;
  icp: string;
  gtmMotion: string;
  defaultWeeklyReviewDay: string;
}

export interface InvestorUpdateVersions {
  fullInvestorUpdate: string;
  whatsappShortVersion: string;
  boardStyleVersion: string;
}
