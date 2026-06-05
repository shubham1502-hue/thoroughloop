# ThoroughLoop API Intake Layer

The ThoroughLoop intake layer is a public-safe API surface for testing how external operating signals could enter the existing founder diagnosis loop.

It accepts a JSON payload, validates it, normalizes it into an operating signal, and runs the same core ThoroughLoop flow:

```text
External payload -> validation -> normalization -> workflow detection -> founder memo -> founder action -> decision to review
```

## What It Does

- Accepts synthetic or generic operating context through `POST /api/intake`.
- Supports manual, CRM, Slack, Google Sheets, support ticket, and purchase order source labels.
- Validates source, workflow, context, and metadata.
- Creates a normalized operating signal.
- Uses `packages/core` to create a diagnosis, founder memo, founder action, and decision.
- Returns structured JSON.

## What It Does Not Do

- It does not store incoming API requests.
- It does not write to browser local storage.
- It does not add auth.
- It does not add a database.
- It does not call external provider APIs.
- It does not add provider OAuth.
- It does not call server-side AI.
- It does not create live CRM, Slack, ERP, document, or ticketing sync.

This is an integration-readiness layer, not a full production SaaS backend.

## Endpoint

```http
POST /api/intake
Content-Type: application/json
```

## Supported Sources

- `manual`
- `crm`
- `slack`
- `google_sheets`
- `support_ticket`
- `purchase_order`

If `source` is omitted, ThoroughLoop defaults to `manual`.

## Supported Workflow IDs

- `revenue-rescue`
- `weekly-review`
- `investor-update`
- `onboarding-risk`
- `hiring-bottleneck`

If `workflow` is omitted, ThoroughLoop detects the workflow from the context.

## Request Body

```json
{
  "source": "crm",
  "workflow": "revenue-rescue",
  "context": "Lead is qualified, demo requested for Friday, no owner assigned, pricing objection unresolved.",
  "metadata": {
    "company": "Acme",
    "priority": "high",
    "owner": "unassigned"
  }
}
```

## Successful Response

```json
{
  "ok": true,
  "data": {
    "signal": {
      "source": "crm",
      "workflow": "revenue-rescue",
      "context": "Lead is qualified, demo requested for Friday, no owner assigned, pricing objection unresolved.",
      "metadata": {
        "company": "Acme",
        "priority": "high",
        "owner": "unassigned"
      },
      "normalizedAt": "2026-06-04T00:00:00.000Z",
      "adapterNotes": [
        "CRM signal normalized for revenue, handoff, or pipeline diagnosis."
      ]
    },
    "diagnosis": {},
    "memo": {},
    "founderAction": {},
    "decision": {}
  }
}
```

The `diagnosis`, `memo`, `founderAction`, and `decision` objects use the existing core ThoroughLoop shapes.

## Error Response

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

## Validation Rules

- `context` is required.
- `context` must be a string.
- `context` must be non-empty after trimming.
- `context` must be 10,000 characters or fewer.
- `source` is optional and defaults to `manual`.
- `source` must be one of the supported source values.
- `workflow` is optional.
- `workflow` must be one of the supported workflow IDs when provided.
- `metadata` is optional and defaults to `{}`.
- `metadata` must be a plain object when provided.

## cURL Example

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

## Public-Safe Boundary

Use synthetic data only. Do not send customer data, credentials, private purchase orders, private documents, internal workflow names, or confidential operating notes into public demos.
