import type { OperatingSignal, ValidatedIntakeRequest } from "../types";
import { createOperatingSignal } from "./createOperatingSignal";

export function normalizeDocumentSignal(request: ValidatedIntakeRequest): OperatingSignal {
  return createOperatingSignal(
    request,
    "Document signal normalized for operational handoff or fulfillment-risk context."
  );
}
