import { createStore } from "../../core/create-store.ts";
import type { HealthStatus } from "./about.types.ts";

/** In-memory cache of the last /api/health payload. */
export const healthStore = createStore<HealthStatus | undefined>("health");
