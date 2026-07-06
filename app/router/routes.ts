import type { Route } from "../core/create-router.js";

export const routes: Route[] = [
  {
    pattern: new URLPattern({ pathname: "/" }),
    title: "AstroBookings",
    load: () => import("./home-page.component.js").then((m) => m.tagName),
  },
  {
    pattern: new URLPattern({ pathname: "/about" }),
    title: "About — AstroBookings",
    load: () => import("./about-page.component.js").then((m) => m.tagName),
  },
  {
    pattern: new URLPattern({ pathname: "/items/:itemId" }),
    title: "Item — AstroBookings",
    load: () => import("./item-detail-page.component.js").then((m) => m.tagName),
  },
];

export const notFoundRoute: Route = {
  pattern: new URLPattern({ pathname: "*" }),
  title: "Not found ",
  load: () => import("./not-found-page.component.js").then((m) => m.tagName),
};
