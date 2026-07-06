import { get } from "../http-client.js";
export type HealthStatus = {
  uptime: number;
  runs: number;
};

export const getHealth = () => get<HealthStatus>("/api/health");
