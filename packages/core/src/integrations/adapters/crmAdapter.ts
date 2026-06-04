import type { OperatingSignal, ValidatedIntakeRequest } from "../types";
import { createOperatingSignal } from "./createOperatingSignal";

export function normalizeCrmSignal(request: ValidatedIntakeRequest): OperatingSignal {
  return createOperatingSignal(
    request,
    "CRM signal normalized for revenue, handoff, or pipeline diagnosis."
  );
}
