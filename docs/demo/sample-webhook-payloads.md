# Sample Webhook Payloads

These payloads are synthetic and public-safe. Use them with:

```http
POST /api/webhooks/operating-signal
```

## Make And CRM

```json
{
  "platform": "make",
  "source": "crm",
  "workflow": "revenue-rescue",
  "text": "Acme is qualified, demo requested for Friday, no owner assigned, and pricing objection unresolved.",
  "fields": {
    "company": "Acme",
    "priority": "high",
    "owner": "unassigned",
    "system": "Nimbus CRM"
  }
}
```

## Zapier And Slack

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

## n8n And Google Sheets

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

## Generic And Support Ticket

```json
{
  "platform": "generic",
  "source": "support_ticket",
  "workflow": "onboarding-risk",
  "note": "Ticket TL-104 says DemoCo cannot finish setup because activation is blocked by missing admin access.",
  "fields": {
    "ticketId": "TL-104",
    "priority": "high",
    "owner": "unassigned"
  }
}
```

## Generic And Purchase Order Summary

```json
{
  "platform": "generic",
  "source": "purchase_order",
  "body": "PO-1001 for Example Founder is approved, but fulfillment owner and delivery milestone are not assigned.",
  "fields": {
    "documentId": "PO-1001",
    "priority": "medium",
    "owner": "unassigned"
  }
}
```
