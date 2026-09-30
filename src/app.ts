import express from "express";
import { quoteRouter } from "./routes/quote.js";
import { subscriptionsRouter } from "./routes/subscriptions.js";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use(quoteRouter);
  app.use(subscriptionsRouter);
  return app;
}
