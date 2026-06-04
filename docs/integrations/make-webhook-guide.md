# Generic Webhook Guide

This guide explains how to send a synthetic operating signal into ThoroughLoop from a webhook automation tool such as Make, Zapier, or n8n.

The current ThoroughLoop MVP does not include live provider integrations, OAuth, background jobs, persistent server storage, or server-side AI. Treat this as a public-safe integration simulation for local development and demos.

For automation-shaped payloads, prefer `POST /api/webhooks/operating-signal`. Use `POST /api/intake` when your payload is already shaped as a ThoroughLoop intake request.

## Recommended Flow

```text
External payload -> webhook step -> POST /api/webhooks/operating-signal -> ThoroughLoop JSON response
```

## Webhook Settings

- Method: `POST`
- URL: `http://localhost:3000/api/webhooks/operating-signal` for local testing
- Header: `Content-Type: application/json`
- Body type: raw JSON

## Example Body

```json
{
  "platform": "make",
  "source": "crm",
  "workflow": "revenue-rescue",
  "text": "Acme is qualified, demo requested for Friday, no owner assigned, and pricing objection is unresolved.",
  "fields": {
    "company": "Acme",
    "priority": "high",
    "owner": "unassigned"
  }
}
```

## Mapping Guidance

Map only generic fields into the request body:

- Map the external system name to `source` when it matches a supported value.
- Map the automation platform to `platform` when it is `make`, `zapier`, `n8n`, or `generic`.
- Map the messy note, row summary, ticket description, or document summary to `context`, `text`, `message`, `note`, or `body`.
- Map optional routing fields to `fields`.
- Map `workflow` only when the sending system already knows the intended ThoroughLoop workflow.

If the workflow is not known, omit it and let ThoroughLoop detect the workflow from context.

## Supported Source Values

- `manual`
- `crm`
- `slack`
- `google_sheets`
- `support_ticket`
- `purchase_order`

## Supported Workflow IDs

- `revenue-rescue`
- `weekly-review`
- `investor-update`
- `onboarding-risk`
- `hiring-bottleneck`

## Safety Rules

- Use fictional demo data for public demos.
- Do not send real credentials.
- Do not send private customer data.
- Do not send private purchase orders.
- Do not send confidential document content.
- Do not send private company workflow logic.

## Response Handling

The response contains:

- `signal`
- `diagnosis`
- `memo`
- `founderAction`
- `decision`

A webhook automation can inspect `ok`. If `ok` is `false`, inspect `error.code` and `error.message`.

## Current Limitations

- No request persistence.
- No user accounts.
- No database.
- No provider OAuth.
- No production sync.
- No live provider writeback.
- No server-side AI generation.
