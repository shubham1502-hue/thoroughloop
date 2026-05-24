import { safeJsonParse } from "./validation";

export interface StorageAdapter {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
}

export const STORAGE_KEYS = {
  memos: "founder_os_lite_memos",
  actions: "founder_os_lite_actions",
  decisions: "founder_os_lite_decisions",
  settings: "founder_os_lite_settings"
} as const;

export async function readJson<T>(adapter: StorageAdapter, key: string, fallback: T): Promise<T> {
  const stored = await adapter.getItem(key);
  return safeJsonParse<T>(stored, fallback);
}

export async function writeJson<T>(adapter: StorageAdapter, key: string, value: T): Promise<void> {
  await adapter.setItem(key, JSON.stringify(value));
}

export async function readCollection<T>(adapter: StorageAdapter, key: string): Promise<T[]> {
  const stored = await readJson<unknown>(adapter, key, []);
  return Array.isArray(stored) ? (stored as T[]) : [];
}

export async function appendCollectionItem<T>(
  adapter: StorageAdapter,
  key: string,
  item: T
): Promise<T[]> {
  const items = await readCollection<T>(adapter, key);
  const nextItems = [item, ...items];
  await writeJson(adapter, key, nextItems);
  return nextItems;
}

export async function replaceCollectionItem<T extends { id: string }>(
  adapter: StorageAdapter,
  key: string,
  item: T
): Promise<T[]> {
  const items = await readCollection<T>(adapter, key);
  const nextItems = items.map((current) => (current.id === item.id ? item : current));
  await writeJson(adapter, key, nextItems);
  return nextItems;
}

export async function removeCollectionItem<T extends { id: string }>(
  adapter: StorageAdapter,
  key: string,
  id: string
): Promise<T[]> {
  const items = await readCollection<T>(adapter, key);
  const nextItems = items.filter((item) => item.id !== id);
  await writeJson(adapter, key, nextItems);
  return nextItems;
}
