# Media Capture Checklist

## Purpose

These screenshots help non-technical founders, recruiters, and hiring managers understand ThoroughLoop quickly without reading the full documentation. The goal is comprehension, not decoration.

Screenshots should show the current browser loop: messy founder context, operating diagnosis, founder memo, one action, one decision, and locally saved loops.

## Screenshot Sequence

| File name | Screen to capture | Purpose | Recommended caption |
| --- | --- | --- | --- |
| `01-landing-page.png` | Landing page with the main promise, local-first boundary, and `Paste your context` call to action. | Show what problem the app solves at a glance. | Start with messy founder context. |
| `02-sample-context-options.png` | Sample cards for stalled pipeline, onboarding handoff, hiring confusion, product feedback overload, and investor update chaos. | Show that the app is for founder operating messes, not generic notes. | Choose a founder operating mess. |
| `03-messy-founder-context.png` | Compose screen with stalled-pipeline context loaded and the `Close the loop` button visible. | Show what the founder gives the app. | Paste or load the messy context. |
| `04-thinking-state.png` | Thinking state showing signal, evidence, missing context, action, and review decision. | Show that the app separates operating signal before showing the memo. | Separate the operating signal. |
| `05-generated-diagnosis.png` | Result header showing workflow label, diagnosis, and TL;DR. | Show the core output. | Review the diagnosis. |
| `06-founder-memo-evidence.png` | Memo sections for bottleneck reasoning, evidence, and missing context. | Show that the app explains the diagnosis. | Inspect the memo evidence. |
| `07-founder-action-decision.png` | Founder action this week and decision to review next week. | Show how context becomes execution and decision hygiene. | Turn the memo into action and decision. |
| `08-saved-loops.png` | Saved loops section after saving the stalled-pipeline loop. | Show that loops remain available locally for review later. | Save the loop for review. |

## Demo Input Used

Fictional sample founder context:

```text
FinCore Labs is stuck in negotiation after a pricing concern. BrightLayer AI has not replied after proposal for 12 days. Northstar Ops completed demo but is waiting for internal review. I keep adding new leads, but the late-stage pipeline feels soft. Discovery may be too shallow because buyers cannot repeat the business case back clearly.
```

## Capture Notes

- Use a desktop viewport.
- Prefer a 1440px width if possible.
- Avoid showing browser bookmarks or personal data.
- Avoid logged-in or private context.
- Clear local storage before capture if needed.
- Save screenshots as PNG.
- Keep captions short and founder-facing.
- Use fictional sample context only.
- Do not add testimonials, traction claims, or real founder quotes to screenshots.

## Automated Capture

If Playwright is available, run this from the repository root:

```bash
node scripts/capture-screenshots.mjs
```

The script captures the documented live demo by default. To capture a local app instead, start the web app and pass a local URL:

```bash
THOROUGHLOOP_CAPTURE_URL=http://127.0.0.1:3100 node scripts/capture-screenshots.mjs
```

## Manual Fallback

If browser automation fails:

1. Open the live demo.
2. Clear local storage if needed.
3. Use the fictional stalled-pipeline sample input above.
4. Capture the same 8 states manually.
5. Save files with the exact names listed in the screenshot sequence.
6. Store the files in `docs/assets/screenshots/`.
7. Rerun README wiring only after the files are available.
