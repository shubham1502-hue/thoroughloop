import { MAX_INTAKE_CONTEXT_LENGTH } from "../integrations";
import type { IntakeRequest } from "../integrations";
import { createWebhookError } from "./errors";
import {
  SUPPORTED_WEBHOOK_PLATFORMS,
  WEBHOOK_CONTEXT_FIELDS,
  type NormalizedWebhookSignal,
  type WebhookNormalizationResult,
  type WebhookPlatform
} from "./types";

type WebhookRecord = Record<string, unknown>;

function isRecord(value: unknown): value is WebhookRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isWebhookPlatform(value: unknown): value is WebhookPlatform {
  return (
    typeof value === "string" &&
    SUPPORTED_WEBHOOK_PLATFORMS.some((platform) => platform === value)
  );
}

function hasOwnField(input: WebhookRecord, field: string): boolean {
  return Object.prototype.hasOwnProperty.call(input, field);
}

function findContextValue(input: WebhookRecord): { found: boolean; value?: unknown } {
  for (const field of WEBHOOK_CONTEXT_FIELDS) {
    if (hasOwnField(input, field)) {
      return {
        found: true,
        value: input[field]
      };
    }
  }

  return {
    found: false
  };
}

function noteForPlatform(platform: WebhookPlatform): string {
  const labels: Record<WebhookPlatform, string> = {
    make: "Make webhook normalized into ThoroughLoop intake request.",
    zapier: "Zapier webhook normalized into ThoroughLoop intake request.",
    n8n: "n8n webhook normalized into ThoroughLoop intake request.",
    generic: "Generic webhook normalized into ThoroughLoop intake request."
  };

  return labels[platform];
}

export function normalizeWebhookPayload(input: unknown): WebhookNormalizationResult {
  if (!isRecord(input)) {
    return {
      ok: false,
      error: createWebhookError(
        "MISSING_WEBHOOK_CONTEXT",
        "Webhook payload must include context, text, message, note, or body."
      )
    };
  }

  const platformValue = input.platform === undefined ? "generic" : input.platform;

  if (!isWebhookPlatform(platformValue)) {
    return {
      ok: false,
      error: createWebhookError(
        "UNSUPPORTED_WEBHOOK_PLATFORM",
        "Webhook platform is not supported."
      )
    };
  }

  const contextValue = findContextValue(input);

  if (!contextValue.found) {
    return {
      ok: false,
      error: createWebhookError(
        "MISSING_WEBHOOK_CONTEXT",
        "Webhook payload must include context, text, message, note, or body."
      )
    };
  }

  if (typeof contextValue.value !== "string") {
    return {
      ok: false,
      error: createWebhookError(
        "INVALID_WEBHOOK_CONTEXT",
        "Webhook context must be a string."
      )
    };
  }

  const context = contextValue.value.trim();

  if (!context) {
    return {
      ok: false,
      error: createWebhookError(
        "MISSING_WEBHOOK_CONTEXT",
        "Webhook payload must include context, text, message, note, or body."
      )
    };
  }

  if (context.length > MAX_INTAKE_CONTEXT_LENGTH) {
    return {
      ok: false,
      error: createWebhookError(
        "WEBHOOK_PAYLOAD_TOO_LARGE",
        `Webhook context must be ${MAX_INTAKE_CONTEXT_LENGTH} characters or fewer.`
      )
    };
  }

  const fields = input.fields === undefined ? {} : input.fields;

  if (!isPlainObject(fields)) {
    return {
      ok: false,
      error: createWebhookError(
        "INVALID_WEBHOOK_FIELDS",
        "Webhook fields must be a plain object."
      )
    };
  }

  const intakeRequest: IntakeRequest = {
    source: input.source as IntakeRequest["source"],
    workflow: input.workflow as IntakeRequest["workflow"],
    context,
    metadata: {
      ...fields,
      webhookPlatform: platformValue
    }
  };

  const data: NormalizedWebhookSignal = {
    platform: platformValue,
    intakeRequest,
    webhookNotes: [noteForPlatform(platformValue)]
  };

  return {
    ok: true,
    data
  };
}
