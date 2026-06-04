# Intake API Examples

These examples are synthetic and public-safe. They show how different external signal shapes can be normalized into the ThoroughLoop founder diagnosis loop.

## CRM Revenue Signal

```bash
curl -X POST http://localhost:3000/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "source": "crm",
    "workflow": "revenue-rescue",
    "context": "Acme is qualified, demo requested for Friday, no owner assigned, and pricing objection is unresolved.",
    "metadata": {
      "company": "Acme",
      "priority": "high",
      "owner": "unassigned"
    }
  }'
```

Expected result: Revenue Rescue diagnosis, one founder memo, one founder action, and one decision to review.

## Slack Operating Note

```bash
curl -X POST http://localhost:3000/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "source": "slack",
    "context": "Founder thread says onboarding is blocked, support owner is unclear, and the next customer handoff decision needs attention."
  }'
```

Expected result: Workflow detection from the messy context, then the standard memo, action, and decision output.

## Google Sheets Weekly Row

```bash
curl -X POST http://localhost:3000/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "source": "google_sheets",
    "workflow": "weekly-review",
    "context": "Weekly row shows demos up, activation flat, two decisions stuck, and next week priorities unclear.",
    "metadata": {
      "sheet": "Weekly operating review",
      "row": 12
    }
  }'
```

Expected result: Weekly Operating Review memo with one founder action and one decision to review.

## Support Ticket Risk

```bash
curl -X POST http://localhost:3000/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "source": "support_ticket",
    "workflow": "onboarding-risk",
    "context": "Ticket TL-104 says DemoCo cannot finish setup because activation is blocked by missing admin access."
  }'
```

Expected result: Onboarding Risk memo with an intervention-oriented founder action.

## Purchase Order Handoff

```bash
curl -X POST http://localhost:3000/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "source": "purchase_order",
    "context": "PO-1001 for Example Founder is approved, but fulfillment owner and delivery milestone are not assigned.",
    "metadata": {
      "documentId": "PO-1001",
      "priority": "medium"
    }
  }'
```

Expected result: Workflow detection from the document context, then the standard ThoroughLoop output.

## Error Example

```bash
curl -X POST http://localhost:3000/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "source": "crm"
  }'
```

Expected response:

```json
{
  "ok": false,
  "error": {
    "code": "MISSING_CONTEXT",
    "message": "context is required to generate a founder memo.",
    "retryable": false
  }
}
```
