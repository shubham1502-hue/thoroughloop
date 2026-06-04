import type { OperatingSignal, ValidatedIntakeRequest } from "../types";
import { createOperatingSignal } from "./createOperatingSignal";

export function normalizeSheetsSignal(request: ValidatedIntakeRequest): OperatingSignal {
  return createOperatingSignal(
    request,
    "Sheet row normalized for weekly metrics or operating review context."
  );
}
