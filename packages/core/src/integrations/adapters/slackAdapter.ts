import type { OperatingSignal, ValidatedIntakeRequest } from "../types";
import { createOperatingSignal } from "./createOperatingSignal";

export function normalizeSlackSignal(request: ValidatedIntakeRequest): OperatingSignal {
  return createOperatingSignal(request, "Slack note normalized for scattered operating context.");
}
