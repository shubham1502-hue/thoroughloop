import {
  createWebhookError,
  normalizeWebhookPayload,
  runIntakeFlow,
  type IntakeError,
  type WebhookError
} from "@thoroughloop/core";

type WebhookRouteError = IntakeError | WebhookError;

interface WebhookErrorResponse {
  ok: false;
  error: WebhookRouteError;
}

function jsonError(error: WebhookRouteError, status: number): Response {
  const body: WebhookErrorResponse = {
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
      createWebhookError("INVALID_WEBHOOK_JSON", "Request body must be valid JSON."),
      400
    );
  }

  const webhook = normalizeWebhookPayload(body);

  if (!webhook.ok) {
    return jsonError(webhook.error, 400);
  }

  const intake = runIntakeFlow(webhook.data.intakeRequest);

  if (!intake.ok) {
    return jsonError(intake.error, intake.error.code === "NORMALIZATION_FAILED" ? 500 : 400);
  }

  return Response.json(
    {
      ok: true,
      data: {
        webhook: {
          platform: webhook.data.platform,
          notes: webhook.data.webhookNotes
        },
        signal: intake.data.signal,
        diagnosis: intake.data.diagnosis,
        memo: intake.data.memo,
        founderAction: intake.data.founderAction,
        decision: intake.data.decision
      }
    },
    { status: 200 }
  );
}
