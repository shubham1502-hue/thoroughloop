# Operating Signal Webhook

`POST /api/webhooks/operating-signal` accepts automation-friendly webhook payloads and maps them into the existing ThoroughLoop intake layer.

Use this endpoint when a tool such as Make, Zapier, n8n, or a generic HTTP workflow can send a raw webhook shape with fields like `text`, `message`, `note`, `body`, or `context`.

Use `POST /api/intake` when the sending system already emits the ThoroughLoop intake shape with `source`, `workflow`, `context`, and `metadata`.

## Flow

```text
Webhook payload -> webhook normalization -> intake validation -> workflow detection -> founder memo -> founder action -> decision to review
```

## Endpoint

```http
POST /api/webhooks/operating-signal
Content-Type: application/json
```

## Supported Platforms

- `make`
- `zapier`
- `n8n`
- `generic`

If `platform` is omitted, ThoroughLoop defaults to `generic`.

## Supported Context Fields

ThoroughLoop reads the main context from the first available field in this order:

1. `context`
2. `text`
3. `message`
4. `note`
5. `body`

The selected value must be a non-empty string and must be 10,000 characters or fewer.

## Supported Sources

- `manual`
- `crm`
- `slack`
- `google_sheets`
- `support_ticket`
- `purchase_order`

## Request Example

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

## Success Response Shape

```json
{
  "ok": true,
  "data": {
    "webhook": {
      "platform": "make",
      "notes": [
        "Make webhook normalized into ThoroughLoop intake request."
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

## Error Response Shape

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

## Public-Safe Boundary

Use synthetic and generic examples only. Do not send credentials, private customer data, private purchase orders, confidential document content, or confidential operating context into public demos.

## Limitations

- No request persistence.
- No production authentication.
- No database.
- No provider OAuth.
- No live Make app.
- No live Zapier app.
- No published n8n node.
- No live provider sync.
- No server-side AI calls.
