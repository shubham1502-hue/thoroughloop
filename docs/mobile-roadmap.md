# Mobile Roadmap

## Expo app setup

The mobile skeleton lives in `apps/mobile`. It is intentionally light in v1 so the web MVP stays production-ready first. Install dependencies with the root `npm install`, then run the mobile app from `apps/mobile` when active mobile work begins.

## Expo Router usage

Use Expo Router to keep mobile routes aligned with the web route model:

- `/`
- `/workflows`
- `/memos`
- `/action-queue`
- `/decision-log`
- `/settings`

## AsyncStorage or secure storage strategy

The current mobile adapter is a placeholder. Install `@react-native-async-storage/async-storage` for ordinary local persistence. Use secure storage only for sensitive future data. Keep all storage access behind the shared `StorageAdapter` interface from `packages/core`.

## EAS Build setup

1. Add an Expo account.
2. Run `npx eas init` from `apps/mobile`.
3. Add `eas.json`.
4. Configure Android and iOS build profiles.
5. Run internal builds before store submission.

## EAS Submit setup

1. Configure App Store Connect credentials.
2. Configure Google Play service account credentials.
3. Add submit profiles in `eas.json`.
4. Use `npx eas submit` only after internal QA passes.

## Android internal testing path

1. Create an Android package name.
2. Build with EAS for Android.
3. Upload to Google Play internal testing.
4. Add testers.
5. Validate storage, navigation, and memo generation on a physical Android device.

## iOS TestFlight path

1. Create an iOS bundle identifier.
2. Build with EAS for iOS.
3. Upload to App Store Connect.
4. Add TestFlight testers.
5. Validate storage, navigation, and memo generation on a physical iPhone.

## Store metadata checklist

- App name and subtitle.
- Short description.
- Full description.
- Screenshots for phone sizes.
- Privacy policy URL.
- Support URL.
- Data collection answers.
- Age rating.
- Category.
- Keywords.

## Future push notifications

Push notifications can support weekly decision review reminders. Add them only after the core local workflow is proven and users ask for recurring follow-up.

## Future auth and database sync

Auth and database sync should come after the offline-first workflow is stable. The likely production path is account login, encrypted workspace storage, cross-device sync, and optional team workspaces.
