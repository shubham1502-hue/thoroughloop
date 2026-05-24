# ADR 0003: Shared Core Package

## Status

Accepted

## Context

ThoroughLoop needs product logic that can run in the web app now and mobile app later. Keeping diagnosis and memo logic inside React components would make reuse harder and increase regression risk.

## Decision

Keep workflow definitions, diagnosis logic, risk signal extraction, memo generation, storage helpers, types, date helpers, and validation helpers in `packages/core`.

Apps should call the shared package instead of duplicating product logic.

## Consequences

- Core product behavior can be tested outside the UI.
- Web and mobile can reuse the same logic.
- React components stay focused on interaction and presentation.
- Shared core changes need careful tests because they affect multiple app surfaces.
