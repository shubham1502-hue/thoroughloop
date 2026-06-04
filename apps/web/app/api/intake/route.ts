import {
  createDiagnosis,
  createIntakeError,
  generateFounderMemo,
  memoToDecision,
  memoToFounderAction,
  normalizeIntakeRequest,
  type IntakeError
} from "@thoroughloop/core";

interface IntakeErrorResponse {
  ok: false;
  error: IntakeError;
}

function jsonError(error: IntakeError, status: number): Response {
  const body: IntakeErrorResponse = {
    ok: false,
    error
  };

  return Response.json(body, { status });
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError(
      createIntakeError("INVALID_JSON", "Request body must be valid JSON."),
      400
    );
  }

  const normalized = normalizeIntakeRequest(body);

  if (!normalized.ok) {
    return jsonError(normalized.error, 400);
  }

  try {
    const diagnosis = createDiagnosis(normalized.data.context, normalized.data.workflow);
    const memo = generateFounderMemo(diagnosis);
    const founderAction = memoToFounderAction(memo);
    const decision = memoToDecision(memo);

    return Response.json(
      {
        ok: true,
        data: {
          signal: normalized.data,
          diagnosis,
          memo,
          founderAction,
          decision
        }
      },
      { status: 200 }
    );
  } catch {
    return jsonError(
      createIntakeError(
        "NORMALIZATION_FAILED",
        "The intake payload could not be processed."
      ),
      500
    );
  }
}
