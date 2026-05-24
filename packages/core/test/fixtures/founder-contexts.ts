import type { WorkflowName } from "../../src/index";

export interface FounderContextFixture {
  name: string;
  input: string;
  expectedWorkflow: WorkflowName;
  expectedKeyRiskSignal: string;
  expectedFounderActionTheme: string;
}

export const founderContextFixtures: FounderContextFixture[] = [
  {
    name: "GTM pipeline leakage",
    input:
      "FinCore Labs is stuck in negotiation after the proposal and a pricing concern. BrightLayer AI has no reply after follow-up. The founder owns the next deal decision but pipeline notes are scattered.",
    expectedWorkflow: "Revenue Rescue",
    expectedKeyRiskSignal: "Pricing concern detected",
    expectedFounderActionTheme: "follow-up"
  },
  {
    name: "Sales to onboarding handoff breakdown",
    input:
      "Northstar Ops is closed-won but onboarding is blocked. Customer success says setup is waiting on implementation details and activation is at risk before go-live.",
    expectedWorkflow: "Onboarding Risk",
    expectedKeyRiskSignal: "Post-sale activation risk detected",
    expectedFounderActionTheme: "blocker"
  },
  {
    name: "Product feedback scattered across calls",
    input:
      "Three customers mentioned different roadmap changes. The founder has call notes, product feedback, and unclear priority tradeoffs but no single operating focus for next week.",
    expectedWorkflow: "Weekly Operating Review",
    expectedKeyRiskSignal: "Context is too thin to extract strong risk signals",
    expectedFounderActionTheme: "operating focus"
  },
  {
    name: "Hiring pipeline ownership confusion",
    input:
      "Hiring for the first customer success role is stuck. Candidate interviews are complete, the trial task has feedback, and the recruiter does not know who owns the offer decision.",
    expectedWorkflow: "Hiring Bottleneck",
    expectedKeyRiskSignal: "Hiring bottleneck detected",
    expectedFounderActionTheme: "hiring bottleneck"
  },
  {
    name: "Investor update preparation chaos",
    input:
      "The investor update is due before the board check-in. Runway, burn, growth metrics, and the fundraising ask are spread across notes with no clear monthly update narrative.",
    expectedWorkflow: "Investor Update",
    expectedKeyRiskSignal: "Investor narrative need detected",
    expectedFounderActionTheme: "investor update"
  },
  {
    name: "Weekly decision review context",
    input:
      "Last week the founder chose one retention focus. This week progress moved, ownership drifted, and the decision queue needs review before choosing next week priorities.",
    expectedWorkflow: "Weekly Operating Review",
    expectedKeyRiskSignal: "Context is too thin to extract strong risk signals",
    expectedFounderActionTheme: "operating focus"
  }
];
