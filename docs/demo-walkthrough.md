# Demo Walkthrough

This walkthrough shows the main ThoroughLoop MVP loop with synthetic data.

## What To Open

Start the web app:

```bash
npm run dev:web
```

Open `http://localhost:3000`.

## Sample Messy Founder Context

```text
FinCore Labs has been stuck in negotiation for 21 days after raising a pricing concern. BrightLayer AI has not replied after proposal for 12 days. Northstar Ops completed demo but is waiting for internal review. Founder follow-up is slipping and proposal-stage deals need attention this week.
```

## Expected Diagnosis Result

- Detected workflow: Revenue Rescue
- Confidence: High or close, depending on current keyword scoring
- Expected companies or deal names: FinCore Labs, BrightLayer AI, Northstar Ops
- Expected risk signals: stuck deal or blocked workflow, pricing concern, follow-up decay, proposal-stage risk, late-stage revenue risk
- Recommended next step: generate a Revenue Rescue memo and prioritize the highest-risk follow-up

## Expected Memo

The generated memo should include:

- Problem
- Evidence
- Diagnosis
- Recommended decision
- Founder action
- Owner
- Due date
- Metric to watch
- What to ignore this week
- Assumptions made
- Investor-safe summary

The memo should be editable before saving.

## Expected Founder Action

The saved founder action should focus on one founder-led follow-up to the highest-risk late-stage account and confirming the next decision step.

Find it at `/action-queue`.

## Expected Decision

The saved decision should decide whether founder-led follow-up should focus on the highest-risk late-stage account before adding new top-of-funnel work.

Find it at `/decision-log`.

## Saved Memo Location

After clicking `Save memo`, open `/memos`. The saved memo should appear with:

- Title
- Workflow
- Created date
- Problem
- Recommended decision
- Founder action
- Investor-safe summary

## Weekly Review Recall

After clicking `Save decision`, open `/workflows/weekly-review`.

The `Review previous decision` section should show the latest saved decision, assigned action, owner, metric to watch, review date, outcome note input, and status selector.

## Local Data Note

The MVP uses local browser storage. If the saved items do not appear, confirm browser storage has not been cleared or blocked.
