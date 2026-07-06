import type { NextFunction, Request, Response } from "express";
import express from "express";
import { existsSync, readFileSync, statSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { join } from "node:path";

try {
  process.loadEnvFile();
} catch {
  // no .env file present — rely on env vars provided by the platform
}

const clientSrc = process.env.CLIENT_SRC ?? "app";
// 4000 by default: the API (back) owns 3000, so a missing .env must not collide with it.
const port = process.env.PORT ?? 4000;

const app = express();
app.use(serveTsAsJs);
app.use(express.static(clientSrc, { index: false }));
app.get("/", serveIndexHtml);

app.get("*splat", handleSplatRoute);

function handleSplatRoute(req: Request, res: Response, next: NextFunction) {
  if (req.path.includes(".")) return next();
  serveIndexHtml(req, res);
}

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:3000";
const apiBaseEncoded = JSON.stringify({ API_BASE_URL: apiBaseUrl });

// Injects server-known config into the client as a global, read once at startup.
const indexHtml = readFileSync(join(clientSrc, "index.html"), "utf8").replace(
  "</head>",
  `  <script>window.__ENV__ = ${apiBaseEncoded};</script>\n  </head>`,
);
function serveIndexHtml(_req: Request, res: Response) {
  res.type("html").send(indexHtml);
}

const cache = new Map<string, { mtimeMs: number; js: string }>();
function serveTsAsJs(req: Request, res: Response, next: NextFunction) {
  if (!req.path.endsWith(".js")) return next();

  const tsPath = join(clientSrc, req.path.replace(/\.js$/, ".ts"));
  // return if not found
  if (!existsSync(tsPath)) return next();
  const mtimeMs = statSync(tsPath).mtimeMs;

  const cached = cache.get(tsPath);
  if (cached && cached.mtimeMs === mtimeMs) {
    res.type("text/javascript").send(cached.js);
    return;
  }

  const js = stripTypeScriptTypes(readFileSync(tsPath, "utf8"), { mode: "strip" });
  cache.set(tsPath, { mtimeMs, js });
  res.type("text/javascript").send(js);
}
