import { existsSync, readFileSync, statSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import { clientSrc } from "./config.js";

const cache = new Map<string, { mtimeMs: number; js: string }>();

export function serveTsAsJs(req: Request, res: Response, next: NextFunction): void {
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
