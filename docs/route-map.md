# ThoroughLoop Web Route Map

The web MVP is centered on one loop: paste context, diagnose, generate a memo, save one founder action, save one decision, and review that decision later.

## Routes

| Route | Purpose | Main user action | Persistence behavior | Current limitation |
| --- | --- | --- | --- | --- |
| `/` | Main first-session diagnosis loop | Paste messy founder context, generate diagnosis, generate memo, save memo, save founder action, save decision | Writes to local storage through storage adapters | Data is device-specific |
| `/workflows` | Workflow picker | Choose a workflow-specific route | No direct writes | Cards are informational entry points |
| `/workflows/revenue-rescue` | Diagnose stuck deals, stale follow-ups, pricing concerns, and pipeline leakage | Paste revenue context, add optional deal fields, generate memo | Can save memo, founder action, and decision locally | No CRM integration |
| `/workflows/weekly-review` | Turn the week into one operating memo and review the latest saved decision | Review previous decision, add weekly context, generate memo | Reads latest decision and can update it locally | Review history is local only |
| `/workflows/investor-update` | Turn saved memos or fresh context into an investor-safe update | Select saved memo or paste investor context, generate update versions | Reads saved memos and can save generated outputs locally | No investor delivery integration |
| `/workflows/onboarding-risk` | Identify customers stuck after close-won before activation | Paste onboarding context, add optional customer fields, generate memo | Can save memo, founder action, and decision locally | No customer success integration |
| `/workflows/hiring-bottleneck` | Decide which hiring bottleneck needs founder attention | Paste hiring context, add optional candidate or role fields, generate memo | Can save memo, founder action, and decision locally | No applicant tracking integration |
| `/memos` | Saved founder memo library | Search, filter, copy, or delete saved memos | Reads and writes `founder_os_lite_memos` | No cloud sync |
| `/action-queue` | One founder action per memo | Filter, update, or delete saved founder actions | Reads and writes `founder_os_lite_actions` | Not a project management system |
| `/decision-log` | Decision review log | Update outcome notes, statuses, review dates, or delete decisions | Reads and writes `founder_os_lite_decisions` | No team assignment or notifications |
| `/settings` | Founder and company defaults | Save founder name, company profile, ICP, GTM motion, and weekly review day | Reads and writes `founder_os_lite_settings` | Settings are local to the device |

## Not Found And Error States

- Unknown routes render the app-level not-found page.
- Runtime route errors render the app-level error page with a retry action and home link.
