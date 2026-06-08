# Export to Notion: Technical Reference

## Overview

ThoroughLoop lets founders export a generated founder memo directly to a Notion database with one click. The integration uses the Notion API v1 via a server-side Next.js API route so credentials never reach the browser.

This is outbound export only. ThoroughLoop does not import from Notion, sync with Notion, read Notion pages, use Notion as the app's persistence layer, or request external provider OAuth in the public MVP.

## Environment variables

| Variable            | Description                                      | Required |
|---------------------|--------------------------------------------------|----------|
| `NOTION_API_KEY`    | Notion internal integration token (`secret_…`)   | Yes      |
| `NOTION_DATABASE_ID`| ID of the target Notion database                 | Yes      |

Set both in `.env.local` (development) or your deployment environment. They are never exposed to the client.

## Notion database schema

The target database must have the following properties (names are case-sensitive):

| Property name       | Notion type | Source field                          |
|---------------------|-------------|---------------------------------------|
| Name                | title       | `memo.title`                          |
| Operating Diagnosis | rich_text   | `memo.diagnosis`                      |
| Founder Memo        | rich_text   | `memo.problem`                        |
| Founder Action      | rich_text   | `memo.founderAction`                  |
| Review Decision     | rich_text   | `memo.recommendedDecision`            |
| Review Date         | date        | `memoToDecision(memo).reviewDate`     |
| Source              | select      | `"ThoroughLoop"` (static)             |
| Created At          | date        | `memo.createdAt`                      |

## API route

`POST /api/notion-export`

### Request body

```json
{
  "memo": { /* SavedMemo object */ }
}
```

Required `memo` fields: `id`, `title`, `problem`, `diagnosis`, `founderAction`, `recommendedDecision`, `createdAt`. All must be non-empty strings.

### Success response (200)

```json
{
  "pageId": "abc123",
  "url": "https://notion.so/abc123"
}
```

### Error responses

| HTTP status | Error code        | Cause                                      |
|-------------|-------------------|--------------------------------------------|
| 503         | `MISSING_ENV`     | `NOTION_API_KEY` or `NOTION_DATABASE_ID` not set |
| 400         | `INVALID_PAYLOAD` | Request body missing or `memo` field invalid |
| 502         | `NOTION_ERROR`    | Notion API returned an error               |

Error body shape:

```json
{
  "code": "MISSING_ENV",
  "message": "Human-readable description"
}
```

The raw Notion error message is never forwarded to the client; only a safe summary is returned.

## Files

| File | Purpose |
|------|---------|
| `apps/web/app/api/notion-export/route.ts` | Next.js App Router API handler |
| `apps/web/src/lib/notion.ts` | `validateNotionExportPayload`, `buildNotionPage`, and shared types |
| `apps/web/src/hooks/useNotionExport.ts` | React hook wrapping the API call |
| `apps/web/test/notion.test.ts` | Unit tests (Node built-in test runner + tsx) |

## Running tests

```bash
npm --workspace @thoroughloop/web run test
```

Tests cover: `validateNotionExportPayload` (rejects missing/invalid input, accepts valid memo), `buildNotionPage` field mapping (all properties including date and select types).
