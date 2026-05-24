# Contributing To ThoroughLoop

ThoroughLoop is a web-first founder operating diagnosis tool. It turns messy founder context into one memo, one founder action, and one decision to review next week.

## Project Scope

Keep contributions aligned with the current MVP:

- Web app in `apps/web`
- Expo mobile skeleton in `apps/mobile`
- Platform-independent product logic in `packages/core`
- Reusable tokens and practical UI pieces in `packages/ui`
- Local browser or device storage through storage adapters

Do not add backend, auth, database, payments, external integrations, or server-side AI unless that work is explicitly scoped later.

## Local Setup

Use Node 20.

```bash
npm ci
npm run dev:web
```

## Branch Workflow

Create a focused branch for each change.

```bash
git switch -c your-branch-name
```

Keep commits small and reviewable. Avoid mixing product behavior changes, documentation changes, and dependency changes unless they are part of the same narrow fix.

## Validation Commands

Run these before opening a pull request:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
git diff --check
```

If Playwright smoke tests are relevant, also run:

```bash
npm run test:e2e
```

## Product Boundary

ThoroughLoop should not become a task manager, CRM, project management suite, dashboard-heavy product, or Notion clone. Preserve the weekly loop:

1. Paste messy founder context
2. Detect workflow
3. Extract signals
4. Generate founder memo
5. Save memo
6. Save founder action
7. Save decision
8. Review decision next week

## Style Constraints

- Use TypeScript.
- Keep product logic in `packages/core`.
- Use storage adapters for persistence.
- Use "founder action" instead of "task".
- Use "memo" instead of "report".
- Use "diagnosis" instead of "analysis".
- Use "workflow" instead of "module".
- Do not add unsupported public claims.
- Do not add secrets or generated artifacts.
