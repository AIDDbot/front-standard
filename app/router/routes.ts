import type { Route } from "../core/create-router.js";

export const routes: Route[] = [
  {
    load: async () => import("./home-page.component.js").then((m) => m.tagName),
    pattern: new URLPattern({ pathname: "/" }),
    title: "AstroBookings",
  },
  {
    load: async () => import("./about-page.component.js").then((m) => m.tagName),
    pattern: new URLPattern({ pathname: "/about" }),
    title: "About — AstroBookings",
  },
  {
    load: async () => import("./item-detail-page.component.js").then((m) => m.tagName),
    pattern: new URLPattern({ pathname: "/items/:itemId" }),
    title: "Item — AstroBookings",
  },
];

export const notFoundRoute: Route = {
  load: async () => import("./not-found-page.component.js").then((m) => m.tagName),
  pattern: new URLPattern({ pathname: "*" }),
  title: "Not found ",
};
