# Source-Aware Context Import

## What This Feature Does

Source-aware context import lets a founder label where manually pasted context came from before running the ThoroughLoop loop.

The source label gives the generated diagnosis, memo, action, and decision a little more operating context without changing the core workflow:

1. Choose a source label.
2. Paste the relevant context manually.
3. Generate the diagnosis and founder memo.
4. Save one action and one decision.
5. Review the saved loop later.

## What This Feature Does Not Do

This is not a live integration layer.

ThoroughLoop does not currently:

- Read from Slack, Notion, CRM systems, Gmail, Linear, Jira, or external tools.
- Import from Notion.
- Sync with Notion.
- Pull messages, pages, notes, tickets, or records automatically.
- Request OAuth access.
- Store external access tokens.
- Run background ingestion.
- Store saved loops in a production database.

A Notion source label means the user manually pasted Notion notes into the compose field. Optional Notion export, if configured separately, is outbound export only. It is not Notion import, Notion sync, or app persistence.

## Supported Source Labels

- General founder notes
- Slack thread or channel notes
- Notion page or workspace notes
- CRM or sales pipeline notes
- Customer feedback
- Meeting notes
- Product requirements or handoff notes
- Hiring follow-up notes
- Other

## Manual Import Flow

The user chooses a source label, then pastes the messy context into the existing compose field.

Example:

- Source: Product requirements or handoff notes
- Pasted context: scattered product notes, sales feedback, unclear requirements, and handoff questions
- Output: one diagnosis, one founder memo, one founder action, and one decision to review later

The selected label is stored as loop metadata when the user saves the loop.

## Privacy Boundary

Source labels are stored locally with saved memos, founder actions, and decisions through the existing browser storage flow.

Pasted context remains part of the current local-first browser workflow unless a user explicitly uses an API, webhook, or optional export route. Source labels do not create external access or external storage.

The public demo is intended for fictional or sanitized context. Users should avoid pasting confidential production data.

## Future Integration Candidates

Future work could explore source-specific import helpers after the manual loop is validated, such as:

- Slack thread summaries
- Notion page snippets
- CRM deal notes
- Customer feedback exports
- Meeting note summaries
- Requirements and handoff docs

Any future integration should be evaluated against the core loop:

- Does it strengthen messy context to diagnosis to memo to action to decision review?
- Does it avoid turning ThoroughLoop into a CRM, PM system, dashboard, or generic workspace?
- Can it be explained without implying automatic decision-making?
- Does it preserve trust around user data?

## Why Live Provider Import Is Out Of Scope For Now

Live provider import would add auth, token handling, provider permissions, import logic, error states, and storage complexity before the core workflow has enough validation.

The current MVP is intentionally manual and local-first so the builder can test the founder workflow first:

- Do founders recognize the pain of scattered context?
- Does labeling the source make the pasted context easier to reason about?
- Does the diagnosis, action, decision, and review loop map to a real weekly habit?
- Which source category creates the strongest pull?
