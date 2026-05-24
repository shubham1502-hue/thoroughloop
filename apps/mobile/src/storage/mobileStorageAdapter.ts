import type { StorageAdapter } from "@thoroughloop/core";

const memoryStore = new Map<string, string>();

export const mobileStorageAdapter: StorageAdapter = {
  getItem(key) {
    return memoryStore.get(key) ?? null;
  },
  setItem(key, value) {
    memoryStore.set(key, value);
  },
  removeItem(key) {
    memoryStore.delete(key);
  }
};

// TODO: Replace this placeholder with @react-native-async-storage/async-storage before shipping mobile persistence.
