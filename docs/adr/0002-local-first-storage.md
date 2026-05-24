# ADR 0002: Local-First Storage

## Status

Accepted

## Context

The MVP needs persistence for memos, founder actions, decisions, and settings, but a production backend would add account, database, privacy, and operational complexity before the loop is validated.

## Decision

Use local browser or device storage in V1 through a `StorageAdapter` interface. Preserve the legacy Founder OS Lite storage keys:

- `founder_os_lite_memos`
- `founder_os_lite_actions`
- `founder_os_lite_decisions`
- `founder_os_lite_settings`

## Consequences

- The MVP can save and recall data without backend infrastructure.
- Saved data is device-specific.
- Clearing browser storage can remove saved data.
- Future database persistence can be added behind the adapter boundary.
- Legacy local data remains compatible with the previous working name.
