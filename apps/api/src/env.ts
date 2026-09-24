import dotenv from "dotenv";

dotenv.config();

function requireInProduction(name: string, fallback: string): string {
  const value = process.env[name] ?? fallback;
  if (process.env["NODE_ENV"] === "production" && !process.env[name]) {
    throw new Error(`Missing required env var ${name} in production`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env["NODE_ENV"] ?? "development",
  PORT: Number(process.env["API_PORT"] ?? 4000),
  CORS_ORIGIN: process.env["CORS_ORIGIN"] ?? "http://localhost:5173",
  JWT_SECRET: requireInProduction("JWT_SECRET", "change-me-in-dev"),
  DATABASE_URL: process.env["DATABASE_URL"] ?? "",
};
