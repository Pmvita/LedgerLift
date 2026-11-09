import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { loadEnv } from "../src/config/env.js";
import { createMemoryStore } from "../src/store/memoryStore.js";

describe("expenses CRUD", () => {
  it("creates and lists an expense", async () => {
    const app = createApp({
      env: loadEnv({ NODE_ENV: "test" }),
      store: createMemoryStore(),
      s3: null,
    });

    const created = await request(app)
      .post("/expenses")
      .send({ title: "Coffee", amountCents: 450, currency: "CAD" });

    expect(created.status).toBe(201);
    expect(created.body.type).toBe("EXPENSE");
    expect(created.body.amountCents).toBe(450);

    const listed = await request(app).get("/expenses");
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });
});
