# ADR 0001: Web-First MVP

## Status

Accepted

## Context

ThoroughLoop needs to prove the core founder operating diagnosis loop before adding mobile polish, accounts, sync, or integrations.

## Decision

Build the first production-minded MVP in `apps/web` using Next.js and React. Keep the web app focused on paste context, diagnose, generate a memo, save one founder action, save one decision, and review the decision next week.

Do not add account auth, production database persistence, payments, team workspace, live provider sync, or server-side AI in V1. Server-side route scaffolding can exist only when it keeps the web MVP focused on public-safe intake, export, or validation paths.

## Consequences

- The fastest validation path is available in the browser.
- Product behavior can be tested before account and sync complexity.
- Data remains local to the browser in V1.
- Mobile can reuse core logic later without driving the first MVP scope.
