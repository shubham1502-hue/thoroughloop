import {
  createIntakeError,
  runIntakeFlow,
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

  const result = runIntakeFlow(body);

  if (!result.ok) {
    return jsonError(result.error, result.error.code === "NORMALIZATION_FAILED" ? 500 : 400);
  }

  return Response.json(
    {
      ok: true,
      data: result.data
    },
    { status: 200 }
  );
}
