import { createStore } from "../../core/create-store.js";
import type { HealthStatus } from "./about.types.js";

/** In-memory cache of the last /api/health payload. */
export const healthStore = createStore<HealthStatus | undefined>("health");
