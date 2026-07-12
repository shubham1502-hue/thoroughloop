import { memoToDecision, memoToFounderAction } from "./memo";
import { STORAGE_KEYS, type StorageAdapter } from "./storage";
import type { SavedDecision, SavedFounderAction, SavedMemo } from "./types";
import { safeJsonParse } from "./validation";

export interface SavedLoopRecords {
  memo: SavedMemo;
  founderAction: SavedFounderAction;
  decision: SavedDecision;
}

export interface SavedLoopCollections {
  records: SavedLoopRecords;
  memos: SavedMemo[];
  actions: SavedFounderAction[];
  decisions: SavedDecision[];
}

type LoopStorageName = "memos" | "actions" | "decisions";
type StorageSnapshot = Record<LoopStorageName, string | null>;

const loopStorageNames: LoopStorageName[] = ["memos", "actions", "decisions"];

function parseCollection<T>(value: string | null): T[] {
  const parsed = safeJsonParse<unknown>(value, []);
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}

async function restoreSnapshot(adapter: StorageAdapter, snapshot: StorageSnapshot): Promise<void> {
  for (const name of loopStorageNames) {
    const key = STORAGE_KEYS[name];
    const previousValue = snapshot[name];

    if (previousValue === null) {
      await adapter.removeItem(key);
    } else {
      await adapter.setItem(key, previousValue);
    }
  }
}

export function prepareSavedLoopRecords(memo: SavedMemo): SavedLoopRecords {
  return {
    memo,
    founderAction: memoToFounderAction(memo),
    decision: memoToDecision(memo)
  };
}

export async function saveSavedLoop(
  adapter: StorageAdapter,
  memo: SavedMemo
): Promise<SavedLoopCollections> {
  const records = prepareSavedLoopRecords(memo);
  const snapshot: StorageSnapshot = {
    memos: await adapter.getItem(STORAGE_KEYS.memos),
    actions: await adapter.getItem(STORAGE_KEYS.actions),
    decisions: await adapter.getItem(STORAGE_KEYS.decisions)
  };
  const memos = [
    records.memo,
    ...parseCollection<SavedMemo>(snapshot.memos).filter((item) => item.id !== records.memo.id)
  ];
  const actions = [
    records.founderAction,
    ...parseCollection<SavedFounderAction>(snapshot.actions).filter(
      (item) => item.sourceMemoId !== records.memo.id
    )
  ];
  const decisions = [
    records.decision,
    ...parseCollection<SavedDecision>(snapshot.decisions).filter(
      (item) => item.sourceMemoId !== records.memo.id
    )
  ];

  try {
    await adapter.setItem(STORAGE_KEYS.memos, JSON.stringify(memos));
    await adapter.setItem(STORAGE_KEYS.actions, JSON.stringify(actions));
    await adapter.setItem(STORAGE_KEYS.decisions, JSON.stringify(decisions));
  } catch (error) {
    try {
      await restoreSnapshot(adapter, snapshot);
    } catch {
      // The original save error remains the actionable failure for the caller.
    }

    throw error;
  }

  return { records, memos, actions, decisions };
}
