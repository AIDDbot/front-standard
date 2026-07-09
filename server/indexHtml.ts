import { readFileSync } from "node:fs";
import path from "node:path";
import type { Request, Response } from "express";
import { clientSrc } from "./config.js";

const indexHtml = readFileSync(path.join(clientSrc, "index.html"), "utf8");

export function serveIndexHtml(_req: Request, res: Response): void {
  res.type("html").send(indexHtml);
}
