import express from "express";
import { clientSrc, port } from "./server/config.js";
import { serveIndexHtml } from "./server/indexHtml.js";
import { handleSplatRoute } from "./server/splatRoute.js";
import { serveTsAsJs } from "./server/tsMiddleware.js";

const app = express();
app.use(serveTsAsJs);
app.use(express.static(clientSrc, { index: false }));
app.get("/", serveIndexHtml);
app.get("*splat", handleSplatRoute);

const server = app.listen(port, () => {
  process.stdout.write(`Serving client at http://localhost:${port}\n`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    process.stderr.write(`Port ${port} is already in use. Stop the process using it and retry.\n`);
  } else {
    process.stderr.write(`Failed to start server: ${error.message}\n`);
  }
  process.exit(1);
});
