import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./routes";
import cors from "cors";
import "./worker/nodemailer";

const server = createHTTPServer({
  router: appRouter,
  middleware: cors(),
});

export async function checkPriceChange() {
}

server.listen(3030);
