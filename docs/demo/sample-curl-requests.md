# Sample cURL Requests

Start the web app before running these examples:

```bash
npm run dev:web
```

All examples use synthetic data.

## Direct API Intake

```bash
curl -X POST http://localhost:3000/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "source": "crm",
    "workflow": "revenue-rescue",
    "context": "Acme is qualified, demo requested for Friday, no owner assigned, and pricing objection unresolved.",
    "metadata": {
      "company": "Acme",
      "priority": "high",
      "owner": "unassigned"
    }
  }'
```

## Make-Style Webhook

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

## Zapier-Style Webhook

```bash
curl -X POST http://localhost:3000/api/webhooks/operating-signal \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "zapier",
    "source": "slack",
    "message": "Founder thread says onboarding is blocked and the support owner is unclear.",
    "fields": {
      "channel": "founder-updates",
      "thread": "demo-thread-001"
    }
  }'
```

## n8n-Style Webhook

```bash
curl -X POST http://localhost:3000/api/webhooks/operating-signal \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "n8n",
    "source": "google_sheets",
    "workflow": "weekly-review",
    "context": "Weekly row shows demos up, activation flat, two decisions stuck, and next week priorities unclear.",
    "fields": {
      "sheet": "Weekly operating review",
      "row": 12
    }
  }'
```

## Error Example: Missing Context

```bash
curl -X POST http://localhost:3000/api/webhooks/operating-signal \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "make",
    "source": "crm",
    "fields": {
      "company": "Acme"
    }
  }'
```

Expected response:

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

## Expected Success Shape

```json
{
  "ok": true,
  "data": {
    "signal": {},
    "diagnosis": {},
    "memo": {},
    "founderAction": {},
    "decision": {}
  }
}
```

Webhook responses also include `data.webhook`.
