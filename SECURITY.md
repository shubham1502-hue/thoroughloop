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

## Dependency Advisories

Expo and React Native skeleton advisories may exist through transitive dependencies. Do not treat mobile dependency remediation as part of unrelated web MVP changes unless it is explicitly scoped.
