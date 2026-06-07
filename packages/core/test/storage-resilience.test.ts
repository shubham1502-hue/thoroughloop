import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  appendCollectionItem,
  contextSourceLabelForId,
  generateFounderMemo,
  memoToDecision,
  memoToFounderAction,
  readCollection,
  readJson,
  STORAGE_KEYS,
  writeJson,
  type SavedDecision,
  type SavedFounderAction,
  type SavedMemo,
  type Settings,
  type StorageAdapter
} from "../src/index";
import { createDiagnosis } from "../src/index";

class MemoryStorageAdapter implements StorageAdapter {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

function createSavedObjects() {
  const memo = generateFounderMemo(createDiagnosis("FinCore Labs has a proposal stuck after pricing."));
  return {
    memo,
    action: memoToFounderAction(memo),
    decision: memoToDecision(memo)
  };
}

describe("local storage resilience", () => {
  it("reads empty storage as empty collections", async () => {
    const adapter = new MemoryStorageAdapter();

    await assert.doesNotReject(async () => {
      assert.deepEqual(await readCollection<SavedMemo>(adapter, STORAGE_KEYS.memos), []);
      assert.deepEqual(await readCollection<SavedFounderAction>(adapter, STORAGE_KEYS.actions), []);
      assert.deepEqual(await readCollection<SavedDecision>(adapter, STORAGE_KEYS.decisions), []);
    });
  });

  it("reads valid existing memo, action, and decision data", async () => {
    const adapter = new MemoryStorageAdapter();
    const { memo, action, decision } = createSavedObjects();

    await writeJson(adapter, STORAGE_KEYS.memos, [memo]);
    await writeJson(adapter, STORAGE_KEYS.actions, [action]);
    await writeJson(adapter, STORAGE_KEYS.decisions, [decision]);

    assert.deepEqual(await readCollection<SavedMemo>(adapter, STORAGE_KEYS.memos), [memo]);
    assert.deepEqual(await readCollection<SavedFounderAction>(adapter, STORAGE_KEYS.actions), [action]);
    assert.deepEqual(await readCollection<SavedDecision>(adapter, STORAGE_KEYS.decisions), [decision]);
  });

  it("reads legacy saved loops without source metadata", async () => {
    const adapter = new MemoryStorageAdapter();
    const { memo, action, decision } = createSavedObjects();
    const legacyMemo = { ...memo };
    const legacyAction = { ...action };
    const legacyDecision = { ...decision };

    delete legacyMemo.contextSource;
    delete legacyAction.contextSource;
    delete legacyDecision.contextSource;

    await writeJson(adapter, STORAGE_KEYS.memos, [legacyMemo]);
    await writeJson(adapter, STORAGE_KEYS.actions, [legacyAction]);
    await writeJson(adapter, STORAGE_KEYS.decisions, [legacyDecision]);

    const [storedMemo] = await readCollection<SavedMemo>(adapter, STORAGE_KEYS.memos);
    const [storedAction] = await readCollection<SavedFounderAction>(adapter, STORAGE_KEYS.actions);
    const [storedDecision] = await readCollection<SavedDecision>(adapter, STORAGE_KEYS.decisions);

    assert.equal(contextSourceLabelForId(storedMemo.contextSource), "General founder notes");
    assert.equal(contextSourceLabelForId(storedAction.contextSource), "General founder notes");
    assert.equal(contextSourceLabelForId(storedDecision.contextSource), "General founder notes");
  });

  it("reads valid existing settings data", async () => {
    const adapter = new MemoryStorageAdapter();
    const settings: Settings = {
      founderName: "Founder",
      companyName: "ThoroughLoop",
      companyStage: "Pre-seed",
      industry: "B2B SaaS",
      icp: "Startup operators",
      gtmMotion: "Founder-led sales",
      defaultWeeklyReviewDay: "Friday"
    };

    await writeJson(adapter, STORAGE_KEYS.settings, settings);

    assert.deepEqual(await readJson<Settings | null>(adapter, STORAGE_KEYS.settings, null), settings);
  });

  it("handles malformed JSON without throwing", async () => {
    const adapter = new MemoryStorageAdapter();

    adapter.setItem(STORAGE_KEYS.memos, "{not valid json");

    assert.deepEqual(await readCollection<SavedMemo>(adapter, STORAGE_KEYS.memos), []);
  });

  it("handles wrong collection shapes without throwing", async () => {
    const adapter = new MemoryStorageAdapter();

    adapter.setItem(STORAGE_KEYS.actions, JSON.stringify({ id: "not-an-array" }));
    adapter.setItem(STORAGE_KEYS.decisions, JSON.stringify("not-an-array"));

    assert.deepEqual(await readCollection<SavedFounderAction>(adapter, STORAGE_KEYS.actions), []);
    assert.deepEqual(await readCollection<SavedDecision>(adapter, STORAGE_KEYS.decisions), []);
  });

  it("saves collection items without overwriting unrelated keys", async () => {
    const adapter = new MemoryStorageAdapter();
    const { memo } = createSavedObjects();

    adapter.setItem("unrelated_key", "keep me");
    const savedMemos = await appendCollectionItem(adapter, STORAGE_KEYS.memos, memo);

    assert.deepEqual(savedMemos, [memo]);
    assert.equal(adapter.getItem("unrelated_key"), "keep me");
  });

  it("preserves legacy storage key names", () => {
    assert.deepEqual(STORAGE_KEYS, {
      memos: "founder_os_lite_memos",
      actions: "founder_os_lite_actions",
      decisions: "founder_os_lite_decisions",
      settings: "founder_os_lite_settings"
    });
  });
});
