import { contextSourceLabelForId } from "./contextSources";
import { addDays, formatDisplayDate, toIsoDate } from "./date";
import { memoToDecision } from "./memo";
import type { SavedMemo } from "./types";

type RetentionDateOptions = {
  decisionReviewDate?: string;
  now?: Date;
};

type CalendarOptions = RetentionDateOptions & {
  dtstamp?: Date;
  uid?: string;
};

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDateOnly(value: string | undefined): Date | null {
  if (!value || !DATE_ONLY_PATTERN.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseAnyDate(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toIcsDate(value: string): string {
  return value.replaceAll("-", "");
}

function toIcsTimestamp(value: Date): string {
  return value
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(/\.\d{3}Z$/, "Z");
}

function normalizeLine(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not provided";
}

function sourceLabelForMemo(memo: SavedMemo): string {
  return contextSourceLabelForId(memo.contextSource);
}

export function safeFileDate(value: string): string {
  const dateOnly = value.slice(0, 10);
  if (parseDateOnly(dateOnly)) {
    return dateOnly;
  }

  return "undated";
}

export function reviewDateForMemo(
  memo: SavedMemo,
  options: RetentionDateOptions = {},
): string {
  const decisionReviewDate =
    options.decisionReviewDate?.trim() || memo.reviewDate || memoToDecision(memo).reviewDate;

  if (parseDateOnly(decisionReviewDate)) {
    return decisionReviewDate;
  }

  const createdAt = parseAnyDate(memo.createdAt);
  const fallbackBase = createdAt ?? options.now ?? new Date(0);
  return toIsoDate(addDays(fallbackBase, 7));
}

export function escapeIcsText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

export function formatReviewReminder(
  memo: SavedMemo,
  options: RetentionDateOptions = {},
): string {
  const reviewDate = formatDisplayDate(reviewDateForMemo(memo, options));

  return [
    `Review ThoroughLoop decision on ${reviewDate}`,
    "",
    `Decision: ${normalizeLine(memo.recommendedDecision)}`,
    `Action: ${normalizeLine(memo.founderAction)}`,
    `Metric: ${normalizeLine(memo.metricToWatch)}`,
    `Source: ${sourceLabelForMemo(memo)}`,
    "",
    "Bring back what happened, what moved, what got stuck, and whether to commit, change, delegate, or stop.",
  ].join("\n");
}

export function formatLoopTextBackup(
  memo: SavedMemo,
  options: RetentionDateOptions = {},
): string {
  const reviewDate = reviewDateForMemo(memo, options);
  const assumptions =
    memo.assumptionsMade.length > 0
      ? memo.assumptionsMade
          .map(
            (assumption) =>
              `- Assumption: ${assumption.assumption}\n  Why it matters: ${assumption.whyItMatters}\n  What to verify next: ${assumption.whatToVerifyNext}`,
          )
          .join("\n")
      : "None captured.";

  return [
    `ThoroughLoop loop backup: ${normalizeLine(memo.title)}`,
    "",
    `Workflow: ${memo.workflow}`,
    `Source: ${sourceLabelForMemo(memo)}`,
    `Created: ${formatDisplayDate(memo.createdAt)}`,
    `Review date: ${formatDisplayDate(reviewDate)}`,
    "",
    "Founder action",
    normalizeLine(memo.founderAction),
    "",
    "Done when",
    normalizeLine(memo.doneWhen),
    "",
    "Recommended decision",
    normalizeLine(memo.recommendedDecision),
    "",
    "Metric to watch",
    normalizeLine(memo.metricToWatch),
    "",
    "Investor-safe summary",
    normalizeLine(memo.investorSafeSummary),
    "",
    "Evidence",
    normalizeLine(memo.evidence),
    "",
    "Source support",
    memo.sourceSnippets?.length
      ? memo.sourceSnippets.map((snippet) => `- ${snippet.reason}: ${snippet.text}`).join("\n")
      : "No source snippets captured.",
    "",
    "Assumptions made",
    assumptions,
    "",
    "Raw input",
    normalizeLine(memo.rawInput),
  ].join("\n");
}

export function buildReviewCalendarIcs(
  memo: SavedMemo,
  options: CalendarOptions = {},
): string {
  const reviewDate = reviewDateForMemo(memo, options);
  const startDate = parseDateOnly(reviewDate) ?? new Date(0);
  const endDate = toIsoDate(addDays(startDate, 1));
  const uid =
    options.uid ?? `thoroughloop-${memo.id}-${reviewDate}@thoroughloop.local`;
  const dtstamp = toIcsTimestamp(options.dtstamp ?? new Date());
  const description = [
    `Decision: ${normalizeLine(memo.recommendedDecision)}`,
    `Founder action: ${normalizeLine(memo.founderAction)}`,
    `Done when: ${normalizeLine(memo.doneWhen)}`,
    `Metric to watch: ${normalizeLine(memo.metricToWatch)}`,
    `Source: ${sourceLabelForMemo(memo)}`,
    "Saved in local browser storage. Bring back the outcome before changing the loop.",
  ].join("\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ThoroughLoop//No Account Review Reminder//EN",
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(uid)}`,
    `DTSTAMP:${dtstamp}`,
    "SUMMARY:Review ThoroughLoop decision",
    `DESCRIPTION:${escapeIcsText(description)}`,
    `DTSTART;VALUE=DATE:${toIcsDate(reviewDate)}`,
    `DTEND;VALUE=DATE:${toIcsDate(endDate)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
