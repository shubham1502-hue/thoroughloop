# Make Webhook Setup

This guide shows a generic Make scenario shape for sending synthetic operating signals into ThoroughLoop.

ThoroughLoop does not publish a Make app in the current MVP. Use a standard HTTP request module.

## Setup Steps

1. Add an HTTP request module.
2. Set method to `POST`.
3. Set URL to `http://localhost:3000/api/webhooks/operating-signal` for local testing.
4. Add header `Content-Type: application/json`.
5. Choose raw JSON body.
6. Map generic scenario values into `text` and `fields`.

## Example Body

```json
{
  "platform": "make",
  "source": "crm",
  "workflow": "revenue-rescue",
  "text": "Acme is qualified, demo requested for Friday, no owner assigned, and pricing objection unresolved.",
  "fields": {
    "company": "Acme",
    "priority": "high",
    "owner": "unassigned"
  }
}
```

## Expected Response

The response includes:

- webhook normalization notes
- normalized operating signal
- diagnosis
- founder memo
- founder action
- decision to review

## When To Use This

Use this endpoint when Make can send an automation-shaped payload. Use `POST /api/intake` when the payload is already shaped as a ThoroughLoop intake request.

## Safety Notes

Use fictional demo data for public demos. Do not include credentials, private records, or confidential operating context.
