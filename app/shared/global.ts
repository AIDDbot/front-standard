declare global {
  var APP_TITLE: string;
}

/** Application display name, supplied by the server from package.json. */
export const appTitle = globalThis.APP_TITLE;
