import type { WorkflowDefinition, WorkflowId } from "./types";

export const WORKFLOWS: WorkflowDefinition[] = [
  {
    id: "revenue-rescue",
    name: "Revenue Rescue",
    path: "/workflows/revenue-rescue",
    purpose: "Diagnose stuck deals, stale follow-ups, pricing concerns, and pipeline leakage.",
    problemItSolves: "Late-stage revenue motion is slipping and the founder needs to know which follow-up matters now.",
    bestInputToPaste: "Deal notes, CRM exports, proposal updates, pricing concerns, stale follow-ups, or pipeline notes.",
    outputGenerated: "A Revenue Rescue memo with one founder action and one decision to review next week.",
    estimatedTime: "3 minutes",
    keywords: [
      "proposal",
      "demo",
      "pricing",
      "stuck",
      "follow-up",
      "follow up",
      "pipeline",
      "lead",
      "close",
      "closing",
      "negotiation",
      "deal",
      "crm",
      "prospect",
      "sales"
    ],
    missingContext: [
      "Deal value",
      "Owner",
      "Last activity date",
      "Next step",
      "Close probability"
    ],
    recommendedNextStep: "Generate a Revenue Rescue memo and prioritize the highest-risk follow-up.",
    defaultMetricToWatch: "Proposal-to-close conversion next 7 days.",
    ignoreThisWeek: "Do not spend this week optimizing top-of-funnel volume until stale late-stage follow-up is resolved."
  },
  {
    id: "weekly-review",
    name: "Weekly Operating Review",
    path: "/workflows/weekly-review",
    purpose: "Turn the week into one operating memo and review last week's decision.",
    problemItSolves: "The founder has scattered weekly context and needs one operating focus for the next week.",
    bestInputToPaste: "Weekly notes, founder reflections, metric snapshots, stuck items, surprises, and decision needs.",
    outputGenerated: "A weekly operating memo with one founder action and one decision to review next week.",
    estimatedTime: "5 minutes",
    keywords: [],
    missingContext: [
      "What moved this week",
      "What got stuck",
      "Decisions needed",
      "Next week priorities"
    ],
    recommendedNextStep: "Generate a weekly operating memo and identify the one decision that needs founder attention.",
    defaultMetricToWatch: "Next week priority completion rate.",
    ignoreThisWeek: "Do not add new priorities until the current founder decision queue is closed."
  },
  {
    id: "investor-update",
    name: "Investor Update",
    path: "/workflows/investor-update",
    purpose: "Turn saved memos or fresh context into an investor-safe update.",
    problemItSolves: "The founder needs to explain progress, risks, metrics, and asks without oversharing messy internals.",
    bestInputToPaste: "Saved memos, monthly context, board notes, investor asks, runway notes, growth notes, and risk notes.",
    outputGenerated: "An investor-safe memo plus full, short, and board-style update versions.",
    estimatedTime: "6 minutes",
    keywords: [
      "investor",
      "update",
      "board",
      "raise",
      "fundraising",
      "metrics",
      "ask",
      "monthly update",
      "runway",
      "burn",
      "growth"
    ],
    missingContext: [
      "Reporting period",
      "Key wins",
      "Key risks",
      "Investor asks",
      "Metrics snapshot"
    ],
    recommendedNextStep: "Generate an investor-safe update from the messy context.",
    defaultMetricToWatch: "Investor asks closed or advanced this month.",
    ignoreThisWeek: "Do not over-explain every internal issue. Keep the investor narrative focused on progress, risks, and asks."
  },
  {
    id: "onboarding-risk",
    name: "Onboarding Risk",
    path: "/workflows/onboarding-risk",
    purpose: "Identify customers stuck after close-won before activation.",
    problemItSolves: "Closed customers are not fully activated and founder intervention may be needed.",
    bestInputToPaste: "Close-won notes, onboarding blockers, activation notes, implementation updates, customer success notes.",
    outputGenerated: "An onboarding risk memo with one founder action and one decision to review next week.",
    estimatedTime: "4 minutes",
    keywords: [
      "closed-won",
      "activation",
      "onboarding",
      "blocker",
      "customer success",
      "setup",
      "implementation",
      "go-live",
      "activated",
      "customer blocker"
    ],
    missingContext: [
      "Customer name",
      "Activation stage",
      "Blocker",
      "Owner",
      "Next milestone"
    ],
    recommendedNextStep: "Generate an onboarding risk memo and identify which customer needs founder intervention.",
    defaultMetricToWatch: "Activation rate of high-value customers this week.",
    ignoreThisWeek: "Do not chase new activation experiments until the highest-risk customer blocker is resolved."
  },
  {
    id: "hiring-bottleneck",
    name: "Hiring Bottleneck",
    path: "/workflows/hiring-bottleneck",
    purpose: "Help founders decide which hiring bottleneck needs action this week.",
    problemItSolves: "Hiring motion is stuck and the founder needs to clarify the next decision for one role or candidate.",
    bestInputToPaste: "Role notes, candidate notes, interview feedback, offer concerns, recruiter notes, or hiring pipeline notes.",
    outputGenerated: "A hiring bottleneck memo with one founder action and one decision to review next week.",
    estimatedTime: "4 minutes",
    keywords: [
      "hiring",
      "candidate",
      "role",
      "interview",
      "offer",
      "trial task",
      "recruiter",
      "talent",
      "hiring pipeline"
    ],
    missingContext: [
      "Role",
      "Candidate stage",
      "Hiring priority",
      "Owner",
      "Next step"
    ],
    recommendedNextStep: "Generate a hiring bottleneck memo and decide which role or candidate needs action this week.",
    defaultMetricToWatch: "Decision cycle time for priority role.",
    ignoreThisWeek: "Do not add more candidates until the current bottleneck role or decision is clarified."
  }
];

export function getWorkflowById(id: WorkflowId): WorkflowDefinition {
  const workflow = WORKFLOWS.find((item) => item.id === id);

  if (!workflow) {
    return WORKFLOWS[1];
  }

  return workflow;
}
