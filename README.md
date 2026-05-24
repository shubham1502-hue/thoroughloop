# ThoroughLoop

ThoroughLoop turns scattered founder notes into one diagnosis, one founder action, and one decision to review next week.

## What ThoroughLoop is

ThoroughLoop is a lightweight operating diagnosis tool for early-stage founders. Paste messy deal notes, weekly updates, customer blockers, investor notes, hiring notes, or founder reflections. The app detects the workflow, extracts operating signals, generates a founder-ready memo, saves one founder action, and records one decision to review next week.

## Why it exists

Early-stage founders do not need another project management system, dashboard, CRM, or workspace to maintain. They need a simple weekly loop that accepts messy context and turns it into operating judgment.

## How to run the web app

Use Node.js 20.19 or newer.

```bash
npm install
npm run dev:web
```

Then open `http://localhost:3000`.

## How to run tests

```bash
npm run test
```

The current test command runs the TypeScript checks across the monorepo. Browser validation should also follow the checklist in `PROJECT_HANDOFF.md`.

## How to lint

```bash
npm run lint
```

## How to build

```bash
npm run build
```

The root build runs available package builds first, then the web build. The mobile app is a skeleton and does not ship a production build script in v1.

## Current limitations

V1 uses local browser or device storage. Data is device-specific. There is no backend, auth, database, payment system, external integration, or server-side AI call.

Production should later add database persistence, auth, real LLM generation, workspace support, and integrations.

## Future mobile path

The repo includes an Expo skeleton at `apps/mobile`. It is set up to reuse `packages/core` later. The mobile roadmap is documented in `docs/mobile-roadmap.md`.

## GitHub-ready project description

ThoroughLoop is a web-first, mobile-ready founder operating loop that turns messy founder context into a diagnosis, one founder action, and one decision to review next week.
