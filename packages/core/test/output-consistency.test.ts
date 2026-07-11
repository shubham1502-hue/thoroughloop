import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  STORAGE_KEYS,
  createDiagnosis,
  extractCompanyOrDealNames,
  generateFounderMemo,
  prepareSavedLoopRecords,
  saveSavedLoop,
  type SavedMemo,
  type StorageAdapter,
  type StructuredContextField,
  type WorkflowId
} from "../src/index";

class MemoryStorageAdapter implements StorageAdapter {
  protected readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

function field(key: string, label: string, value: string): StructuredContextField {
  return { key, label, value };
}

describe("structured workflow context", () => {
  const cases: Array<{
    workflowId: WorkflowId;
    fields: StructuredContextField[];
    absentMissingContext: string[];
  }> = [
    {
      workflowId: "revenue-rescue",
      fields: [
        field("dealName", "Deal name", "FinCore Labs"),
        field("owner", "Owner", "Founder"),
        field("lastActivity", "Last activity", "Pricing discussion 12 days ago"),
        field("nextStep", "Next step", "Confirm the commercial objection")
      ],
      absentMissingContext: ["Owner", "Last activity date", "Next step"]
    },
    {
      workflowId: "weekly-review",
      fields: [
        field("moved", "What moved this week", "Two enterprise demos completed"),
        field("stuck", "What got stuck", "Pricing follow-up"),
        field("decisions", "Decisions needed", "Whether to pause outbound"),
        field("nextWeek", "Next week priorities", "Close the pricing loop")
      ],
      absentMissingContext: [
        "What moved this week",
        "What got stuck",
        "Decisions needed",
        "Next week priorities"
      ]
    },
    {
      workflowId: "investor-update",
      fields: [
        field("reportingPeriod", "Reporting period", "July 2026"),
        field("keyWins", "Key wins", "Two enterprise demos"),
        field("keyRisks", "Key risks", "Activation is flat"),
        field("investorAsks", "Investor asks", "Hiring introductions")
      ],
      absentMissingContext: ["Reporting period", "Key wins", "Key risks", "Investor asks"]
    },
    {
      workflowId: "onboarding-risk",
      fields: [
        field("customerName", "Customer name", "Northstar Ops"),
        field("onboardingStage", "Onboarding stage", "Implementation"),
        field("blocker", "Blocker", "Data mapping"),
        field("owner", "Owner", "Founder"),
        field("nextMilestone", "Next milestone", "Complete setup review")
      ],
      absentMissingContext: ["Customer name", "Activation stage", "Blocker", "Owner", "Next milestone"]
    },
    {
      workflowId: "hiring-bottleneck",
      fields: [
        field("role", "Role", "Founding Account Executive"),
        field("candidate", "Candidate", "Priya Menon"),
        field("stage", "Stage", "Final interview"),
        field("owner", "Owner", "Founder"),
        field("nextStep", "Next step", "Decide whether the role needs a closer")
      ],
      absentMissingContext: ["Role", "Candidate stage", "Owner", "Next step"]
    }
  ];

  for (const testCase of cases) {
    it(`uses supplied ${testCase.workflowId} fields in evidence and missing-context checks`, () => {
      const rawInput = "The founder needs one documented decision from these notes.";
      const diagnosis = createDiagnosis(
        rawInput,
        testCase.workflowId,
        "general_notes",
        testCase.fields
      );
      const memo = generateFounderMemo(diagnosis, { companyName: "" });

      for (const item of testCase.absentMissingContext) {
        assert.ok(!diagnosis.missingContext.includes(item), `${item} should not remain missing`);
      }

      for (const suppliedField of testCase.fields) {
        assert.match(memo.evidence, new RegExp(`${suppliedField.label}: ${suppliedField.value}`, "i"));
      }

      for (const snippet of memo.sourceSnippets ?? []) {
        assert.ok(
          rawInput.includes(snippet.text) || snippet.text.startsWith("No strong source snippet found"),
          "source support must come from raw input"
        );
      }
    });
  }

  it("uses structured fields to make weekly and hiring actions specific", () => {
    const weekly = generateFounderMemo(
      createDiagnosis("Weekly notes need one decision.", "weekly-review", "general_notes", [
        field("nextWeek", "Next week priorities", "Close the pricing loop and assign onboarding ownership"),
        field("decisions", "Decisions needed", "Whether to pause new outbound work")
      ])
    );
    const hiring = generateFounderMemo(
      createDiagnosis("Hiring feedback is split.", "hiring-bottleneck", "general_notes", [
        field("role", "Role", "Founding Account Executive"),
        field("candidate", "Candidate", "Priya Menon"),
        field("nextStep", "Next step", "Decide whether the role needs a closer or pipeline builder")
      ])
    );

    assert.match(weekly.founderAction, /Close the pricing loop and assign onboarding ownership/);
    assert.match(weekly.recommendedDecision, /pause new outbound work/i);
    assert.match(hiring.founderAction, /Founding Account Executive/);
    assert.match(hiring.founderAction, /Priya Menon/);
  });
});

describe("subject and entity boundaries", () => {
  it("never produces a blank subject when settings and named context are empty", () => {
    const expectations: Array<[WorkflowId, string]> = [
      ["revenue-rescue", "the priority revenue account"],
      ["weekly-review", "this week's operating focus"],
      ["investor-update", "this investor update"],
      ["onboarding-risk", "the onboarding risk"],
      ["hiring-bottleneck", "the priority hiring decision"]
    ];

    for (const [workflowId, fallback] of expectations) {
      const memo = generateFounderMemo(createDiagnosis("", workflowId), { companyName: "   " });
      assert.ok(memo.title.trim());
      assert.match(memo.title, new RegExp(fallback.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
      assert.doesNotMatch(memo.title, /undefined|null/);
    }
  });

  it("extracts named entities without appending workflow field labels", () => {
    assert.deepEqual(extractCompanyOrDealNames("Owner: Priya Menon"), ["Priya Menon"]);
    assert.deepEqual(extractCompanyOrDealNames("Priya Menon\nStage: Final interview"), ["Priya Menon"]);
    assert.deepEqual(extractCompanyOrDealNames("Company: FinCore Labs"), ["FinCore Labs"]);
    assert.deepEqual(extractCompanyOrDealNames("Account: Acme Corp\nStage: Negotiation"), ["Acme Corp"]);
    assert.deepEqual(extractCompanyOrDealNames("Role: Founding Account Executive"), []);
    assert.deepEqual(extractCompanyOrDealNames("Stage: Final interview\nOwner: Founder"), []);
  });
});

describe("canonical saved loop records", () => {
  function editedMemo(): SavedMemo {
    const memo = generateFounderMemo(
      createDiagnosis("FinCore Labs is stuck after pricing and the proposal is open.", "revenue-rescue")
    );

    return {
      ...memo,
      founderAction: "Call FinCore before Friday.",
      doneWhen: "The buyer confirms one written next step.",
      recommendedDecision: "Should founder-led follow-up continue next week?",
      reviewDate: "2026-07-21",
      metricToWatch: "Accounts with a confirmed next step"
    };
  }

  it("produces the same canonical Revenue Rescue output for detected and forced workflow entry", () => {
    const input =
      "FinCore Labs is stuck in negotiation after pricing and the proposal needs founder follow-up.";
    const detectedMemo = generateFounderMemo(createDiagnosis(input));
    const forcedMemo = generateFounderMemo(createDiagnosis(input, "revenue-rescue"));

    for (const key of [
      "workflow",
      "title",
      "problem",
      "diagnosis",
      "recommendedDecision",
      "founderAction",
      "doneWhen",
      "metricToWatch"
    ] as const) {
      assert.equal(forcedMemo[key], detectedMemo[key]);
    }
  });

  it("prepares memo, action, and decision from the same edited loop", () => {
    const memo = editedMemo();
    const records = prepareSavedLoopRecords(memo);

    assert.equal(records.memo.id, memo.id);
    assert.equal(records.founderAction.sourceMemoId, memo.id);
    assert.equal(records.decision.sourceMemoId, memo.id);
    assert.equal(records.founderAction.founderAction, memo.founderAction);
    assert.equal(records.founderAction.doneWhen, memo.doneWhen);
    assert.equal(records.founderAction.metricToWatch, memo.metricToWatch);
    assert.equal(records.decision.decisionRecommended, memo.recommendedDecision);
    assert.equal(records.decision.reviewDate, memo.reviewDate);
    assert.equal(records.decision.metricToWatch, memo.metricToWatch);
  });

  it("writes all three records once and preserves unrelated settings", async () => {
    const adapter = new MemoryStorageAdapter();
    const memo = editedMemo();
    adapter.setItem(STORAGE_KEYS.settings, JSON.stringify({ founderName: "Example Founder" }));

    await saveSavedLoop(adapter, memo);
    await saveSavedLoop(adapter, memo);

    assert.equal(JSON.parse(adapter.getItem(STORAGE_KEYS.memos) ?? "[]").length, 1);
    assert.equal(JSON.parse(adapter.getItem(STORAGE_KEYS.actions) ?? "[]").length, 1);
    assert.equal(JSON.parse(adapter.getItem(STORAGE_KEYS.decisions) ?? "[]").length, 1);
    assert.equal(
      adapter.getItem(STORAGE_KEYS.settings),
      JSON.stringify({ founderName: "Example Founder" })
    );
  });

  it("restores all prior loop collections when one local write fails", async () => {
    class FailingStorageAdapter extends MemoryStorageAdapter {
      private shouldFail = false;

      armFailure(): void {
        this.shouldFail = true;
      }

      override setItem(key: string, value: string): void {
        if (key === STORAGE_KEYS.decisions && this.shouldFail) {
          this.shouldFail = false;
          throw new Error("Simulated decision write failure");
        }

        super.setItem(key, value);
      }
    }

    const adapter = new FailingStorageAdapter();
    const previousMemos = JSON.stringify([{ id: "memo_previous" }]);
    const previousActions = JSON.stringify([{ id: "action_previous" }]);
    const previousDecisions = JSON.stringify([{ id: "decision_previous" }]);
    adapter.setItem(STORAGE_KEYS.memos, previousMemos);
    adapter.setItem(STORAGE_KEYS.actions, previousActions);
    adapter.setItem(STORAGE_KEYS.decisions, previousDecisions);
    adapter.armFailure();

    await assert.rejects(saveSavedLoop(adapter, editedMemo()), /Simulated decision write failure/);
    assert.equal(adapter.getItem(STORAGE_KEYS.memos), previousMemos);
    assert.equal(adapter.getItem(STORAGE_KEYS.actions), previousActions);
    assert.equal(adapter.getItem(STORAGE_KEYS.decisions), previousDecisions);
  });
});
