"use client";

import type { StorageAdapter } from "@thoroughloop/core";

export const webLocalStorageAdapter: StorageAdapter = {
  getItem(key) {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(key);
  },
  setItem(key, value) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(key, value);
  },
  removeItem(key) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(key);
  }
};
