import type { WorkflowId } from "../types";
import { WORKFLOWS } from "../workflows";
import { normalizeCrmSignal } from "./adapters/crmAdapter";
import { normalizeDocumentSignal } from "./adapters/documentAdapter";
import { createOperatingSignal } from "./adapters/createOperatingSignal";
import { normalizeSheetsSignal } from "./adapters/sheetsAdapter";
import { normalizeSlackSignal } from "./adapters/slackAdapter";
import { normalizeSupportTicketSignal } from "./adapters/supportTicketAdapter";
import { createIntakeError } from "./errors";
import {
  MAX_INTAKE_CONTEXT_LENGTH,
  SUPPORTED_INTEGRATION_SOURCES,
  type IntegrationSource,
  type IntakeNormalizationResult,
  type OperatingSignal,
  type ValidatedIntakeRequest
} from "./types";

const SUPPORTED_WORKFLOW_IDS = WORKFLOWS.map((workflow) => workflow.id);

type RawIntakeRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawIntakeRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isIntegrationSource(value: unknown): value is IntegrationSource {
  return (
    typeof value === "string" &&
    SUPPORTED_INTEGRATION_SOURCES.some((source) => source === value)
  );
}

function isWorkflowId(value: unknown): value is WorkflowId {
  return typeof value === "string" && SUPPORTED_WORKFLOW_IDS.some((workflow) => workflow === value);
}

function validateIntakeRequest(input: unknown): { ok: true; data: ValidatedIntakeRequest } | IntakeNormalizationResult {
  if (!isRecord(input)) {
    return {
      ok: false,
      error: createIntakeError(
        "MISSING_CONTEXT",
        "context is required to generate a founder memo."
      )
    };
  }

  if (!("context" in input)) {
    return {
      ok: false,
      error: createIntakeError(
        "MISSING_CONTEXT",
        "context is required to generate a founder memo."
      )
    };
  }

  if (typeof input.context !== "string") {
    return {
      ok: false,
      error: createIntakeError("INVALID_CONTEXT", "context must be a string.")
    };
  }

  const context = input.context.trim();

  if (!context) {
    return {
      ok: false,
      error: createIntakeError(
        "MISSING_CONTEXT",
        "context is required to generate a founder memo."
      )
    };
  }

  if (context.length > MAX_INTAKE_CONTEXT_LENGTH) {
    return {
      ok: false,
      error: createIntakeError(
        "PAYLOAD_TOO_LARGE",
        `context must be ${MAX_INTAKE_CONTEXT_LENGTH} characters or fewer.`
      )
    };
  }

  const source = input.source === undefined ? "manual" : input.source;

  if (!isIntegrationSource(source)) {
    return {
      ok: false,
      error: createIntakeError("UNSUPPORTED_SOURCE", "source is not supported.")
    };
  }

  if (input.workflow !== undefined && !isWorkflowId(input.workflow)) {
    return {
      ok: false,
      error: createIntakeError("INVALID_WORKFLOW", "workflow is not supported.")
    };
  }

  const metadata = input.metadata === undefined ? {} : input.metadata;

  if (!isPlainObject(metadata)) {
    return {
      ok: false,
      error: createIntakeError("INVALID_CONTEXT", "metadata must be a plain object.")
    };
  }

  return {
    ok: true,
    data: {
      source,
      workflow: input.workflow,
      context,
      metadata
    }
  };
}

function normalizeManualSignal(request: ValidatedIntakeRequest): OperatingSignal {
  return createOperatingSignal(request, "Manual context passed through without external adapter.");
}

const ADAPTERS: Record<IntegrationSource, (request: ValidatedIntakeRequest) => OperatingSignal> = {
  manual: normalizeManualSignal,
  crm: normalizeCrmSignal,
  slack: normalizeSlackSignal,
  google_sheets: normalizeSheetsSignal,
  support_ticket: normalizeSupportTicketSignal,
  purchase_order: normalizeDocumentSignal
};

export function normalizeIntakeRequest(input: unknown): IntakeNormalizationResult {
  const validation = validateIntakeRequest(input);

  if (!validation.ok) {
    return validation;
  }

  try {
    return {
      ok: true,
      data: ADAPTERS[validation.data.source](validation.data)
    };
  } catch {
    return {
      ok: false,
      error: createIntakeError(
        "NORMALIZATION_FAILED",
        "The intake payload could not be normalized."
      )
    };
  }
}
