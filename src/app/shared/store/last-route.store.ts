import { createStore } from "../../core/create-store.ts";

/** Last visited pathname, persisted across reloads. */
export const lastRouteStore = createStore<string>("last-route", "/", { persist: true });
