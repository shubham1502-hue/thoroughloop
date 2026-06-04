import { nowIsoString } from "../../date";
import type { OperatingSignal, ValidatedIntakeRequest } from "../types";

export function createOperatingSignal(
  request: ValidatedIntakeRequest,
  adapterNote: string
): OperatingSignal {
  return {
    source: request.source,
    workflow: request.workflow,
    context: request.context,
    metadata: request.metadata,
    normalizedAt: nowIsoString(),
    adapterNotes: [adapterNote]
  };
}
