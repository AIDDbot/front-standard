import { get } from "../../shared/http-client.js";
import type { HealthStatus } from "./about.types.js";

export const getHealth = (): Promise<HealthStatus> => get<HealthStatus>("/api/health");
