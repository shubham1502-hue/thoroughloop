# Demo Walkthrough

This walkthrough shows the current ThoroughLoop browser loop with sample founder context.

## Open The App

Live demo:

```text
https://thoroughloop.vercel.app
```

Local dev:

```bash
npm run dev:web
```

Then open `http://localhost:3000`.

## Walk The Main Loop

1. Open the landing page.
2. Click `Paste your context`.
3. Choose a sample card or paste short messy founder notes.
4. Confirm the compose view focuses the text area and shows the soft hint.
5. Click `Close the loop`.
6. Confirm the thinking state says `Finding the actual bottleneck`.
7. Review the result:
   - Diagnosis
   - TL;DR
   - Why this is the bottleneck
   - Evidence from your context
   - Missing context
   - Founder action this week
   - Decision to review next week
   - Investor-safe summary
8. Click `Copy memo` if you want the memo text.
9. Click `Save loop`.
10. Click `Start new loop`.
11. Confirm the saved loop appears in the `Saved loops` section.
12. Refresh the page and confirm the saved loop persists.

## Demo Surfaces

Use the footer `Demo surfaces` links to inspect the existing route pages:

- `Memos` -> `/memos`
- `Actions` -> `/action-queue`
- `Decisions` -> `/decision-log`
- `Workflows` -> `/workflows`
- `Settings` -> `/settings`

These pages read from the same local browser storage used by the main loop.

## Sample Context

```text
FinCore Labs is stuck after pricing. BrightLayer AI ghosted after proposal. Northstar Ops needs internal review. I keep adding leads, but the late-stage pipeline is not closing.
```

## Expected Result Shape

The exact wording may vary with the deterministic workflow logic, but the result should stay focused on:

- One bottleneck diagnosis.
- One founder action for this week.
- One decision question to review next week.
- A short investor-safe summary.

## Local Data Note

Saved loops, memos, actions, decisions, and settings use browser `localStorage`. Clearing browser storage may remove saved local data.
