import type { Request, Response } from "express";
import { readFileSync } from "node:fs";
import path from "node:path";
import { clientSrc, isDev, setNoCache } from "./config.js";

const indexPath = path.join(clientSrc, "index.html");
const indexHtml = readFileSync(indexPath, "utf8");

export function serveIndexHtml(_req: Request, res: Response): void {
  if (isDev) {
    setNoCache(res);
    res.type("html").send(readFileSync(indexPath, "utf8"));
    return;
  }
  res.type("html").send(indexHtml);
}
