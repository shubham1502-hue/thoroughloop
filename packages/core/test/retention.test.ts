import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildReviewCalendarIcs,
  formatLoopTextBackup,
  formatReviewReminder,
  reviewDateForMemo,
  type SavedMemo
} from "../src/index";

const baseMemo: SavedMemo = {
  id: "memo-retention-1",
  createdAt: "2026-07-06T10:00:00.000Z",
  workflow: "Revenue Rescue",
  title: "Discovery quality, not pricing.",
  problem: "Late-stage deals are stuck after pricing concerns.",
  evidence: "Acme raised pricing concern after proposal.",
  diagnosis: "The bottleneck is discovery quality, not pricing.",
  recommendedDecision: "Should Acme stay in founder-led discovery next week?",
  founderAction: "Sit in on the next two discovery calls.",
  doneWhen: "Two call notes include buyer language and the next decision step.",
  owner: "Founder",
  dueDate: "2026-07-07",
  reviewDate: "2026-07-14",
  metricToWatch: "Proposal-to-close conversion next 7 days.",
  ignoreThisWeek: "Do not optimize top-of-funnel volume yet.",
  assumptionsMade: [
    {
      assumption: "Deal value is not provided.",
      whyItMatters: "Prioritization may change if the stuck deal is materially larger.",
      whatToVerifyNext: "Add deal value before finalizing the founder action."
    }
  ],
  investorSafeSummary: "Revenue risk is in late-stage follow-up quality.",
  sourceSnippets: [
    {
      id: "source_1",
      text: "Acme is qualified, pricing is unresolved, and no owner is assigned.",
      reason: "Mentions pricing concern"
    }
  ],
  rawInput: "Acme is qualified, pricing is unresolved, and no owner is assigned.",
  contextSource: "crm_pipeline"
};

describe("retention helpers", () => {
  it("formats a review reminder with decision, action, metric, and source", () => {
    const reminder = formatReviewReminder(baseMemo, { decisionReviewDate: "2026-07-13" });

    assert.match(reminder, /Review ThoroughLoop decision on Jul 13, 2026/);
    assert.match(reminder, /Decision: Should Acme stay in founder-led discovery next week\?/);
    assert.match(reminder, /Action: Sit in on the next two discovery calls\./);
    assert.match(reminder, /Metric: Proposal-to-close conversion next 7 days\./);
    assert.match(reminder, /Source: CRM or sales pipeline notes/);
  });

  it("formats a text backup with action, decision, review date, metric, assumptions, and raw input", () => {
    const backup = formatLoopTextBackup(baseMemo, { decisionReviewDate: "2026-07-13" });

    assert.match(backup, /ThoroughLoop loop backup: Discovery quality, not pricing\./);
    assert.match(backup, /Founder action\nSit in on the next two discovery calls\./);
    assert.match(backup, /Done when\nTwo call notes include buyer language and the next decision step\./);
    assert.match(backup, /Recommended decision\nShould Acme stay in founder-led discovery next week\?/);
    assert.match(backup, /Review date: Jul 13, 2026/);
    assert.match(backup, /Metric to watch\nProposal-to-close conversion next 7 days\./);
    assert.match(backup, /Source support\n- Mentions pricing concern: Acme is qualified/);
    assert.match(backup, /Assumption: Deal value is not provided\./);
    assert.match(backup, /Raw input\nAcme is qualified, pricing is unresolved, and no owner is assigned\./);
  });

  it("builds an all-day calendar event with start and end dates", () => {
    const ics = buildReviewCalendarIcs(baseMemo, {
      decisionReviewDate: "2026-07-13",
      dtstamp: new Date("2026-07-06T00:00:00.000Z"),
      uid: "memo-retention-test"
    });

    assert.match(ics, /BEGIN:VCALENDAR/);
    assert.match(ics, /END:VCALENDAR/);
    assert.match(ics, /UID:memo-retention-test/);
    assert.match(ics, /DTSTAMP:20260706T000000Z/);
    assert.match(ics, /SUMMARY:Review ThoroughLoop decision/);
    assert.match(ics, /DTSTART;VALUE=DATE:20260713/);
    assert.match(ics, /DTEND;VALUE=DATE:20260714/);
  });

  it("escapes calendar text characters that have special ICS meaning", () => {
    const memo: SavedMemo = {
      ...baseMemo,
      recommendedDecision: "Decide, then commit; avoid \\ drift\nReview next week",
      founderAction: "Write buyer words, owner; and \\ next step"
    };
    const ics = buildReviewCalendarIcs(memo, {
      decisionReviewDate: "2026-07-13",
      dtstamp: new Date("2026-07-06T00:00:00.000Z"),
      uid: "memo-retention-test"
    });

    assert.match(ics, /Decide\\, then commit\\; avoid \\\\ drift\\nReview next week/);
    assert.match(ics, /Write buyer words\\, owner\\; and \\\\ next step/);
  });

  it("falls back to seven days after createdAt when the review date is invalid", () => {
    const reviewDate = reviewDateForMemo(baseMemo, { decisionReviewDate: "not-a-date" });

    assert.equal(reviewDate, "2026-07-13");
  });

  it("uses the edited memo review date when no override is provided", () => {
    const reviewDate = reviewDateForMemo(baseMemo);

    assert.equal(reviewDate, "2026-07-14");
  });

  it("includes edited task fields in calendar output", () => {
    const ics = buildReviewCalendarIcs(baseMemo, {
      dtstamp: new Date("2026-07-06T00:00:00.000Z"),
      uid: "memo-retention-test"
    });

    assert.match(ics, /DTSTART;VALUE=DATE:20260714/);
    assert.match(ics, /Done when: Two call notes include buyer language and the next decision step\./);
  });

  it("falls back safely when createdAt and review date are invalid", () => {
    const reviewDate = reviewDateForMemo(
      { ...baseMemo, createdAt: "not-a-date" },
      { decisionReviewDate: "not-a-date", now: new Date("2026-07-06T00:00:00.000Z") }
    );

    assert.equal(reviewDate, "2026-07-13");
  });
});
