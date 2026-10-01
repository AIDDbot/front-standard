import { createLogger } from "./core/create-logger.ts";
import { createRouter } from "./core/create-router.ts";
import { menuLinks, notFoundRoute, routes } from "./router/routes.ts";
import "./shared/components/nav-menu.component.ts";
import { lastRouteStore } from "./shared/store/last-route.store.ts";

const logger = createLogger("router");
const outlet = document.querySelector<HTMLElement>("#outlet");
const navMenu = document.querySelector("ab-nav-menu");
if (navMenu) navMenu.links = menuLinks;
// Resume the last visited route when landing on the root of a fresh session.
const lastRoute = lastRouteStore.get();
if (location.pathname === "/" && lastRoute !== "/") {
  history.replaceState(undefined, "", lastRoute);
}

if (outlet) {
  createRouter({
    notFound: notFoundRoute,
    onNavigated: (url: URL) => {
      logger.info(`Navigated to ${url.pathname}`);
      lastRouteStore.set(url.pathname);
      navMenu?.setAttribute("current-path", url.pathname);
    },
    outlet,
    routes,
  });
} else {
  logger.error("Missing #outlet element; the router cannot start");
}
