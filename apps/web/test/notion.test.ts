import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { SavedMemo } from "@thoroughloop/core";
import { buildNotionPage, validateNotionExportPayload } from "../src/lib/notion.js";

const baseMemo: SavedMemo = {
  id: "memo-1",
  createdAt: "2026-06-05T10:00:00.000Z",
  workflow: "Revenue Rescue",
  title: "Discovery quality, not pricing.",
  problem: "Late-stage deals are stalling after pricing conversations.",
  evidence: "FinCore ghosted after proposal. BrightLayer circling for 12 days.",
  diagnosis: "The bottleneck is discovery quality, not pricing.",
  recommendedDecision: "Should the founder stay in discovery before more selling effort?",
  founderAction: "Sit in on the next two discovery calls.",
  owner: "founder",
  dueDate: "2026-06-12",
  metricToWatch: "Discovery call-to-advance rate",
  ignoreThisWeek: "New top-of-funnel sourcing",
  assumptionsMade: [],
  investorSafeSummary: "Revenue risk is not a pricing issue.",
  rawInput: "Late stage deals are stuck."
};

describe("validateNotionExportPayload", () => {
  it("rejects missing memo (null body)", () => {
    const result = validateNotionExportPayload(null);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, "INVALID_PAYLOAD");
    }
  });

  it("rejects body without memo key", () => {
    const result = validateNotionExportPayload({});
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, "INVALID_PAYLOAD");
    }
  });

  it("rejects memo missing required field: id", () => {
    const { id: _id, ...rest } = baseMemo;
    const result = validateNotionExportPayload({ memo: rest });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, "INVALID_PAYLOAD");
      assert.ok(result.error.message.includes("id"), `Expected message to mention 'id', got: ${result.error.message}`);
    }
  });

  it("rejects memo missing required field: title", () => {
    const { title: _title, ...rest } = baseMemo;
    const result = validateNotionExportPayload({ memo: rest });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, "INVALID_PAYLOAD");
      assert.ok(result.error.message.includes("title"));
    }
  });

  it("rejects memo missing required field: problem", () => {
    const { problem: _problem, ...rest } = baseMemo;
    const result = validateNotionExportPayload({ memo: rest });
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.error.message.includes("problem"));
  });

  it("rejects memo missing required field: diagnosis", () => {
    const { diagnosis: _diagnosis, ...rest } = baseMemo;
    const result = validateNotionExportPayload({ memo: rest });
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.error.message.includes("diagnosis"));
  });

  it("rejects memo missing required field: founderAction", () => {
    const { founderAction: _fa, ...rest } = baseMemo;
    const result = validateNotionExportPayload({ memo: rest });
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.error.message.includes("founderAction"));
  });

  it("rejects memo missing required field: recommendedDecision", () => {
    const { recommendedDecision: _rd, ...rest } = baseMemo;
    const result = validateNotionExportPayload({ memo: rest });
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.error.message.includes("recommendedDecision"));
  });

  it("rejects memo missing required field: createdAt", () => {
    const { createdAt: _ca, ...rest } = baseMemo;
    const result = validateNotionExportPayload({ memo: rest });
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.error.message.includes("createdAt"));
  });

  it("accepts a valid memo", () => {
    const result = validateNotionExportPayload({ memo: baseMemo });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.memo.id, baseMemo.id);
    }
  });
});

describe("buildNotionPage", () => {
  it("sets parent database_id", () => {
    const page = buildNotionPage(baseMemo, "db-abc");
    assert.deepEqual((page.parent as { database_id: string }).database_id, "db-abc");
  });

  it("maps title to Name property", () => {
    const page = buildNotionPage(baseMemo, "db-abc");
    const props = page.properties as Record<string, unknown>;
    const name = props["Name"] as { title: Array<{ text: { content: string } }> };
    assert.equal(name.title[0].text.content, baseMemo.title);
  });

  it("maps diagnosis to Operating Diagnosis", () => {
    const page = buildNotionPage(baseMemo, "db-abc");
    const props = page.properties as Record<string, unknown>;
    const field = props["Operating Diagnosis"] as { rich_text: Array<{ text: { content: string } }> };
    assert.equal(field.rich_text[0].text.content, baseMemo.diagnosis);
  });

  it("maps problem to Founder Memo", () => {
    const page = buildNotionPage(baseMemo, "db-abc");
    const props = page.properties as Record<string, unknown>;
    const field = props["Founder Memo"] as { rich_text: Array<{ text: { content: string } }> };
    assert.equal(field.rich_text[0].text.content, baseMemo.problem);
  });

  it("maps founderAction to Founder Action", () => {
    const page = buildNotionPage(baseMemo, "db-abc");
    const props = page.properties as Record<string, unknown>;
    const field = props["Founder Action"] as { rich_text: Array<{ text: { content: string } }> };
    assert.equal(field.rich_text[0].text.content, baseMemo.founderAction);
  });

  it("maps recommendedDecision to Review Decision", () => {
    const page = buildNotionPage(baseMemo, "db-abc");
    const props = page.properties as Record<string, unknown>;
    const field = props["Review Decision"] as { rich_text: Array<{ text: { content: string } }> };
    assert.equal(field.rich_text[0].text.content, baseMemo.recommendedDecision);
  });

  it("maps Source as a select property with value ThoroughLoop", () => {
    const page = buildNotionPage(baseMemo, "db-abc");
    const props = page.properties as Record<string, unknown>;
    const field = props["Source"] as { select: { name: string } };
    assert.equal(field.select.name, "ThoroughLoop");
  });

  it("maps Created At as a date property", () => {
    const page = buildNotionPage(baseMemo, "db-abc");
    const props = page.properties as Record<string, unknown>;
    const field = props["Created At"] as { date: { start: string } };
    assert.equal(field.date.start, baseMemo.createdAt);
  });

  it("maps Review Date as a date property with a non-null ISO date", () => {
    const page = buildNotionPage(baseMemo, "db-abc");
    const props = page.properties as Record<string, unknown>;
    const field = props["Review Date"] as { date: { start: string } | null };
    assert.ok(field.date !== null, "Review Date should be set");
    assert.match(field.date?.start ?? "", /^\d{4}-\d{2}-\d{2}$/, "Review Date should be an ISO date string");
  });
});
