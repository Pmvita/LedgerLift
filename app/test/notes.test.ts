import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { loadEnv } from "../src/config/env.js";
import { createMemoryStore } from "../src/store/memoryStore.js";

const buildApp = () =>
  createApp({
    env: loadEnv({ NODE_ENV: "test" }),
    store: createMemoryStore(),
    s3: null,
  });

describe("notes CRUD", () => {
  it("creates, lists, gets, and deletes a note", async () => {
    const app = buildApp();

    const created = await request(app).post("/notes").send({ title: "Taxi", body: "Airport run" });
    expect(created.status).toBe(201);
    expect(created.body.id).toBeTruthy();
    expect(created.body.title).toBe("Taxi");
    expect(created.body.type).toBe("NOTE");

    const listed = await request(app).get("/notes");
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);

    const got = await request(app).get(`/notes/${created.body.id}`);
    expect(got.status).toBe(200);
    expect(got.body.body).toBe("Airport run");

    const deleted = await request(app).delete(`/notes/${created.body.id}`);
    expect(deleted.status).toBe(204);

    const missing = await request(app).get(`/notes/${created.body.id}`);
    expect(missing.status).toBe(404);
  });

  it("rejects empty title", async () => {
    const app = buildApp();
    const res = await request(app).post("/notes").send({ title: "  " });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
