# API And Webhook Demo

This demo shows how ThoroughLoop can accept messy operating context from direct API payloads and automation webhook payloads without adding live integrations.

## What This Demo Proves

- Direct API intake and webhook intake both feed the same ThoroughLoop loop.
- External signals can be validated and normalized before memo generation.
- The response includes a diagnosis, founder memo, founder action, and decision to review.
- The integration layer is public-safe and uses synthetic examples only.

```text
External signal → validation → normalization → workflow detection → founder memo → founder action → decision to review
```

## When To Use `/api/intake`

Use `POST /api/intake` when the sender can already format a ThoroughLoop intake request:

- `source`
- `workflow`
- `context`
- `metadata`

This is the cleanest path for a controlled internal tool, scripted demo, or reviewed API caller.

## When To Use `/api/webhooks/operating-signal`

Use `POST /api/webhooks/operating-signal` when the sender is an automation tool such as Make, Zapier, n8n, or a generic HTTP workflow.

The webhook endpoint accepts automation-friendly fields such as:

- `context`
- `text`
- `message`
- `note`
- `body`
- `fields`

It maps those fields into the same intake layer used by `/api/intake`.

## 3-Step Local Demo

1. Start the web app.

```bash
npm run dev:web
```

2. Run a sample request.

```bash
curl -X POST http://localhost:3000/api/webhooks/operating-signal \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "make",
    "source": "crm",
    "workflow": "revenue-rescue",
    "text": "Acme is qualified, demo requested for Friday, no owner assigned, and pricing objection unresolved.",
    "fields": {
      "company": "Acme",
      "priority": "high",
      "owner": "unassigned"
    }
  }'
```

3. Inspect the returned objects.

Look for:

- `data.webhook`
- `data.signal`
- `data.diagnosis`
- `data.memo`
- `data.founderAction`
- `data.decision`

## Expected High-Level Response Shape

```json
{
  "ok": true,
  "data": {
    "webhook": {},
    "signal": {},
    "diagnosis": {},
    "memo": {},
    "founderAction": {},
    "decision": {}
  }
}
```

`POST /api/intake` returns the same loop outputs without the `webhook` wrapper.

## Public-Safe Boundary

Use only synthetic or generic data in public demos. The examples use names such as Acme, DemoCo, Example Founder, Nimbus CRM, PO-1001, and TL-104.

Do not use private company records, private documents, confidential workflow notes, or credentials in public demos.

## Limitations

- No published Make app.
- No published Zapier app.
- No published n8n node.
- No provider OAuth.
- No live provider sync.
- No production authentication.
- No database persistence.
- No server-side AI calls.
- No request storage.
