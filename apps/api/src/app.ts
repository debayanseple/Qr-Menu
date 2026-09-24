import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { env } from "./env.js";

dotenv.config();

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "qr-ordering-api", time: new Date().toISOString() });
  });

  // Consistent 404 shape (quality bar: consistent error shapes)
  app.use((_req, res) => {
    res.status(404).json({
      error: { code: "NOT_FOUND", message: "Route not found" },
    });
  });

  return app;
}
