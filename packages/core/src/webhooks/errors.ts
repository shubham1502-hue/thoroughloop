import type { WebhookError, WebhookErrorCode } from "./types";

export function createWebhookError(
  code: WebhookErrorCode,
  message: string,
  retryable = false
): WebhookError {
  return {
    code,
    message,
    retryable
  };
}
