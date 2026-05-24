# Changelog

All notable changes to ThoroughLoop will be documented here.

## Unreleased

### Added

- GitHub Actions CI for lint, typecheck, tests, and build.
- Focused core tests for workflow detection, risk signals, memo generation, company extraction, and local storage resilience.
- Playwright smoke test for the main browser loop.
- Repository hygiene files for issues, pull requests, ownership, contribution guidance, and security guidance.

## 0.1.0 - Initial MVP

### Added

- Web-first MVP in `apps/web`.
- Shared product logic in `packages/core`.
- Shared UI tokens in `packages/ui`.
- Expo mobile skeleton in `apps/mobile`.
- Local storage persistence through storage adapters.
- Legacy Founder OS Lite storage keys for saved memos, founder actions, decisions, and settings.
- Homepage diagnosis loop for messy founder context.
- Founder memo generation with one founder action and one decision to review next week.
- Saved memos page.
- Founder action queue.
- Decision log.
- Weekly review recall for the latest saved decision.
- Workflow routes for Revenue Rescue, Weekly Operating Review, Investor Update, Onboarding Risk, and Hiring Bottleneck.

### Current Limitations

- Data is local to the browser or device.
- No backend.
- No auth.
- No database.
- No payments.
- No external integrations.
- No server-side AI.
