import type { Route } from "../core/create-router.ts";
import { appTitle } from "../shared/global.ts";

export const routes: Route[] = [
  {
    load: () => import("./home/home.page.ts").then((m) => m.tagName),
    menu: { href: "/", label: "Home" },
    pattern: new URLPattern({ pathname: "/" }),
    title: appTitle,
  },
  {
    load: () => import("./about/about.page.ts").then((m) => m.tagName),
    menu: { href: "/about", label: "About" },
    pattern: new URLPattern({ pathname: "/about" }),
    title: `About — ${appTitle}`,
  },
  {
    load: () => import("./item-detail/item-detail.page.ts").then((m) => m.tagName),
    pattern: new URLPattern({ pathname: "/items/:itemId" }),
    title: "Item — Details",
  },
  {
    load: () => import("./register/register.page.ts").then((m) => m.tagName),
    pattern: new URLPattern({ pathname: "/register" }),
    title: `Register — ${appTitle}`,
  },
  {
    load: () => import("./login/login.page.ts").then((m) => m.tagName),
    pattern: new URLPattern({ pathname: "/login" }),
    title: `Log in — ${appTitle}`,
  },
];

export const menuLinks = routes.flatMap((route) => (route.menu ? [route.menu] : []));

export const notFoundRoute: Readonly<Route> = {
  load: () => import("./not-found/not-found.page.ts").then((m) => m.tagName),
  pattern: new URLPattern({ pathname: "*" }),
  title: "Not found ",
};
