import express from "express";
import { clientSrc, port, staticOptions } from "./config.ts";
import { logHttpRequests } from "./http-logger.ts";
import { serveIndexHtml } from "./indexHtml.ts";
import { listen } from "./listener.ts";
import { createLogger } from "./logger.ts";
import { handleSplatRoute } from "./splat-route.ts";
import { serveTsAsJs } from "./ts-middleware.ts";

const app = express();
app.use(logHttpRequests(createLogger("http")));
app.use(serveTsAsJs);
app.use(express.static(clientSrc, staticOptions));
app.get("/", serveIndexHtml);
app.get("*splat", handleSplatRoute);

listen(app, port);
