import type { IntakeError, IntakeErrorCode } from "./types";

export function createIntakeError(
  code: IntakeErrorCode,
  message: string,
  retryable = false
): IntakeError {
  return {
    code,
    message,
    retryable
  };
}
