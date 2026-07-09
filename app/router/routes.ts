import type { Route } from "../core/create-router.js";

export const routes: Route[] = [
  {
    load: async () => import("./home-page.component.js").then((m) => m.tagName),
    pattern: new URLPattern({ pathname: "/" }),
    title: "Frontend Standard",
  },
  {
    load: async () => import("./about-page.component.js").then((m) => m.tagName),
    pattern: new URLPattern({ pathname: "/about" }),
    title: "About — Demo app",
  },
  {
    load: async () => import("./item-detail-page.component.js").then((m) => m.tagName),
    pattern: new URLPattern({ pathname: "/items/:itemId" }),
    title: "Item — Details",
  },
];

export const notFoundRoute: Route = {
  load: async () => import("./not-found-page.component.js").then((m) => m.tagName),
  pattern: new URLPattern({ pathname: "*" }),
  title: "Not found ",
};
