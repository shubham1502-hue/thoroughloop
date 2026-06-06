# Release Process

ThoroughLoop uses a simple release process for MVP milestones.

## When To Tag

Tag a release when a meaningful product or repository milestone is complete, validated, and pushed. Examples:

- Initial web MVP
- Core diagnosis logic improvement
- Persistence behavior improvement
- Deployment readiness milestone
- Mobile app milestone

Do not tag unfinished work or documentation-only drafts unless the documentation marks a clear public milestone.

## Pre-Release Validation

Run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
git diff --check
```

If the browser loop changed, also run:

```bash
npm run test:e2e
```

Confirm:

- Working tree is clean.
- No secrets are tracked.
- No generated artifacts are tracked.
- Legacy storage keys are preserved.
- README and docs avoid unsupported public claims.

## Release Notes

Release notes should include:

- What changed
- Why it matters for the founder operating loop
- Validation run
- Known limitations
- Any migration notes

## Public Claims Boundary

Do not claim:

- Production usage
- Customers
- Revenue impact
- Compliance readiness
- Production external provider sync
- AI backend behavior
- Cross-device sync

unless the repository and deployment evidence support the claim.

## MVP Boundary

Keep release notes honest about the current product boundary:

- Local-first storage
- Server-side routes may exist for intake, webhook normalization, and optional Notion export
- No user accounts
- No production database
- No server-side saved-loop persistence
- No payments
- No team workspace
- No production external provider sync
- No server-side AI generation

## Release Mechanics

This repo does not currently use semantic-release, npm publishing, automated changelog generation, or release deployment automation. Add those later only if release volume justifies the maintenance cost.
