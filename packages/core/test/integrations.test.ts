import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createDiagnosis,
  generateFounderMemo,
  MAX_INTAKE_CONTEXT_LENGTH,
  memoToDecision,
  memoToFounderAction,
  normalizeIntakeRequest,
  type IntakeNormalizationResult,
  type OperatingSignal
} from "../src/index";

function expectSignal(result: IntakeNormalizationResult): OperatingSignal {
  assert.equal(result.ok, true);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return result.data;
}

function expectError(result: IntakeNormalizationResult) {
  assert.equal(result.ok, false);

  if (result.ok) {
    throw new Error("Expected intake normalization to fail.");
  }

  return result.error;
}

describe("integration intake normalization", () => {
  it("normalizes valid manual payloads with default source and metadata", () => {
    const signal = expectSignal(
      normalizeIntakeRequest({
        context: "Founder notes show mixed weekly progress and one unresolved decision."
      })
    );

    assert.equal(signal.source, "manual");
    assert.equal(signal.workflow, undefined);
    assert.equal(signal.context, "Founder notes show mixed weekly progress and one unresolved decision.");
    assert.deepEqual(signal.metadata, {});
    assert.ok(signal.adapterNotes.includes("Manual context passed through without external adapter."));
    assert.doesNotThrow(() => new Date(signal.normalizedAt).toISOString());
  });

  it("normalizes valid CRM payloads and supports the founder loop", () => {
    const signal = expectSignal(
      normalizeIntakeRequest({
        source: "crm",
        workflow: "revenue-rescue",
        context:
          "Acme is qualified, demo requested for Friday, no owner assigned, and pricing objection is unresolved.",
        metadata: {
          company: "Acme",
          priority: "high",
          owner: "unassigned"
        }
      })
    );
    const diagnosis = createDiagnosis(signal.context, signal.workflow);
    const memo = generateFounderMemo(diagnosis);
    const founderAction = memoToFounderAction(memo);
    const decision = memoToDecision(memo);

    assert.equal(signal.source, "crm");
    assert.equal(signal.workflow, "revenue-rescue");
    assert.equal(diagnosis.workflow.id, "revenue-rescue");
    assert.match(memo.diagnosis, /Revenue Rescue/);
    assert.ok(founderAction.founderAction.length > 0);
    assert.equal(decision.actionAssigned, founderAction.founderAction);
  });

  it("normalizes valid Slack payloads", () => {
    const signal = expectSignal(
      normalizeIntakeRequest({
        source: "slack",
        context:
          "Thread says onboarding is blocked, customer owner is unclear, and founder follow up is needed this week."
      })
    );

    assert.equal(signal.source, "slack");
    assert.ok(signal.adapterNotes.includes("Slack note normalized for scattered operating context."));
    assert.match(signal.context, /onboarding is blocked/);
  });

  it("normalizes valid Google Sheets payloads", () => {
    const signal = expectSignal(
      normalizeIntakeRequest({
        source: "google_sheets",
        workflow: "weekly-review",
        context:
          "Weekly sheet row shows demos up, activation flat, owner unclear, and one decision needed next Friday.",
        metadata: {
          row: 12,
          sheet: "Weekly operating review"
        }
      })
    );

    assert.equal(signal.source, "google_sheets");
    assert.equal(signal.workflow, "weekly-review");
    assert.equal(signal.metadata.row, 12);
    assert.ok(
      signal.adapterNotes.includes("Sheet row normalized for weekly metrics or operating review context.")
    );
  });

  it("normalizes valid support ticket payloads", () => {
    const signal = expectSignal(
      normalizeIntakeRequest({
        source: "support_ticket",
        workflow: "onboarding-risk",
        context:
          "Ticket TL-104 says DemoCo cannot finish setup because activation is blocked by missing admin access."
      })
    );

    assert.equal(signal.source, "support_ticket");
    assert.equal(signal.workflow, "onboarding-risk");
    assert.ok(
      signal.adapterNotes.includes("Support ticket normalized for SLA, onboarding, or customer-risk context.")
    );
  });

  it("normalizes valid purchase order payloads", () => {
    const signal = expectSignal(
      normalizeIntakeRequest({
        source: "purchase_order",
        context:
          "PO-1001 for Example Founder is approved, but fulfillment owner and delivery milestone are not assigned."
      })
    );

    assert.equal(signal.source, "purchase_order");
    assert.match(signal.context, /PO-1001/);
    assert.ok(
      signal.adapterNotes.includes(
        "Document signal normalized for operational handoff or fulfillment-risk context."
      )
    );
  });

  it("rejects missing context", () => {
    const error = expectError(normalizeIntakeRequest({ source: "crm" }));

    assert.equal(error.code, "MISSING_CONTEXT");
    assert.equal(error.retryable, false);
  });

  it("rejects empty context", () => {
    const error = expectError(normalizeIntakeRequest({ context: "   " }));

    assert.equal(error.code, "MISSING_CONTEXT");
  });

  it("rejects invalid source", () => {
    const error = expectError(
      normalizeIntakeRequest({
        source: "email",
        context: "A founder note is ready for diagnosis."
      })
    );

    assert.equal(error.code, "UNSUPPORTED_SOURCE");
  });

  it("rejects invalid workflow", () => {
    const error = expectError(
      normalizeIntakeRequest({
        workflow: "sales-dashboard",
        context: "A founder note is ready for diagnosis."
      })
    );

    assert.equal(error.code, "INVALID_WORKFLOW");
  });

  it("rejects metadata that is not a plain object", () => {
    const error = expectError(
      normalizeIntakeRequest({
        context: "A founder note is ready for diagnosis.",
        metadata: ["not", "an", "object"]
      })
    );

    assert.equal(error.code, "INVALID_CONTEXT");
  });

  it("rejects oversized payloads", () => {
    const error = expectError(
      normalizeIntakeRequest({
        context: "x".repeat(MAX_INTAKE_CONTEXT_LENGTH + 1)
      })
    );

    assert.equal(error.code, "PAYLOAD_TOO_LARGE");
  });
});
