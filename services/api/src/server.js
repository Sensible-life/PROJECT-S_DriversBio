import { pathToFileURL } from "node:url";

import { createApp } from "./app.js";

export function startServer({ port = Number(process.env.PORT || 3030), host = "127.0.0.1" } = {}) {
  const server = createApp();

  return new Promise((resolve) => {
    server.listen(port, host, () => {
      resolve({
        server,
        port: server.address().port,
        host,
      });
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { server, port, host } = await startServer();

  console.log(`DriveAI API running at http://${host}:${port}`);

  process.on("SIGINT", () => {
    server.close(() => process.exit(0));
  });
}
