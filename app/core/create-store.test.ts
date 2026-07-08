import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { createStore } from "./create-store.ts";

// Minimal localStorage stub so the persist branch is testable outside the browser.
function createLocalStorageStub() {
  const data = new Map<string, string>();
  return {
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
    removeItem: (key: string) => void data.delete(key),
    setItem: (key: string, value: string) => void data.set(key, value),
  } as Storage;
}

undefined;
