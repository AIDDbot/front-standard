import express from "express";
import { clientSrc, port, staticOptions } from "./config.js";
import { logHttpRequests } from "./http-logger.js";
import { serveIndexHtml } from "./indexHtml.js";
import { listen } from "./listener.js";
import { createLogger } from "./logger.js";
import { handleSplatRoute } from "./splat-route.js";
import { serveTsAsJs } from "./ts-middleware.js";

const app = express();
app.use(logHttpRequests(createLogger("http")));
app.use(serveTsAsJs);
app.use(express.static(clientSrc, staticOptions));
app.get("/", serveIndexHtml);
app.get("*splat", handleSplatRoute);

listen(app, port);
