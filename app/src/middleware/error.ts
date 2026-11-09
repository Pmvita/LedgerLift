import type { ErrorRequestHandler } from "express";
import { isAppError } from "../errors.js";
import { logger } from "../logger.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (isAppError(err)) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }

  logger.error("unhandled_error", {
    message: err instanceof Error ? err.message : String(err),
  });
  res.status(500).json({ error: { code: "INTERNAL", message: "Internal server error" } });
};
