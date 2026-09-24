import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await request(createApp()).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("returns consistent 404 shape", async () => {
    const res = await request(createApp()).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
