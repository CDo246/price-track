import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { appRouter } from "./routes";
import cors from "cors";
import { sendPriceChangeEmail } from "./worker/mail";
import dotenv from "dotenv";
import { eventLoopStep } from "./worker/event_loop";
import { CronJob } from "cron";
import path from "path";

dotenv.config();
dotenv.config({ path: "../.env" });

const app = express();
const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
  // Middleware
  app.use(cors());
}

// Create TRPC middleware
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
  })
);

// Serve static files in production
if (isProduction) {
  const clientDist = path.join(import.meta.dirname, "../../client/dist");
  app.use(express.static(clientDist));

  // Handle client-side routing by serving index.html for all routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(3030, () => {
  console.log("Server running on http://localhost:3030");
});

CronJob.from({
  cronTime: process.env.SCRAPE_INTERVAL!,
  onTick: () => {
    console.log("Time to fetch prices!");
    eventLoopStep();
  },
  start: true,
  timeZone: "Australia/Sydney",
});
