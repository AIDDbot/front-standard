import type { Request, Response } from "express";
import { readFileSync } from "node:fs";
import path from "node:path";
import { apiBaseUrl, appTitle, clientSrc, isDev, setNoCache } from "./config.js";

const indexPath = path.join(clientSrc, "index.html");
const serialize = (value: string): string =>
  JSON.stringify(value).replaceAll("<", String.raw`\u003c`);
const runtimeConfig = `<script>globalThis.API_BASE_URL = ${serialize(apiBaseUrl)}; globalThis.APP_TITLE = ${serialize(appTitle)};</script>`;
const indexHtml = injectRuntimeConfig(readFileSync(indexPath, "utf8"));

function injectRuntimeConfig(html: string): string {
  return html
    .replace("<title></title>", `<title>${escapeHtml(appTitle)}</title>`)
    .replace("</head>", `  ${runtimeConfig}\n</head>`);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function serveIndexHtml(_req: Request, res: Response): void {
  if (isDev) {
    setNoCache(res);
    res.type("html").send(injectRuntimeConfig(readFileSync(indexPath, "utf8")));
    return;
  }
  res.type("html").send(indexHtml);
}
