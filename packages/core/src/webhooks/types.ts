import type { IntakeRequest, IntegrationSource } from "../integrations";
import type { WorkflowId } from "../types";

export const SUPPORTED_WEBHOOK_PLATFORMS = ["make", "zapier", "n8n", "generic"] as const;

export type WebhookPlatform = (typeof SUPPORTED_WEBHOOK_PLATFORMS)[number];

export const WEBHOOK_CONTEXT_FIELDS = ["context", "text", "message", "note", "body"] as const;

export type WebhookContextField = (typeof WEBHOOK_CONTEXT_FIELDS)[number];

export interface WebhookPayload {
  platform?: WebhookPlatform;
  source?: IntegrationSource;
  workflow?: WorkflowId;
  context?: string;
  text?: string;
  message?: string;
  note?: string;
  body?: string;
  fields?: Record<string, unknown>;
}

export interface NormalizedWebhookSignal {
  platform: WebhookPlatform;
  intakeRequest: IntakeRequest;
  webhookNotes: string[];
}

export type WebhookErrorCode =
  | "INVALID_WEBHOOK_JSON"
  | "MISSING_WEBHOOK_CONTEXT"
  | "INVALID_WEBHOOK_CONTEXT"
  | "UNSUPPORTED_WEBHOOK_PLATFORM"
  | "INVALID_WEBHOOK_FIELDS"
  | "WEBHOOK_PAYLOAD_TOO_LARGE";

export interface WebhookError {
  code: WebhookErrorCode;
  message: string;
  retryable: boolean;
}

export type WebhookNormalizationResult =
  | {
      ok: true;
      data: NormalizedWebhookSignal;
    }
  | {
      ok: false;
      error: WebhookError;
    };
