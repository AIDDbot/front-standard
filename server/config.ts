const DEFAULT_PORT = 4000;

export const port = process.env["PORT"] ?? DEFAULT_PORT;
export const clientSrc = process.env["CLIENT_SRC"] ?? "app";
