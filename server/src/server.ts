import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./routes";
import cors from "cors";

const server = createHTTPServer({
  router: appRouter,
  middleware: cors(),
});

server.listen(3030);

async function eventLoop() {
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 60 * 2));
  }
}