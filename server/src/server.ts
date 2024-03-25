import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./routes";
import cors from "cors";
import { sendPriceChangeEmail } from "./worker/mail";
import dotenv from "dotenv";
import { eventLoopStep } from "./worker/event_loop";
import { CronJob } from "cron";
dotenv.config();
dotenv.config({ path: "../.env" });

const server = createHTTPServer({
  router: appRouter,
  middleware: cors(),
});

server.listen(3030);

CronJob.from({
  cronTime: process.env.SCRAPE_INTERVAL!,
  onTick: () => {
    console.log("Time to fetch prices!");
    eventLoopStep();
  },
  start: true,
  timeZone: "Australia/Sydney",
});

// '0 */6 * * *'
// */2 * * * *