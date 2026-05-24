# Lightweight Performance Budget

ThoroughLoop should feel fast because the MVP is a focused operating diagnosis loop, not a dashboard-heavy suite.

## Practical Targets

- Homepage interaction should feel immediate after the app loads.
- Diagnosis generation should stay client-side and responsive for normal pasted founder notes.
- Saving memos, founder actions, decisions, and settings should not block on network calls in V1.
- Initial load should stay reasonable for a small Next.js app.
- Avoid unnecessary heavy dependencies.
- Avoid adding dashboard bloat, charting frameworks, or large UI libraries without a clear product need.

## Current Build Check

Use the standard build output as the first sanity check:

```bash
npm run build
```

Review route output for unexpected growth. If a route becomes materially heavier, identify whether the change is necessary for the core loop.

## E2E Responsiveness Check

Use the Playwright smoke test for the main loop:

```bash
npm run test:e2e
```

The test should complete the homepage diagnosis, memo generation, local saves, list routes, and weekly review recall without timing flakiness.

## Not In Scope Yet

- Lighthouse CI
- Bundle analyzer enforcement
- Performance budgets as CI gates
- Real-user monitoring
- External analytics

These can be considered later if the app adds deployment, real traffic, or heavier route behavior.
