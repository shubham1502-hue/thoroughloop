# ADR 0004: Mobile As Skeleton

## Status

Accepted

## Context

ThoroughLoop should be mobile-ready, but fully building and polishing the Expo app in V1 would distract from hardening the web MVP and shared core logic.

## Decision

Keep `apps/mobile` as an Expo skeleton in V1. Align the mobile route plan conceptually with the web app and reuse `packages/core` later.

Do not expand the mobile app beyond safe skeleton hygiene in the current hardening sprint.

## Consequences

- The repository is structured for Play Store and App Store work later.
- Web MVP completion remains the priority.
- Mobile dependency advisories are not addressed as part of unrelated web hardening work.
- Future mobile work can build on the shared core package instead of starting over.
