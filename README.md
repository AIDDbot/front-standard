# [front-standard](https://github.com/AIDDbot/front-standard)

Archetype with boilerplate code for a front web app with standard HTML, CSS and JS (TypeScript stripped on the fly). No frameworks, no build step, no CDN dependencies.

## Quick start

Install Node.js 26.10+ with npm 12.0.0 (included with Node 26.10.0). The pinned version is in `.node-version`.

```bash
node --version
npm --version
npm ci
npm start       # production, http://localhost:4000
npm test
npm run dev
npm run test:watch
npm run lint
```

During regular development, run only the unit tests and basic lint checks:

```bash
npm test
npm run lint
```

The `quality:all` script is intended for final validation or when explicitly requested; it does not need to be run after every development change.

> [!IMPORTANT]
> The client expects the API (the `back` project) at `http://localhost:3000` by default.
> Change it with `API_SITE` (default `http://localhost`) and `API_PORT` (default `3000`),
> or set `API_BASE_URL` to override the whole URL.

The application title is configured with `displayName` in `package.json` (and falls back to the package `name`).

## Architecture

The client (`src/app`) has three layers. Dependencies only point downwards; `npm run lint` enforces it.

```txt
src/app/
  app.ts          -> bootstraps router and nav menu
  router/         -> one folder per page; depends on shared and core
  shared/         -> code used by two or more pages; depends on core
  core/           -> domain-free infrastructure (router, store, logger, escaping)
```

### Page folders

Each route lives in its own kebab-case folder under `src/app/router`, lazily loaded from `routes.ts`:

```txt
src/app/router/login/
  login.page.ts               -> container: presentation plus data access, the route entry point
  login.types.ts              -> types owned by this page
  login.repository.ts         -> page-specific data access: http, localStorage or a store (optional)
  login-form.component.ts     -> presentational, non-reusable component (optional)
```

- Only the `*.page.ts` talks to repositories and stores. Presentational components receive data through attributes or properties and report back with `CustomEvent`s.
- Pages never import from other pages. Code starts inside its page and moves to `shared/` once a second page needs it (e.g. `shared/repositories/auth.repository.ts` serves login and register).
- Only create the optional files a page actually needs.
- Prefix local tag names with the page name (`ab-login-form`); the custom elements registry is global.

## Testing

Tests use the native Node test runner with `--import ./test-setup.ts` and the quoted `src/**/*.test.ts` glob. `npm run quality:coverage` produces text and `coverage/lcov.info` reports, enforcing 80% minimum lines and functions. Test files, configuration files and generated folders are excluded. Coverage measures loaded code, including middleware subprocesses.

### Node 26.x stability

Native [TypeScript type-stripping](https://nodejs.org/docs/latest-v26.x/api/typescript.html#type-stripping) and [server watch mode](https://nodejs.org/docs/latest-v26.x/api/cli.html#--watch) are stable. The server executes erasable TypeScript directly. Node does not type-check or read tsconfig; Oxlint performs type checking. Use `.ts` for all relative TypeScript imports, including lazy browser imports.

[`module.stripTypeScriptTypes`](https://nodejs.org/docs/latest-v26.x/api/module.html#modulestriptypescripttypescode-options) remains stability 1.2 (Release candidate) and emits an experimental warning. Its strip mode serves browser `.ts` requests as `text/javascript`. Production caches by file mtime; development sends `Cache-Control: no-store` and strips each request. HTML loads `/app.ts`; legacy `.js` aliases are not served.

Native [test coverage](https://nodejs.org/docs/latest-v26.x/api/test.html#collecting-code-coverage), coverage threshold/exclusion flags, and [test watch mode](https://nodejs.org/docs/latest-v26.x/api/test.html#watch-mode) remain experimental. These statuses were checked against Node 26.x documentation and `node --help` using Node 26.10.0.

### Migration baseline

Before migration: 48 tests passed, loaded-code coverage was 100% in lines and functions, and production startup served `/app.js` on port 4000 with `text/javascript`. After migration: 50 tests passed, with 95.93% lines and 96.88% functions, including server configuration and middleware tests.

Unit tests (`npm test`) are kept to the minimum: utilities in `core/` and `shared/`, and any genuinely complex logic. Presentation is covered by end-to-end tests, and repositories are not unit tested, since they are thin API calls.

## Semantic and accessible HTML

Markup must be semantic and accessible, and easy to target from e2e tests:

- Use landmarks and native elements (`header`, `nav`, `main`, `section`, `form`, `button`) with real headings; label sections with `aria-labelledby` and forms or navs with `aria-label`.
- Every input has a `<label for>`; buttons have visible text or an `aria-label`.
- Announce async results with `role="status"` (plus `aria-busy` while loading) and errors with `role="alert"`; mark the active link with `aria-current="page"`.
- E2E tests select by role and accessible name first (`getByRole`, `getByLabel`); add a `data-testid` only for elements without one (status text, values).

## Rendering untrusted values

Prefer DOM APIs such as `textContent` for dynamic content. When a value must be interpolated into an `innerHTML` template, escape it first with `escapeHtml` from `src/app/core/escape-html.ts`. Escaping HTML does not validate URLs; validate untrusted links separately before using them in `href` or `src` attributes.

## Conventions

- Repositories call the API only through `get`, `post`, `put`, `patch` and `del` from `src/app/shared/http-client.ts`; it adds the bearer token and handles `204 No Content`.
- A failed request throws `ApiError` with `status` and the API's error text; branch on it with `isApiError(error) && error.status === 404`, never with type assertions. A `401` also clears `authStore`.
- Asset URLs in `index.html` are root-absolute (`/styles/...`, `/logo.png`) so nested routes such as `/items/42` load styled on reload.

## Logging

- **Server**: `createLogger(source)` from `src/server/logger.ts` appends to `LOG_DIR/yyyy-mm-dd.log` (default `./logs`) and echoes to the console. Every HTTP request gets one line. Set the minimum level with `LOG_LEVEL` (`debug` | `info` | `warn` | `error`, default `info`).
- **Browser**: `createLogger(source)` from `src/app/core/create-logger.ts` writes to the browser console with the same line format. Extra arguments are passed through so objects stay inspectable:

```ts
import { createLogger } from "../core/create-logger.ts";

const logger = createLogger("home");
logger.info("Items loaded", items);
```

The default level is `info`. To see `debug` traces, run `localStorage.logLevel = "debug"` in DevTools and reload.

## Tool stack

- [TypeScript7](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) : typed superset of JavaScript that compiles to plain JavaScript.
- [Node26](https://nodejs.org/es/blog/release/v26.0.0/) : JavaScript runtime built on Chrome's V8 JavaScript engine.
- [Oxlint](https://oxc.rs/docs/guide/usage/linter) : high-performance linter for TypeScript

---

-**Author**

- [Alberto Basalo](https://albertobasalo.dev)
- [GitHub](https://github.com/AIDDbot/AIDDbot)
- [A.I. Code Academy](https://aicode.academy) (ES)
