import type { Route } from "../core/create-router.js";
import { appTitle } from "../shared/global.js";

export const routes: Route[] = [
  {
    load: () => import("./home/home.page.js").then((m) => m.tagName),
    menu: { href: "/", label: "Home" },
    pattern: new URLPattern({ pathname: "/" }),
    title: appTitle,
  },
  {
    load: () => import("./about/about.page.js").then((m) => m.tagName),
    menu: { href: "/about", label: "About" },
    pattern: new URLPattern({ pathname: "/about" }),
    title: `About — ${appTitle}`,
  },
  {
    load: () => import("./item-detail/item-detail.page.js").then((m) => m.tagName),
    pattern: new URLPattern({ pathname: "/items/:itemId" }),
    title: "Item — Details",
  },
  {
    load: () => import("./register/register.page.js").then((m) => m.tagName),
    pattern: new URLPattern({ pathname: "/register" }),
    title: `Register — ${appTitle}`,
  },
  {
    load: () => import("./login/login.page.js").then((m) => m.tagName),
    pattern: new URLPattern({ pathname: "/login" }),
    title: `Log in — ${appTitle}`,
  },
];

export const menuLinks = routes.flatMap((route) => (route.menu ? [route.menu] : []));

export const notFoundRoute: Readonly<Route> = {
  load: () => import("./not-found/not-found.page.js").then((m) => m.tagName),
  pattern: new URLPattern({ pathname: "*" }),
  title: "Not found ",
};
