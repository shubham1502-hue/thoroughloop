# PROJECT_HANDOFF.md

## Product name

ThoroughLoop

## Previous working name

Founder OS Lite

## Positioning

Paste messy founder context. Close the loop.

ThoroughLoop turns scattered founder notes into one diagnosis, one founder action, and one decision to review next week.

## Target user

Early-stage non-technical founders.

Secondary users include Founder's Office operators, BizOps operators, RevOps operators, startup generalists, and solo founders.

## Core product loop

1. Paste messy context.
2. Detect workflow.
3. Extract signals.
4. Generate founder memo.
5. Save memo.
6. Save founder action.
7. Save decision.
8. Review decision next week.

## Routes

Web routes:

- `/`
- `/workflows`
- `/workflows/revenue-rescue`
- `/workflows/weekly-review`
- `/workflows/investor-update`
- `/workflows/onboarding-risk`
- `/workflows/hiring-bottleneck`
- `/memos`
- `/action-queue`
- `/decision-log`
- `/settings`

Mobile route plan:

- `/`
- `/workflows`
- `/memos`
- `/action-queue`
- `/decision-log`
- `/settings`

## Storage keys

- `founder_os_lite_memos`
- `founder_os_lite_actions`
- `founder_os_lite_decisions`
- `founder_os_lite_settings`

The visible product name is ThoroughLoop, but these keys remain unchanged for compatibility with the previous working name.

## Storage adapter strategy

Persistence is routed through the `StorageAdapter` interface in `packages/core`. The web app uses `WebLocalStorageAdapter`. The mobile app includes a placeholder adapter that can be swapped for AsyncStorage after `@react-native-async-storage/async-storage` is installed.

## Monorepo structure

```text
thoroughloop/
  apps/
    web/
    mobile/
  packages/
    core/
    ui/
  docs/
  AGENTS.md
  PROJECT_HANDOFF.md
  README.md
```

## Copy rules

- Use "founder action" instead of "task".
- Use "memo" instead of "report".
- Use "diagnosis" instead of "analysis".
- Use "workflow" instead of "module".
- Use "operating focus" instead of "project".
- Use "metric to watch".
- Avoid "boost productivity".
- Avoid "streamline workflows".
- Avoid "enterprise-grade".
- Avoid "AI-powered platform".
- Avoid motivational filler.
- Do not use emojis.
- Do not use em dash characters.

## Known limitations

V1 uses local browser or device storage. Data is device-specific. Production should later add database persistence, auth, real LLM generation, workspace support, and integrations.

## Future roadmap

- Add account-based persistence.
- Add workspace support for teams.
- Add real LLM generation behind a reviewed backend boundary.
- Add import paths for CRM exports, docs, and spreadsheet notes.
- Add mobile parity with Expo Router.
- Add reminder loops for weekly decision review.
- Add export and share flows for memos.

## Validation checklist

1. Homepage loads.
2. Click Try sample diagnosis.
3. Textarea fills.
4. Diagnosis preview appears.
5. Detected workflow is Revenue Rescue or close.
6. Click Generate founder memo.
7. Memo appears.
8. Click Save memo.
9. Click Save founder action.
10. Click Save decision.
11. Open `/memos`.
12. Saved memo appears.
13. Open `/action-queue`.
14. Saved founder action appears.
15. Open `/decision-log`.
16. Saved decision appears.
17. Refresh page.
18. Saved data still appears.
19. Open `/workflows/weekly-review`.
20. Latest decision appears in Review previous decision section.
