# Vercel Deployment Notes

These notes prepare the web MVP for Vercel without deploying it.

## Recommended Project Settings

- Import repository: `shubham1502-hue/thoroughloop`
- Framework preset: Next.js
- Root Directory: repository root
- Install command: `npm ci`
- Build command: `npm --workspace @thoroughloop/web run build`
- Output directory: leave as the Next.js default

Use the repository root as the Vercel Root Directory because `apps/web` depends on workspace packages from `packages/core` and `packages/ui`.

## Environment Variables

No environment variables are required for the current MVP.

Do not add secrets for backend, auth, database, payments, external integrations, or server-side AI in the current scope.

## Output Expectations

The build should produce the Next.js app output under `apps/web/.next`.

The current app is local-first. Deployed visitors will still save memos, founder actions, decisions, and settings in their own browser storage.

## Current Product Boundary

The deployed web MVP would still have:

- No backend
- No auth
- No database
- No payments
- No external integrations
- No server-side AI
- No cross-device sync

## Deployment Checklist

Before connecting Vercel:

1. Confirm `main` is clean and pushed.
2. Run `npm run lint`.
3. Run `npm run typecheck`.
4. Run `npm run test`.
5. Run `npm run build`.
6. Run `npm run test:e2e` if browser smoke validation is required.
7. Confirm no `.env` files or generated artifacts are tracked.
8. Confirm public docs do not claim production usage, customers, revenue impact, compliance readiness, or external integrations.

## vercel.json Decision

No `vercel.json` is added in this sprint. The Vercel UI can set the monorepo root, install command, and build command without adding a repo-level config file that could conflict with future deployment choices.
