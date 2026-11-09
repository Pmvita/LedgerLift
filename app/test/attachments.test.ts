import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { loadEnv } from "../src/config/env.js";
import { createMemoryStore } from "../src/store/memoryStore.js";

describe("attachments", () => {
  it("returns 503 when S3 is not configured", async () => {
    const app = createApp({
      env: loadEnv({ NODE_ENV: "test" }),
      store: createMemoryStore(),
      s3: null,
    });

    const res = await request(app)
      .post("/attachments")
      .send({ contentBase64: Buffer.from("hi").toString("base64") });

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe("S3_UNAVAILABLE");
  });
});
