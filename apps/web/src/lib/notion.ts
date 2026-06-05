import type { SavedMemo } from "@thoroughloop/core";
import { memoToDecision } from "@thoroughloop/core";

export interface NotionExportPayload {
  memo: SavedMemo;
}

export interface NotionExportResult {
  pageId: string;
  url: string;
}

export interface NotionErrorBody {
  code: "MISSING_ENV" | "INVALID_PAYLOAD" | "NOTION_ERROR";
  message: string;
}

const REQUIRED_STRING_FIELDS = [
  "id",
  "title",
  "problem",
  "diagnosis",
  "founderAction",
  "recommendedDecision",
  "createdAt"
] as const;

export function validateNotionExportPayload(
  input: unknown
): { ok: true; memo: SavedMemo } | { ok: false; error: NotionErrorBody } {
  if (
    input === null ||
    typeof input !== "object" ||
    !("memo" in input)
  ) {
    return {
      ok: false,
      error: {
        code: "INVALID_PAYLOAD",
        message: "Request body must include a memo object."
      }
    };
  }

  const { memo } = input as { memo: unknown };

  if (memo === null || typeof memo !== "object") {
    return {
      ok: false,
      error: {
        code: "INVALID_PAYLOAD",
        message: "memo must be an object."
      }
    };
  }

  const m = memo as Record<string, unknown>;

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof m[field] !== "string" || m[field] === "") {
      return {
        ok: false,
        error: {
          code: "INVALID_PAYLOAD",
          message: `memo.${field} is required and must be a non-empty string.`
        }
      };
    }
  }

  return { ok: true, memo: memo as SavedMemo };
}

export function buildNotionPage(
  memo: SavedMemo,
  databaseId: string
): Record<string, unknown> {
  const decision = memoToDecision(memo);

  return {
    parent: { database_id: databaseId },
    properties: {
      Name: {
        title: [{ text: { content: memo.title } }]
      },
      "Operating Diagnosis": {
        rich_text: [{ text: { content: memo.diagnosis } }]
      },
      "Founder Memo": {
        rich_text: [{ text: { content: memo.problem } }]
      },
      "Founder Action": {
        rich_text: [{ text: { content: memo.founderAction } }]
      },
      "Review Decision": {
        rich_text: [{ text: { content: memo.recommendedDecision } }]
      },
      "Review Date": decision.reviewDate
        ? { date: { start: decision.reviewDate } }
        : { date: null },
      Source: {
        select: { name: "ThoroughLoop" }
      },
      "Created At": {
        date: { start: memo.createdAt }
      }
    }
  };
}
