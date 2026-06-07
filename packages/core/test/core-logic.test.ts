import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createDiagnosis,
  CONTEXT_SOURCE_OPTIONS,
  DEFAULT_CONTEXT_SOURCE_ID,
  contextSourceLabelForId,
  extractCompanyOrDealNames,
  extractRiskSignals,
  formatMemoForCopy,
  generateFounderMemo,
  memoToDecision,
  memoToFounderAction,
  normalizeContextSourceId,
  STORAGE_KEYS
} from "../src/index";

describe("workflow detection", () => {
  it("detects revenue rescue for sales and GTM leakage context", () => {
    const diagnosis = createDiagnosis(
      "FinCore Labs is stuck after proposal. Pricing concern is unresolved and the pipeline follow-up owner is unclear."
    );

    assert.equal(diagnosis.workflow.name, "Revenue Rescue");
    assert.equal(diagnosis.confidence, "High");
    assert.ok(diagnosis.matchedKeywords.includes("proposal"));
    assert.ok(diagnosis.matchedKeywords.includes("pricing"));
    assert.ok(diagnosis.matchedKeywords.includes("pipeline"));
  });

  it("detects onboarding risk for post-sale activation context", () => {
    const diagnosis = createDiagnosis(
      "BrightLayer AI is closed-won but onboarding is blocked. The implementation owner has not cleared activation."
    );

    assert.equal(diagnosis.workflow.name, "Onboarding Risk");
    assert.equal(diagnosis.confidence, "High");
    assert.ok(diagnosis.matchedKeywords.includes("closed-won"));
    assert.ok(diagnosis.matchedKeywords.includes("onboarding"));
    assert.ok(diagnosis.matchedKeywords.includes("activation"));
  });

  it("detects hiring bottleneck for talent context", () => {
    const diagnosis = createDiagnosis(
      "Hiring for the founding account executive role is stuck after candidate interviews and the offer decision is unclear."
    );

    assert.equal(diagnosis.workflow.name, "Hiring Bottleneck");
    assert.equal(diagnosis.confidence, "High");
    assert.ok(diagnosis.matchedKeywords.includes("hiring"));
    assert.ok(diagnosis.matchedKeywords.includes("candidate"));
    assert.ok(diagnosis.matchedKeywords.includes("interview"));
  });

  it("detects investor update context", () => {
    const diagnosis = createDiagnosis(
      "The investor update needs board-ready metrics, runway, burn, growth notes, and one clear fundraising ask."
    );

    assert.equal(diagnosis.workflow.name, "Investor Update");
    assert.equal(diagnosis.confidence, "High");
    assert.ok(diagnosis.matchedKeywords.includes("investor"));
    assert.ok(diagnosis.matchedKeywords.includes("board"));
    assert.ok(diagnosis.matchedKeywords.includes("runway"));
  });

  it("falls back to weekly operating review for product feedback and roadmap noise", () => {
    const diagnosis = createDiagnosis(
      "Customers gave scattered product feedback across calls. Roadmap tradeoffs are unclear and the founder needs one next choice."
    );

    assert.equal(diagnosis.workflow.name, "Weekly Operating Review");
    assert.equal(diagnosis.confidence, "Low");
  });

  it("falls back to weekly operating review for ambiguous messy notes", () => {
    const diagnosis = createDiagnosis(
      "This week had mixed progress, unclear ownership, and too many loose decisions competing for founder attention."
    );

    assert.equal(diagnosis.workflow.name, "Weekly Operating Review");
    assert.equal(diagnosis.confidence, "Low");
  });

  it("handles empty input without crashing", () => {
    const diagnosis = createDiagnosis("");

    assert.equal(diagnosis.workflow.name, "Weekly Operating Review");
    assert.equal(diagnosis.confidence, "Low");
    assert.deepEqual(diagnosis.extractedRiskSignals, ["Context is too thin to extract strong risk signals"]);
  });
});

describe("context source metadata", () => {
  it("defaults diagnosis source to general founder notes", () => {
    const diagnosis = createDiagnosis("Weekly notes show one messy founder follow-up.");

    assert.equal(diagnosis.contextSource, DEFAULT_CONTEXT_SOURCE_ID);
    assert.equal(contextSourceLabelForId(diagnosis.contextSource), "General founder notes");
  });

  it("keeps the source option list founder-facing and complete", () => {
    const labels = CONTEXT_SOURCE_OPTIONS.map((option) => option.label);

    assert.deepEqual(labels, [
      "General founder notes",
      "Slack thread or channel notes",
      "Notion page or workspace notes",
      "CRM or sales pipeline notes",
      "Customer feedback",
      "Meeting notes",
      "Product requirements or handoff notes",
      "Hiring follow-up notes",
      "Other"
    ]);
  });

  it("falls back safely for unknown source ids", () => {
    assert.equal(normalizeContextSourceId("unknown"), DEFAULT_CONTEXT_SOURCE_ID);
    assert.equal(contextSourceLabelForId(undefined), "General founder notes");
  });

  it("persists selected source metadata through memo, action, decision, and copy text", () => {
    const diagnosis = createDiagnosis(
      "Slack thread says onboarding is blocked, customer owner is unclear, and founder follow-up is needed.",
      undefined,
      "slack"
    );
    const memo = generateFounderMemo(diagnosis);
    const action = memoToFounderAction(memo);
    const decision = memoToDecision(memo);
    const copy = formatMemoForCopy(memo);

    assert.equal(diagnosis.contextSource, "slack");
    assert.equal(memo.contextSource, "slack");
    assert.equal(action.contextSource, "slack");
    assert.equal(decision.contextSource, "slack");
    assert.match(memo.evidence, /Source: Slack thread or channel notes/);
    assert.match(copy, /Source\nSlack thread or channel notes/);
  });

  it("renders old saved memos without source metadata safely", () => {
    const memo = generateFounderMemo(createDiagnosis("A proposal is stuck after pricing."));
    const legacyMemo = { ...memo };
    delete legacyMemo.contextSource;

    assert.equal(contextSourceLabelForId(legacyMemo.contextSource), "General founder notes");
    assert.match(formatMemoForCopy(legacyMemo), /Source\nGeneral founder notes/);
  });
});

describe("signal extraction", () => {
  it("extracts bottlenecks and revenue risks from messy context", () => {
    const signals = extractRiskSignals(
      "The proposal is stuck in negotiation after pricing concerns and the buyer has no reply on the latest follow-up."
    );

    assert.ok(signals.includes("Stuck deal or blocked workflow detected"));
    assert.ok(signals.includes("Pricing concern detected"));
    assert.ok(signals.includes("Follow-up decay detected"));
    assert.ok(signals.includes("Proposal-stage risk detected"));
    assert.ok(signals.includes("Late-stage revenue risk detected"));
  });

  it("extracts onboarding, investor, and hiring decision signals", () => {
    const signals = extractRiskSignals(
      "Onboarding activation is blocked, investor board notes are due, and hiring interviews need a decision."
    );

    assert.ok(signals.includes("Post-sale activation risk detected"));
    assert.ok(signals.includes("Investor narrative need detected"));
    assert.ok(signals.includes("Hiring bottleneck detected"));
  });

  it("does not invent risk signals for thin context", () => {
    const signals = extractRiskSignals("Need to think.");

    assert.deepEqual(signals, ["Context is too thin to extract strong risk signals"]);
  });
});

describe("memo generation", () => {
  it("generates a founder-ready memo with one action and one decision", () => {
    const diagnosis = createDiagnosis(
      "FinCore Labs is stuck in negotiation after proposal and pricing concern. Founder follow-up is slipping."
    );
    const memo = generateFounderMemo(diagnosis, {
      founderName: "Shubham",
      companyName: "ThoroughLoop"
    });
    const action = memoToFounderAction(memo);
    const decision = memoToDecision(memo);

    assert.equal(memo.workflow, "Revenue Rescue");
    assert.equal(memo.owner, "Shubham");
    assert.match(memo.diagnosis, /Revenue Rescue/);
    assert.match(memo.evidence, /Risk signals:/);
    assert.match(memo.founderAction, /founder-led follow-up/i);
    assert.match(memo.recommendedDecision, /Decide whether/i);
    assert.equal(action.sourceMemoId, memo.id);
    assert.equal(action.status, "Open");
    assert.equal(decision.actionAssigned, memo.founderAction);
    assert.equal(decision.status, "Open");
  });

  it("keeps the copyable memo structured and concise enough for founder review", () => {
    const memo = generateFounderMemo(createDiagnosis(""));
    const copy = formatMemoForCopy(memo);

    assert.match(copy, /Problem\n/);
    assert.match(copy, /Diagnosis\n/);
    assert.match(copy, /Founder action\n/);
    assert.match(copy, /Recommended decision\n/);
    assert.match(copy, /Metric to watch\n/);
    assert.ok(memo.assumptionsMade.length > 0);
    assert.ok(copy.length < 5000);
  });
});

describe("company and deal name extraction", () => {
  it("extracts explicit company names from founder notes", () => {
    const names = extractCompanyOrDealNames(
      "FinCore Labs is stuck. BrightLayer AI has not replied. Northstar Ops completed demo."
    );

    assert.ok(names.includes("FinCore Labs"));
    assert.ok(names.includes("BrightLayer AI"));
    assert.ok(names.includes("Northstar Ops"));
  });

  it("returns no names when no capitalized company phrase is present", () => {
    const names = extractCompanyOrDealNames("pipeline is noisy and the founder needs one decision");

    assert.deepEqual(names, []);
  });

  it("handles mixed casing and noisy context", () => {
    const names = extractCompanyOrDealNames(
      "todo: ask BrightLayer AI for legal review, then update FinCore Labs. ignore random lower case words."
    );

    assert.ok(names.includes("BrightLayer AI"));
    assert.ok(names.includes("FinCore Labs"));
  });
});

describe("storage contracts", () => {
  it("preserves legacy Founder OS Lite storage keys", () => {
    assert.equal(STORAGE_KEYS.memos, "founder_os_lite_memos");
    assert.equal(STORAGE_KEYS.actions, "founder_os_lite_actions");
    assert.equal(STORAGE_KEYS.decisions, "founder_os_lite_decisions");
    assert.equal(STORAGE_KEYS.settings, "founder_os_lite_settings");
  });

  it("creates saved memo, action, and decision shapes from one diagnosis", () => {
    const memo = generateFounderMemo(createDiagnosis("A proposal is stuck and pricing needs founder follow-up."));
    const action = memoToFounderAction(memo);
    const decision = memoToDecision(memo);

    assert.ok(memo.id.startsWith("memo_"));
    assert.equal(typeof memo.rawInput, "string");
    assert.ok(action.id.startsWith("action_"));
    assert.equal(action.sourceMemoId, memo.id);
    assert.ok(decision.id.startsWith("decision_"));
    assert.equal(decision.evidenceUsed, memo.evidence);
  });
});
