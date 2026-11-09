import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { loadEnv } from "../src/config/env.js";
import { createMemoryStore } from "../src/store/memoryStore.js";

describe("health", () => {
  it("returns ok on /health", async () => {
    const app = createApp({
      env: loadEnv({ NODE_ENV: "test" }),
      store: createMemoryStore(),
      s3: null,
    });

    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("returns service JSON on /", async () => {
    const app = createApp({
      env: loadEnv({ NODE_ENV: "test" }),
      store: createMemoryStore(),
      s3: null,
    });

    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.service).toBe("ledgerlift");
  });
});
