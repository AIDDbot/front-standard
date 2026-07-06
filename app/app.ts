import "./shared/components/nav-menu.component.js";
import { createRouter } from "./core/create-router.js";
import { notFoundRoute, routes } from "./router/routes.js";
import { lastRouteStore } from "./shared/store/last-route.store.js";

const outlet = document.querySelector<HTMLElement>("#outlet");

// Resume the last visited route when landing on the root of a fresh session.
const lastRoute = lastRouteStore.get();
if (location.pathname === "/" && lastRoute !== "/") {
  history.replaceState(null, "", lastRoute);
}

if (outlet) {
  createRouter({
    outlet,
    routes,
    notFound: notFoundRoute,
    onNavigated: (url) => lastRouteStore.set(url.pathname),
  });
}
