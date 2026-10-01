import type { NextFunction, Request, Response } from "express";
import { existsSync, readFileSync, statSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import path from "node:path";
import { clientSrc, isDev, setNoCache } from "./config.ts";

const cache = new Map<string, { mtimeMs: number; js: string }>();
if (typeof stripTypeScriptTypes !== "function") {
  throw new TypeError("Node.js >=26.10.0 with module.stripTypeScriptTypes is required.");
}

const transpileTsToJs = (code: string): string => stripTypeScriptTypes(code, { mode: "strip" });

function getTranspiledJavaScript(tsPath: string): string {
  const js = transpileTsToJs(readFileSync(tsPath, "utf8"));
  const { mtimeMs } = statSync(tsPath);
  if (!isDev) {
    cache.set(tsPath, { js, mtimeMs });
  }
  return js;
}

function getCachedOrTranspile(tsPath: string, mtimeMs: number): string {
  if (isDev) {
    return getTranspiledJavaScript(tsPath);
  }
  const cached = cache.get(tsPath);
  if (cached && cached.mtimeMs === mtimeMs) {
    return cached.js;
  }
  return getTranspiledJavaScript(tsPath);
}

export const serveTsAsJs = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.path.endsWith(".ts")) {
    next();
    return;
  }

  const tsPath = path.resolve(clientSrc, `.${req.path}`);
  if (
    !tsPath.startsWith(`${path.resolve(clientSrc)}${path.sep}`) ||
    !existsSync(tsPath) ||
    !statSync(tsPath).isFile()
  ) {
    next();
    return;
  }
  const { mtimeMs } = statSync(tsPath);

  const js = getCachedOrTranspile(tsPath, mtimeMs);
  if (isDev) {
    setNoCache(res);
  }
  res.type("text/javascript").send(js);
};
