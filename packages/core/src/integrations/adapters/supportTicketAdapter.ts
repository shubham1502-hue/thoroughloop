import type { OperatingSignal, ValidatedIntakeRequest } from "../types";
import { createOperatingSignal } from "./createOperatingSignal";

export function normalizeSupportTicketSignal(request: ValidatedIntakeRequest): OperatingSignal {
  return createOperatingSignal(
    request,
    "Support ticket normalized for SLA, onboarding, or customer-risk context."
  );
}
