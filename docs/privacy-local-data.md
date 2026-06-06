# Privacy And Local Data Handling

ThoroughLoop V1 is local-first.

## What Is Stored

The current MVP can store:

- Saved memos
- Saved founder actions
- Saved decisions
- Settings

These are stored in the browser or device through storage adapters.

## What Is Not Included

The current MVP does not include:

- User accounts
- Production database persistence
- Payments
- Team workspaces
- Production external provider sync
- Server-side AI calls

Pasted founder context in the main browser loop is processed locally in the app and saved only when the user saves a loop. API intake, webhook, and optional Notion export routes can process submitted payloads through server-side Next.js routes, but those routes are not the app's saved-loop persistence layer.

## Local Storage Boundary

Saved data is device-specific. Clearing browser storage may remove saved memos, founder actions, decisions, and settings.

If the app is opened in a different browser, profile, device, or private browsing session, saved data may not be available.

Optional Notion export requires explicit environment configuration and user action. It is separate from the local saved-loop storage boundary.

## Public Demo Guidance

Avoid pasting sensitive production data into public demos, screenshots, bug reports, or issues. Use synthetic examples from `docs/demo-examples.md` when possible.

## Compliance Boundary

This MVP does not claim GDPR, SOC 2, ISO, HIPAA, or enterprise security readiness.
