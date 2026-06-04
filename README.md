# ThoroughLoop

[![CI](https://github.com/shubham1502-hue/thoroughloop/actions/workflows/ci.yml/badge.svg)](https://github.com/shubham1502-hue/thoroughloop/actions/workflows/ci.yml)

ThoroughLoop is a web-first founder operating diagnosis tool that turns messy founder context into one memo, one founder action, and one decision to review next week.

## Live demo

The web MVP is deployed on Vercel:

https://thoroughloop.vercel.app

The current version is local-first. Saved memos, actions, decisions, and settings are stored in the browser through the preserved Founder OS Lite storage keys.

## Why This Exists

Early-stage founders often churn from project management systems, dashboards, CRMs, spreadsheets, and heavy workspaces because those tools require setup, data hygiene, and ongoing maintenance before they provide judgment.

ThoroughLoop keeps the loop smaller:

1. Paste messy founder context.
2. Detect the workflow.
3. Extract operating signals.
4. Generate a founder memo.
5. Save one founder action.
6. Save one decision.
7. Review the decision next week.

## What It Does Today

- Runs a production-minded web MVP in `apps/web`.
- Detects five workflows: Revenue Rescue, Weekly Operating Review, Investor Update, Onboarding Risk, and Hiring Bottleneck.
- Uses deterministic client-side logic in `packages/core`.
- Generates editable founder memos without requiring structured forms first.
- Saves memos, founder actions, decisions, and settings to local storage through storage adapters.
- Recalls the latest saved decision on the weekly review workflow.
- Includes a public-safe API intake layer for normalizing external operating signals into the same diagnosis loop.
- Includes an Expo mobile skeleton for later reuse of shared core logic.

## Integration Layer

ThoroughLoop includes a public-safe API intake layer for external operating signals.

```text
External payload -> validation -> normalization -> workflow detection -> founder memo -> founder action -> decision to review
```

The intake endpoint accepts synthetic or generic payloads from source labels such as CRM, Slack, Google Sheets, support tickets, purchase order summaries, or manual notes. It validates the payload, normalizes it into an operating signal, then uses the existing core diagnosis and memo generation logic.

This layer does not add production sync, provider OAuth, external API calls, request persistence, server-side AI, auth, or a database.

## What It Does Not Do Yet

- No backend.
- No auth.
- No database.
- No payments.
- No real external provider OAuth.
- No live CRM, Slack, form, ERP, document, or ticketing integration.
- No server-side AI calls.
- No team workspace.
- No production sync across devices.

Current data is local to the browser or device. Clearing browser storage may remove saved memos, founder actions, decisions, and settings.

## Repo Structure

```text
apps/
  web/       Next.js web MVP
  mobile/    Expo skeleton
packages/
  core/      Product logic, types, storage helpers, workflow detection, memo generation
  ui/        Shared design tokens
docs/        Product, mobile, and handoff documentation
```

## Local Development

Use Node 20.19 or newer.

```bash
npm ci
npm run dev:web
```

Then open `http://localhost:3000`.

## Scripts

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

`npm run test` runs the core test suite. `npm run test:e2e` runs the Playwright smoke test for the main browser loop.

## Validation

Before pushing changes, run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
git diff --check
```

For browser-loop validation, also run:

```bash
npm run test:e2e
```

Manual browser validation is documented in `docs/manual-smoke-test.md`.

## Public-Safe Boundary

This repository uses synthetic examples and local-first persistence. It does not claim production usage, customers, revenue impact, deployment, compliance readiness, or external data integrations.

## Roadmap

Near-term work should harden the web MVP, improve synthetic examples, refine export or share paths for memos, and improve review cadence. Later work can evaluate auth, database persistence, team workspace support, integrations, server-side AI, and a full mobile app after product validation.

## GitHub Project Description

A web-first founder operating diagnosis tool that turns messy founder context into one memo, one action, and one decision to review next week.
