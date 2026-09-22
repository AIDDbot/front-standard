import { createLogger } from "../core/create-logger.js";

declare global {
  var API_BASE_URL: string;
}

const logger = createLogger("http");

/** Logs and throws when the response is not 2xx. */
const ensureOk = (method: string, url: string, response: Response): void => {
  if (response.ok) {
    logger.debug(`${method} ${url} ${response.status}`);
    return;
  }
  const message = `${method} ${url} failed: ${response.status} ${response.statusText}`;
  logger.error(message);
  throw new Error(message);
};

const get = async <T>(path: string): Promise<T> => {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url);
  ensureOk("GET", url, response);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return response.json() as Promise<T>;
};

const post = async <T>(path: string, body: unknown): Promise<T> => {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  ensureOk("POST", url, response);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return response.json() as Promise<T>;
};

export { get, post };
