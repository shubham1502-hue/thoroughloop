# Zapier Webhook Setup

This guide shows how to use Webhooks by Zapier with ThoroughLoop's generic webhook endpoint.

ThoroughLoop does not publish a Zapier app in the current MVP. Use Webhooks by Zapier with a custom request.

## Setup Steps

1. Add a Webhooks by Zapier action.
2. Choose custom request.
3. Set method to `POST`.
4. Set URL to `http://localhost:3000/api/webhooks/operating-signal` for local testing.
5. Add header `Content-Type: application/json`.
6. Send a JSON body with `platform`, `source`, `message`, and optional `fields`.

## Example Body

```json
{
  "platform": "zapier",
  "source": "slack",
  "message": "Founder thread says onboarding is blocked and the support owner is unclear.",
  "fields": {
    "channel": "founder-updates",
    "thread": "demo-thread-001"
  }
}
```

## Expected Response

```json
{
  "ok": true,
  "data": {
    "webhook": {
      "platform": "zapier",
      "notes": [
        "Zapier webhook normalized into ThoroughLoop intake request."
      ]
    },
    "signal": {},
    "diagnosis": {},
    "memo": {},
    "founderAction": {},
    "decision": {}
  }
}
```

## Current Limitations

- No published Zapier app.
- No OAuth.
- No live Slack sync.
- No persistent server storage.
- No server-side AI calls.
