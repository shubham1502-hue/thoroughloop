# Security Policy

## Reporting A Vulnerability

If you find a security issue, do not open a public issue with sensitive details. Contact the maintainer through GitHub and share the minimum detail needed to reproduce the issue safely.

## Current Data Boundary

The current MVP stores data locally in the browser or device through storage adapters.

The current MVP does not include:

- Backend services
- Auth
- Database persistence
- Payments
- External integrations
- Server-side AI calls

Clearing browser storage may remove saved memos, founder actions, decisions, and settings.

## Sensitive Data Guidance

Avoid pasting sensitive operating records into public demos or screenshots. Use synthetic examples when reporting bugs or requesting changes.

## Dependency Risk Boundary

The active ThoroughLoop MVP is the web app. It does not use a backend, authentication, database persistence, payments, sensitive production data, or a production AI pipeline.

The mobile workspace is currently an inactive Expo skeleton. Some npm audit findings come from mobile and framework transitive dependencies rather than active production web runtime paths.

Remaining dependency findings are tracked as dependency risk. They should not be fixed with `npm audit fix`, force upgrades, or broad framework upgrades without a separate validated PR.

Framework updates for Next, Expo, Expo Router, React Native, React, or React DOM should be handled separately with full lint, typecheck, test, build, and product smoke validation.
