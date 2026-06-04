# n8n HTTP Request Setup

This guide shows how to send a synthetic operating signal from n8n into ThoroughLoop.

ThoroughLoop does not publish a custom n8n node in the current MVP. Use the built-in HTTP Request node.

## Setup Steps

1. Add an HTTP Request node.
2. Set method to `POST`.
3. Set URL to `http://localhost:3000/api/webhooks/operating-signal` for local testing.
4. Set body content type to JSON.
5. Add `platform`, `source`, `context`, and optional `fields`.

## Example Body

```json
{
  "platform": "n8n",
  "source": "google_sheets",
  "workflow": "weekly-review",
  "context": "Weekly row shows demos up, activation flat, two decisions stuck, and next week priorities unclear.",
  "fields": {
    "sheet": "Weekly operating review",
    "row": 12
  }
}
```

## Error Example

If the body does not include `context`, `text`, `message`, `note`, or `body`, ThoroughLoop returns:

```json
{
  "ok": false,
  "error": {
    "code": "MISSING_WEBHOOK_CONTEXT",
    "message": "Webhook payload must include context, text, message, note, or body.",
    "retryable": false
  }
}
```

## Current Limitations

- No custom n8n node.
- No OAuth.
- No live Google Sheets sync.
- No database persistence.
- No server-side AI calls.
