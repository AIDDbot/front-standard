import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

// Named constants for test values
const API = "http://api.test";
const TOKEN = "secret-token";
const STATUS_OK = 200;
const STATUS_NO_CONTENT = 204;
const STATUS_UNAUTHORIZED = 401;
const STATUS_NOT_FOUND = 404;
const STATUS_SERVER_ERROR = 500;

interface CapturedRequest {
  url: string;
  init: RequestInit;
}

// Use deterministic in-memory storage for the persisted auth store. URLSearchParams is a
// string map and already answers `null` for a missing key, like Storage does.
const storage = new URLSearchParams();
globalThis.localStorage = {
  getItem: (key: string) => storage.get(key),
  removeItem: (key: string) => {
    storage.delete(key);
  },
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
} as unknown as Storage;
globalThis.API_BASE_URL = API;

// Imported after the stubs because the auth store reads localStorage on load.
const { ApiError, del, get, isApiError, patch, post, put } = await import("./http-client.ts");
const { authStore } = await import("./store/auth.store.ts");

let captured: CapturedRequest[] = [];

/** Replaces fetch with one that records the request and answers with `response`. */
function respondWith(response: Response): void {
  globalThis.fetch = (input: string | URL | Request, init: RequestInit = {}) => {
    captured.push({ init, url: input instanceof Request ? input.url : input.toString() });
    return Promise.resolve(response);
  };
}

const jsonResponse = (body: unknown, status = STATUS_OK): Response =>
  Response.json(body, { status });

const headersOf = (index = 0): Record<string, string> =>
  captured[index]?.init.headers as Record<string, string>;

const signIn = (): void => {
  authStore.set({
    token: TOKEN,
    user: { createdAt: "", email: "a@b.c", id: 1, name: "A", role: "user" },
  });
};

beforeEach(() => {
  captured = [];
  authStore.set(undefined);
});

void test("get parses the JSON body from the base url", async () => {
  respondWith(jsonResponse({ id: 1 }));
  const result = await get<{ id: number }>("/api/items/1");
  assert.deepEqual(result, { id: 1 });
  assert.equal(captured[0]?.url, `${API}/api/items/1`);
  assert.equal(captured[0]?.init.method, "GET");
  assert.equal(captured[0]?.init.body, undefined);
});

const expectJsonBody = (method: string): void => {
  assert.equal(captured[0]?.init.method, method);
  assert.equal(captured[0]?.init.body, JSON.stringify({ name: "x" }));
  assert.equal(headersOf()["Content-Type"], "application/json");
};

void test("post sends a JSON body", async () => {
  respondWith(jsonResponse({ ok: true }));
  await post("/api/items", { name: "x" });
  expectJsonBody("POST");
});

void test("put sends a JSON body", async () => {
  respondWith(jsonResponse({ ok: true }));
  await put("/api/items/1", { name: "x" });
  expectJsonBody("PUT");
});

void test("patch sends a JSON body", async () => {
  respondWith(jsonResponse({ ok: true }));
  await patch("/api/items/1", { name: "x" });
  expectJsonBody("PATCH");
});

void test("no Authorization header when signed out", async () => {
  respondWith(jsonResponse({}));
  await get("/api/items");
  assert.equal(headersOf()["Authorization"], undefined);
});

void test("bearer token is attached when signed in, read at request time", async () => {
  signIn();
  respondWith(jsonResponse({}));
  await get("/api/items");
  assert.equal(headersOf()["Authorization"], `Bearer ${TOKEN}`);
});

void test("del resolves to undefined on 204 No Content", async () => {
  respondWith(new Response(undefined, { status: STATUS_NO_CONTENT }));
  const result: unknown = await del<unknown>("/api/items/1");
  assert.equal(result, undefined);
  assert.equal(captured[0]?.init.method, "DELETE");
  assert.equal(headersOf()["Content-Type"], undefined);
});

void test("non-2xx throws ApiError with status and the API error text", async () => {
  respondWith(jsonResponse({ error: "Item not found" }, STATUS_NOT_FOUND));
  const error: unknown = await get("/api/items/9").catch((caught: unknown) => caught);
  assert.ok(isApiError(error));
  assert.ok(error instanceof ApiError);
  assert.equal(error.status, STATUS_NOT_FOUND);
  assert.equal(error.message, "Item not found");
  assert.equal(error.name, "ApiError");
});

void test("non-JSON error body falls back to method, url and status", async () => {
  respondWith(
    new Response("<html>boom</html>", { status: STATUS_SERVER_ERROR, statusText: "Server Error" }),
  );
  const error: unknown = await put("/api/items/1", {}).catch((caught: unknown) => caught);
  assert.ok(isApiError(error));
  assert.equal(error.status, STATUS_SERVER_ERROR);
  assert.equal(error.message, `PUT ${API}/api/items/1 failed: 500 Server Error`);
});

void test("isApiError rejects plain errors and non-errors", () => {
  assert.equal(isApiError(new Error("x")), false);
  assert.equal(isApiError({ message: "x", status: STATUS_NOT_FOUND }), false);
  assert.equal(isApiError(undefined), false);
});

void test("401 clears the stored session", async () => {
  signIn();
  respondWith(jsonResponse({ error: "Invalid token" }, STATUS_UNAUTHORIZED));
  const error: unknown = await get("/api/me").catch((caught: unknown) => caught);
  assert.ok(isApiError(error));
  assert.equal(error.status, STATUS_UNAUTHORIZED);
  assert.equal(authStore.get(), undefined);
});

void test("other errors keep the stored session", async () => {
  signIn();
  respondWith(jsonResponse({ error: "Item not found" }, STATUS_NOT_FOUND));
  await get("/api/items/9").catch(() => undefined);
  assert.equal(authStore.get()?.token, TOKEN);
});
