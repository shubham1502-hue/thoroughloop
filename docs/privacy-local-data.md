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

- Backend services
- Auth
- Database persistence
- Payments
- External integrations
- Server-side AI calls

Pasted founder context is not sent to a ThoroughLoop backend because no backend exists in V1.

## Local Storage Boundary

Saved data is device-specific. Clearing browser storage may remove saved memos, founder actions, decisions, and settings.

If the app is opened in a different browser, profile, device, or private browsing session, saved data may not be available.

## Public Demo Guidance

Avoid pasting sensitive production data into public demos, screenshots, bug reports, or issues. Use synthetic examples from `docs/demo-examples.md` when possible.

## Compliance Boundary

This MVP does not claim GDPR, SOC 2, ISO, HIPAA, or enterprise security readiness.
