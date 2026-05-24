# Manual Smoke Test Checklist

Use this checklist before merging product-facing changes to the web MVP.

## Start The Web App

```bash
npm ci
npm run dev:web
```

Open `http://localhost:3000`.

## Synthetic Sample Context

```text
FinCore Labs has been stuck in negotiation for 21 days after raising a pricing concern. BrightLayer AI has not replied after proposal for 12 days. Northstar Ops completed demo but is waiting for internal review. Founder follow-up is slipping and proposal-stage deals need attention this week.
```

## Checklist

- [ ] Homepage loads.
- [ ] Paste the synthetic sample context.
- [ ] Click `Diagnose this mess`.
- [ ] Diagnosis preview appears.
- [ ] Detected workflow is Revenue Rescue or a close revenue workflow result.
- [ ] Extracted risks include pricing, proposal, stuck deal, or follow-up decay.
- [ ] Extracted companies include FinCore Labs, BrightLayer AI, or Northstar Ops.
- [ ] Click `Generate founder memo`.
- [ ] Founder memo appears.
- [ ] Memo includes problem, evidence, diagnosis, recommended decision, founder action, owner, due date, metric to watch, what to ignore, assumptions, and investor-safe summary.
- [ ] Click `Save memo`.
- [ ] Confirmation says `Memo saved`.
- [ ] Click `Save founder action`.
- [ ] Confirmation says `Founder action saved`.
- [ ] Click `Save decision`.
- [ ] Confirmation says `Decision saved`.
- [ ] Refresh the page.
- [ ] Open `/memos`.
- [ ] Saved memo appears.
- [ ] Open `/action-queue`.
- [ ] Saved founder action appears.
- [ ] Open `/decision-log`.
- [ ] Saved decision appears.
- [ ] Open `/workflows/weekly-review`.
- [ ] Latest decision appears in `Review previous decision`.
- [ ] Open `/settings`.
- [ ] Settings route loads and can save local settings.

## Notes

The current MVP stores data locally in the browser. If saved items do not appear, check whether browser storage was cleared or blocked.
