import { get } from "../../shared/http-client.ts";
import type { HealthStatus } from "./about.types.ts";

export const getHealth = (): Promise<HealthStatus> => get<HealthStatus>("/api/health");
