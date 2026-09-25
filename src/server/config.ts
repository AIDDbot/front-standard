import { readFileSync } from "node:fs";

const DEFAULTS = Object.freeze({
  apiPort: 3000,
  apiSite: "http://localhost",
  cacheControl: "no-store",
  clientSrc: "src/app",
  port: 4000,
} as const);

const ENV = Object.freeze({
  apiBaseUrl: "API_BASE_URL",
  apiPort: "API_PORT",
  apiSite: "API_SITE",
  clientSrc: "CLIENT_SRC",
  lifecycle: "npm_lifecycle_event",
  nodeEnv: "NODE_ENV",
  port: "PORT",
} as const);

const PORT_MAX = 65_535;

export interface AppAuthor {
  readonly name: string;
  readonly url?: string;
}

interface HeaderWriter {
  setHeader(name: string, value: string): void;
}

/** Returns the env variable, treating blank values as unset. */
const readEnv = (name: string): string | undefined => {
  const value = process.env[name]?.trim();
  if (!value) {
    return undefined;
  }
  return value;
};

const parsePort = (name: string, value: string): number => {
  if (!/^\d+$/u.test(value)) {
    throw new TypeError(`${name} must be an integer`);
  }
  const port = Number(value);
  if (port < 1 || port > PORT_MAX) {
    throw new RangeError(`${name} must be between 1 and ${PORT_MAX}`);
  }
  return port;
};

const readPort = (name: string, fallback: number): number => {
  const value = readEnv(name);
  return value === undefined ? fallback : parsePort(name, value);
};

function readPackageConfig(): Readonly<object> {
  const packageConfig: unknown = JSON.parse(readFileSync("package.json", "utf8"));
  if (typeof packageConfig !== "object" || packageConfig === null) {
    throw new TypeError("package.json must contain an object");
  }
  return Object.freeze(packageConfig);
}

const readOptionalString = (source: Readonly<object>, key: string): string | undefined => {
  const value: unknown = key in source ? Reflect.get(source, key) : undefined;
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
};

function readAppTitle(packageConfig: Readonly<object>): string {
  const displayName = readOptionalString(packageConfig, "displayName");
  if (displayName) {
    return displayName;
  }
  const name = readOptionalString(packageConfig, "name");
  if (name) {
    return name;
  }
  throw new TypeError("package.json must contain a name");
}

const freezeAuthor = (author: AppAuthor): AppAuthor => Object.freeze(author);

/** Reads `author` from package.json, either as an object or as a plain name string. */
function readAppAuthor(packageConfig: Readonly<object>): AppAuthor | undefined {
  const author: unknown = "author" in packageConfig ? packageConfig.author : undefined;
  if (typeof author === "string" && author.trim() !== "") {
    return freezeAuthor({ name: author });
  }
  if (typeof author !== "object" || author === null) {
    return undefined;
  }
  const name = readOptionalString(author, "name");
  if (!name) {
    return undefined;
  }
  const url = readOptionalString(author, "url");
  return freezeAuthor(url ? { name, url } : { name });
}

const packageConfig = readPackageConfig();

export const port = readPort(ENV.port, DEFAULTS.port);
export const clientSrc = readEnv(ENV.clientSrc) ?? DEFAULTS.clientSrc;
const apiSite = (readEnv(ENV.apiSite) ?? DEFAULTS.apiSite).replace(/\/+$/u, "");
const apiBaseUrlFromEnv = readEnv(ENV.apiBaseUrl);
const apiPort = apiBaseUrlFromEnv ? undefined : readPort(ENV.apiPort, DEFAULTS.apiPort);
/** `API_BASE_URL` wins when set; otherwise it is composed from `API_SITE` and `API_PORT`. */
export const apiBaseUrl = apiBaseUrlFromEnv ?? `${apiSite}:${apiPort}`;
export const appTitle = readAppTitle(packageConfig);
export const appAuthor = readAppAuthor(packageConfig);

/** Production when started via `start` script or NODE_ENV=production. */
export const isProduction =
  readEnv(ENV.lifecycle) === "start" || readEnv(ENV.nodeEnv) === "production";

export const isDev = !isProduction;

export const setNoCache = (res: HeaderWriter): void => {
  res.setHeader("Cache-Control", DEFAULTS.cacheControl);
};

const devStaticOptions = Object.freeze({
  etag: false,
  lastModified: false,
  maxAge: 0,
  setHeaders(res: HeaderWriter): void {
    setNoCache(res);
  },
});

export const staticOptions = Object.freeze({
  index: false as const,
  ...(isDev ? devStaticOptions : {}),
});
