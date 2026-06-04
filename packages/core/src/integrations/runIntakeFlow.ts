import { createDiagnosis } from "../diagnosis";
import { generateFounderMemo, memoToDecision, memoToFounderAction } from "../memo";
import type {
  FounderDiagnosis,
  SavedDecision,
  SavedFounderAction,
  SavedMemo
} from "../types";
import { createIntakeError } from "./errors";
import { normalizeIntakeRequest } from "./normalizeSignal";
import type { IntakeError, OperatingSignal } from "./types";

export interface IntakeFlowData {
  signal: OperatingSignal;
  diagnosis: FounderDiagnosis;
  memo: SavedMemo;
  founderAction: SavedFounderAction;
  decision: SavedDecision;
}

export type IntakeFlowResult =
  | {
      ok: true;
      data: IntakeFlowData;
    }
  | {
      ok: false;
      error: IntakeError;
    };

export function runIntakeFlow(input: unknown): IntakeFlowResult {
  const normalized = normalizeIntakeRequest(input);

  if (!normalized.ok) {
    return normalized;
  }

  try {
    const diagnosis = createDiagnosis(normalized.data.context, normalized.data.workflow);
    const memo = generateFounderMemo(diagnosis);
    const founderAction = memoToFounderAction(memo);
    const decision = memoToDecision(memo);

    return {
      ok: true,
      data: {
        signal: normalized.data,
        diagnosis,
        memo,
        founderAction,
        decision
      }
    };
  } catch {
    return {
      ok: false,
      error: createIntakeError(
        "NORMALIZATION_FAILED",
        "The intake payload could not be processed."
      )
    };
  }
}
