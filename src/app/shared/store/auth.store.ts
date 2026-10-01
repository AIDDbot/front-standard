import type { AuthSession } from "../repositories/auth.repository.ts";
import { createStore } from "../../core/create-store.ts";

/** The logged-in user's session (token + user), persisted across reloads. */
export const authStore = createStore<AuthSession | undefined>("auth", undefined, {
  persist: true,
});
