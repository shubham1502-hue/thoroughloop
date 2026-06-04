import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  MAX_INTAKE_CONTEXT_LENGTH,
  normalizeWebhookPayload,
  type NormalizedWebhookSignal,
  type WebhookNormalizationResult
} from "../src/index";

function expectWebhookSignal(result: WebhookNormalizationResult): NormalizedWebhookSignal {
  assert.equal(result.ok, true);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return result.data;
}

function expectWebhookError(result: WebhookNormalizationResult) {
  assert.equal(result.ok, false);

  if (result.ok) {
    throw new Error("Expected webhook normalization to fail.");
  }

  return result.error;
}

describe("webhook payload normalization", () => {
  it("normalizes valid Make payloads using text", () => {
    const signal = expectWebhookSignal(
      normalizeWebhookPayload({
        platform: "make",
        source: "crm",
        workflow: "revenue-rescue",
        text: "Acme is qualified, demo requested for Friday, no owner assigned, and pricing objection unresolved.",
        fields: {
          company: "Acme",
          priority: "high",
          owner: "unassigned"
        }
      })
    );

    assert.equal(signal.platform, "make");
    assert.equal(signal.intakeRequest.source, "crm");
    assert.equal(signal.intakeRequest.workflow, "revenue-rescue");
    assert.equal(
      signal.intakeRequest.context,
      "Acme is qualified, demo requested for Friday, no owner assigned, and pricing objection unresolved."
    );
    assert.deepEqual(signal.intakeRequest.metadata, {
      company: "Acme",
      priority: "high",
      owner: "unassigned",
      webhookPlatform: "make"
    });
    assert.ok(signal.webhookNotes.includes("Make webhook normalized into ThoroughLoop intake request."));
  });

  it("normalizes valid Zapier payloads using message", () => {
    const signal = expectWebhookSignal(
      normalizeWebhookPayload({
        platform: "zapier",
        source: "slack",
        message: "Founder thread says onboarding is blocked and the support owner is unclear.",
        fields: {
          channel: "founder-updates",
          thread: "demo-thread-001"
        }
      })
    );

    assert.equal(signal.platform, "zapier");
    assert.equal(signal.intakeRequest.source, "slack");
    assert.equal(
      signal.intakeRequest.context,
      "Founder thread says onboarding is blocked and the support owner is unclear."
    );
    assert.equal(signal.intakeRequest.metadata?.webhookPlatform, "zapier");
    assert.ok(signal.webhookNotes.includes("Zapier webhook normalized into ThoroughLoop intake request."));
  });

  it("normalizes valid n8n payloads using context", () => {
    const signal = expectWebhookSignal(
      normalizeWebhookPayload({
        platform: "n8n",
        source: "google_sheets",
        context:
          "Weekly row shows demos up, activation flat, two decisions stuck, and next week priorities unclear.",
        fields: {
          sheet: "Weekly operating review",
          row: 12
        }
      })
    );

    assert.equal(signal.platform, "n8n");
    assert.equal(signal.intakeRequest.source, "google_sheets");
    assert.equal(signal.intakeRequest.metadata?.row, 12);
    assert.ok(signal.webhookNotes.includes("n8n webhook normalized into ThoroughLoop intake request."));
  });

  it("normalizes valid generic payloads using body", () => {
    const signal = expectWebhookSignal(
      normalizeWebhookPayload({
        platform: "generic",
        body: "Example Founder needs one weekly operating decision after scattered notes."
      })
    );

    assert.equal(signal.platform, "generic");
    assert.equal(
      signal.intakeRequest.context,
      "Example Founder needs one weekly operating decision after scattered notes."
    );
    assert.deepEqual(signal.intakeRequest.metadata, {
      webhookPlatform: "generic"
    });
  });

  it("defaults omitted platform to generic", () => {
    const signal = expectWebhookSignal(
      normalizeWebhookPayload({
        note: "DemoCo has a support ticket and no assigned owner."
      })
    );

    assert.equal(signal.platform, "generic");
    assert.equal(signal.intakeRequest.metadata?.webhookPlatform, "generic");
  });

  it("maps fields into intake metadata without dropping source and workflow", () => {
    const signal = expectWebhookSignal(
      normalizeWebhookPayload({
        platform: "make",
        source: "support_ticket",
        workflow: "onboarding-risk",
        text: "Ticket TL-104 says DemoCo onboarding is blocked by missing admin access.",
        fields: {
          ticketId: "TL-104",
          priority: "high"
        }
      })
    );

    assert.equal(signal.intakeRequest.source, "support_ticket");
    assert.equal(signal.intakeRequest.workflow, "onboarding-risk");
    assert.deepEqual(signal.intakeRequest.metadata, {
      ticketId: "TL-104",
      priority: "high",
      webhookPlatform: "make"
    });
  });

  it("uses context before text, message, note, and body", () => {
    const signal = expectWebhookSignal(
      normalizeWebhookPayload({
        context: "Context field wins.",
        text: "Text field should not win.",
        message: "Message field should not win.",
        note: "Note field should not win.",
        body: "Body field should not win."
      })
    );

    assert.equal(signal.intakeRequest.context, "Context field wins.");
  });

  it("rejects payloads with no context-like field", () => {
    const error = expectWebhookError(
      normalizeWebhookPayload({
        platform: "make",
        source: "crm"
      })
    );

    assert.equal(error.code, "MISSING_WEBHOOK_CONTEXT");
    assert.equal(error.retryable, false);
  });

  it("rejects invalid context-like field values", () => {
    const error = expectWebhookError(
      normalizeWebhookPayload({
        platform: "zapier",
        message: 42
      })
    );

    assert.equal(error.code, "INVALID_WEBHOOK_CONTEXT");
  });

  it("rejects unsupported platforms", () => {
    const error = expectWebhookError(
      normalizeWebhookPayload({
        platform: "custom_app",
        text: "A founder note is ready for diagnosis."
      })
    );

    assert.equal(error.code, "UNSUPPORTED_WEBHOOK_PLATFORM");
  });

  it("rejects invalid fields objects", () => {
    const error = expectWebhookError(
      normalizeWebhookPayload({
        platform: "n8n",
        context: "A weekly row needs review.",
        fields: ["not", "an", "object"]
      })
    );

    assert.equal(error.code, "INVALID_WEBHOOK_FIELDS");
  });

  it("rejects oversized webhook context", () => {
    const error = expectWebhookError(
      normalizeWebhookPayload({
        platform: "generic",
        body: "x".repeat(MAX_INTAKE_CONTEXT_LENGTH + 1)
      })
    );

    assert.equal(error.code, "WEBHOOK_PAYLOAD_TOO_LARGE");
  });
});
