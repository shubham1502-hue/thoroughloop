# ThoroughLoop Architecture

ThoroughLoop is a TypeScript monorepo with a web-first MVP and a mobile-ready structure.

## Web-First MVP

`apps/web` contains the production MVP. It uses Next.js and React for:

- Homepage diagnosis loop
- Workflow picker
- Workflow-specific pages
- Saved memos
- Founder action queue
- Decision log
- Settings

The web app should stay thin. Product logic should remain in `packages/core`.

## Shared Core Package

`packages/core` owns platform-independent product behavior:

- Workflow definitions
- Types for diagnoses, memos, founder actions, decisions, and settings
- Storage keys and storage adapter interface
- Workflow detection
- Risk signal extraction
- Company or deal name extraction
- Missing context and recommended next step mapping
- Founder memo generation
- Memo to founder action conversion
- Memo to decision conversion
- Date and validation helpers

This package should not import from web, mobile, or browser-specific APIs.

## Shared UI Package

`packages/ui` contains reusable design tokens and practical shared UI foundations. It should stay portable and avoid coupling to `apps/web` route behavior.

## Mobile Skeleton

`apps/mobile` is an Expo skeleton. It exists to keep the repo mobile-ready without blocking the web MVP. Mobile screens can reuse `packages/core` later.

## Storage Adapter Pattern

Persistence goes through the `StorageAdapter` interface:

```ts
getItem(key: string): Promise<string | null> | string | null
setItem(key: string, value: string): Promise<void> | void
removeItem(key: string): Promise<void> | void
```

The web app uses a local storage adapter. Mobile can use an AsyncStorage-backed adapter when that dependency is intentionally added or confirmed.

## Legacy Storage Keys

The visible product name is ThoroughLoop, but the local storage keys intentionally preserve the previous Founder OS Lite names:

- `founder_os_lite_memos`
- `founder_os_lite_actions`
- `founder_os_lite_decisions`
- `founder_os_lite_settings`

This protects compatibility with saved local data from the previous working name.

## Why No Backend Yet

V1 is intentionally local-first. There is no backend, auth, database, payments, external integration layer, or server-side AI call. This keeps the MVP focused on the founder operating diagnosis loop before adding account or sync complexity.

## Future Extension Points

- Database persistence behind the storage adapter boundary
- Optional auth after product validation
- Workspace support after single-founder workflows are proven
- Export or share flows for memos
- Server-side AI generation after deterministic behavior is validated
- Full Expo app using shared core logic
