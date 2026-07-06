declare global {
  interface Window {
    __ENV__?: { API_BASE_URL?: string };
  }
}

/** Set by the server (see server.ts) from the API_BASE_URL env var. */
const locationServer = `${location.protocol}//${location.hostname}:3000`;
const API_BASE_URL = window.__ENV__?.API_BASE_URL ?? locationServer;

export async function get<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`POST ${url} failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
