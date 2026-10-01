import { createLogger } from "../core/create-logger.ts";
import { isErrorBody } from "./is-error-body.ts";
import { authStore } from "./store/auth.store.ts";

declare global {
  var API_BASE_URL: string;
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const UNAUTHORIZED = 401;

const logger = createLogger("http");

/** A non-2xx API response; branch on `status` (401, 404, …) and show `message` to the user. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Narrows a caught value to `ApiError`, with no type assertion. */
export const isApiError = (value: unknown): value is ApiError => value instanceof ApiError;

/** Reads the `{ error }` body the back error handler always sends on a non-2xx response. */
const readErrorMessage = async (response: Response): Promise<string | undefined> => {
  try {
    const body: unknown = await response.clone().json();
    if (isErrorBody(body)) {
      return body.error;
    }
  } catch {
    // Non-JSON or empty body: fall back to the generic message below.
  }
  return undefined;
};

/** A rejected token means the session is over: clear it so the UI falls back to signed-out. */
const dropRejectedSession = (status: number): void => {
  if (status === UNAUTHORIZED && authStore.get() !== undefined) {
    authStore.set(undefined);
  }
};

/** Logs and throws an `ApiError` when the response is not 2xx; its message is the API's `error` text when present. */
const ensureOk = async (method: HttpMethod, url: string, response: Response): Promise<void> => {
  if (response.ok) {
    logger.debug(`${method} ${url} ${response.status}`);
    return;
  }
  const fallback = `${method} ${url} failed: ${response.status} ${response.statusText}`;
  const message = (await readErrorMessage(response)) ?? fallback;
  logger.error(message);
  dropRejectedSession(response.status);
  throw new ApiError(message, response.status);
};

/** JSON content type when there is a body; bearer token read at request time when signed in. */
const buildHeaders = (hasBody: boolean): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }
  const token = authStore.get()?.token;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

/** Sends one request and returns the parsed JSON body, or `undefined` for 204 / empty bodies. */
const request = async <T>(method: HttpMethod, path: string, body?: unknown): Promise<T> => {
  const url = `${API_BASE_URL}${path}`;
  const hasBody = body !== undefined;
  const response = await fetch(url, {
    ...(hasBody && { body: JSON.stringify(body) }),
    headers: buildHeaders(hasBody),
    method,
  });
  await ensureOk(method, url, response);
  const text = await response.text();
  // The API contract is the only source for T; an empty body (204) yields undefined.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return (text === "" ? undefined : JSON.parse(text)) as T;
};

const get = <T>(path: string): Promise<T> => request<T>("GET", path);

const post = <T>(path: string, body: unknown): Promise<T> => request<T>("POST", path, body);

const put = <T>(path: string, body: unknown): Promise<T> => request<T>("PUT", path, body);

const patch = <T>(path: string, body: unknown): Promise<T> => request<T>("PATCH", path, body);

const del = <T = void>(path: string): Promise<T> => request<T>("DELETE", path);

export { del, get, patch, post, put };
