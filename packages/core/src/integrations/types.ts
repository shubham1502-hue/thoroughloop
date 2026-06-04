import type { WorkflowId } from "../types";

export const SUPPORTED_INTEGRATION_SOURCES = [
  "manual",
  "crm",
  "slack",
  "google_sheets",
  "support_ticket",
  "purchase_order"
] as const;

export type IntegrationSource = (typeof SUPPORTED_INTEGRATION_SOURCES)[number];

export const MAX_INTAKE_CONTEXT_LENGTH = 10000;

export interface IntakeRequest {
  source?: IntegrationSource;
  workflow?: WorkflowId;
  context?: string;
  metadata?: Record<string, unknown>;
}

export interface ValidatedIntakeRequest {
  source: IntegrationSource;
  workflow?: WorkflowId;
  context: string;
  metadata: Record<string, unknown>;
}

export interface OperatingSignal {
  source: IntegrationSource;
  workflow?: WorkflowId;
  context: string;
  metadata: Record<string, unknown>;
  normalizedAt: string;
  adapterNotes: string[];
}

export type IntakeErrorCode =
  | "INVALID_JSON"
  | "MISSING_CONTEXT"
  | "INVALID_CONTEXT"
  | "UNSUPPORTED_SOURCE"
  | "INVALID_WORKFLOW"
  | "PAYLOAD_TOO_LARGE"
  | "NORMALIZATION_FAILED";

export interface IntakeError {
  code: IntakeErrorCode;
  message: string;
  retryable: boolean;
}

export type IntakeNormalizationResult =
  | {
      ok: true;
      data: OperatingSignal;
    }
  | {
      ok: false;
      error: IntakeError;
    };
