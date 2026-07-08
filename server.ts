import { existsSync, readFileSync, statSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import path from "node:path";
import express, { type NextFunction, type Request, type Response } from "express";

const clientSrc = process.env.CLIENT_SRC ?? "app";
const DEFAULT_FRONT_PORT = 4000;

const port = process.env.PORT ?? DEFAULT_FRONT_PORT;

const app = express();
app.use(serveTsAsJs);
app.use(express.static(clientSrc, { index: false }));
app.get("/", serveIndexHtml);

app.get("*splat", handleSplatRoute);

function handleSplatRoute(req: Request, res: Response, next: NextFunction) {
  if (req.path.includes(".")) {
    return next();
  }
  serveIndexHtml(req, res);
}

app.listen(port, () => {
  process.stdout.write(`Serving client at http://localhost:${port}\n`);
});

const indexHtml = readFileSync(path.join(clientSrc, "index.html"), "utf8");
function serveIndexHtml(_req: Request, res: Response) {
  res.type("html").send(indexHtml);
}

const cache = new Map<string, { mtimeMs: number; js: string }>();
function serveTsAsJs(req: Request, res: Response, next: NextFunction) {
  if (!req.path.endsWith(".js")) {
    return next();
  }

  const tsPath = path.join(clientSrc, req.path.replace(/\.js$/u, ".ts"));
  // Return if not found
  if (!existsSync(tsPath)) {
    return next();
  }
  const { mtimeMs } = statSync(tsPath);

  const cached = cache.get(tsPath);
  if (cached && cached.mtimeMs === mtimeMs) {
    res.type("text/javascript").send(cached.js);
    return;
  }

  const js = stripTypeScriptTypes(readFileSync(tsPath, "utf8"), { mode: "strip" });
  cache.set(tsPath, { js, mtimeMs });
  res.type("text/javascript").send(js);
}
