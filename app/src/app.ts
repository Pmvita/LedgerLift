import cors from "cors";
import express from "express";
import helmet from "helmet";
import type { S3Client } from "@aws-sdk/client-s3";
import type { Env } from "./config/env.js";
import { errorHandler } from "./middleware/error.js";
import { createAttachmentsRouter } from "./routes/attachments.js";
import { createExpensesRouter } from "./routes/expenses.js";
import { createHealthRouter } from "./routes/health.js";
import { createNotesRouter } from "./routes/notes.js";
import { createAttachmentService } from "./services/attachmentService.js";
import { createItemService } from "./services/itemService.js";
import type { ItemStore } from "./store/types.js";

export type AppDeps = {
  env: Env;
  store: ItemStore;
  s3: S3Client | null;
};

export const createApp = ({ env, store, s3 }: AppDeps) => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  const items = createItemService(store);
  const attachments = createAttachmentService(s3, env.S3_BUCKET_NAME);

  app.use(createHealthRouter());
  app.use("/notes", createNotesRouter(items));
  app.use("/expenses", createExpensesRouter(items));
  app.use("/attachments", createAttachmentsRouter(attachments));

  app.use((_req, res) => {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
  });
  app.use(errorHandler);

  return app;
};
