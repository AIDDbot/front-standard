import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { createStore } from "./create-store.ts";

// Minimal localStorage stub so the persist branch is testable outside the browser.
function createLocalStorageStub() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
    clear: () => data.clear(),
    key: (index: number) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
  } as Storage;
}

void describe("createStore", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      value: createLocalStorageStub(),
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, "localStorage");
  });

  void it("returns the initial value", () => {
    const store = createStore("counter", 42);
    assert.equal(store.get(), 42);
  });

  void it("updates the value and notifies subscribers", () => {
    const store = createStore("counter", 0);
    const seen: number[] = [];
    store.subscribe((value) => seen.push(value));

    store.set(1);
    store.set(2);

    assert.equal(store.get(), 2);
    assert.deepEqual(seen, [1, 2]);
  });

  void it("stops notifying after unsubscribe", () => {
    const store = createStore("counter", 0);
    const seen: number[] = [];
    const unsubscribe = store.subscribe((value) => seen.push(value));

    store.set(1);
    unsubscribe();
    store.set(2);

    assert.deepEqual(seen, [1]);
  });

  void it("does not touch localStorage when persist is off", () => {
    const store = createStore("volatile", "a");
    store.set("b");
    assert.equal(localStorage.getItem("volatile"), null);
  });

  void it("persists values to localStorage when persist is on", () => {
    const store = createStore("route", "/", { persist: true });
    store.set("/about");
    assert.equal(localStorage.getItem("route"), JSON.stringify("/about"));
  });

  void it("hydrates from a persisted value", () => {
    localStorage.setItem("route", JSON.stringify("/items/7"));
    const store = createStore("route", "/", { persist: true });
    assert.equal(store.get(), "/items/7");
  });

  void it("falls back to the initial value on a corrupt persisted entry", () => {
    localStorage.setItem("route", "{not json");
    const store = createStore("route", "/", { persist: true });
    assert.equal(store.get(), "/");
  });
});
