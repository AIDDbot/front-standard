# [front-standard](https://github.com/AIDDbot/front-standard)

Archetype with boilerplate code for a front web app with standard HTML, CSS and JS (TypeScript stripped on the fly). No frameworks, no build step, no CDN dependencies.

## Quick start

> [!IMPORTANT]
> this projects uses `bun` as a package manager and runner.

1. Install bun: the fastest tooling manager for Node.js projects.

```bash
# Install Bun
# (Windows PowerShell)
powershell -c "irm bun.com/install.ps1 | iex"
# (macOS/Linux)
curl -fsSL https://bun.com/install | bash -s
# Verify installation
bun --version
# Upgrade Bun to the latest stable version
bun upgrade --stable
```

2. Install dependencies and run the tests

```bash
bun install
bun start   # runs the server in production mode
bun test    # runs the unit tests
bun dev     # runs in watch mode for development
bun lint    # runs the linter
```

During regular development, run only the unit tests and basic lint checks:

```bash
bun test
bun run lint
```

The `quality:all` script is intended for final validation or when explicitly requested; it does not need to be run after every development change.

> [!IMPORTANT]
> The client expects the API (the `back` project) at `http://localhost:3000` by default.
> Change it with `API_SITE` (default `http://localhost`) and `API_PORT` (default `3000`),
> or set `API_BASE_URL` to override the whole URL.

The application title is configured with `displayName` in `package.json` (and falls back to the package `name`).

## Architecture

The client (`src/app`) has three layers. Dependencies only point downwards; `bun run lint` enforces it.

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

Unit tests (`bun test`) are kept to the minimum: utilities in `core/` and `shared/`, and any genuinely complex logic. Presentation is covered by end-to-end tests, and repositories are not unit tested, since they are thin API calls.

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
import { createLogger } from "../core/create-logger.js";

const logger = createLogger("home");
logger.info("Items loaded", items);
```

The default level is `info`. To see `debug` traces, run `localStorage.logLevel = "debug"` in DevTools and reload.

## Tool stack

- [TypeScript7](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) : typed superset of JavaScript that compiles to plain JavaScript.
- [Node26](https://nodejs.org/es/blog/release/v26.0.0/) : JavaScript runtime built on Chrome's V8 JavaScript engine.
- [Bun 1.4.0](https://bun.com/docs/installation) : JavaScript runtime and package manager used by this project.
- [Oxlint](https://oxc.rs/docs/guide/usage/linter) : high-performance linter for TypeScript

---

-**Author**

- [Alberto Basalo](https://albertobasalo.dev)
- [GitHub](https://github.com/AIDDbot/AIDDbot)
- [A.I. Code Academy](https://aicode.academy) (ES)
