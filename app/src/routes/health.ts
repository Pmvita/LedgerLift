import { Router } from "express";

export const createHealthRouter = (): Router => {
  const router = Router();

  router.get("/", (_req, res) => {
    res.status(200).json({
      service: "ledgerlift",
      description: "expenses / notes HTTP API",
      endpoints: ["/", "/health", "/notes", "/expenses", "/attachments"],
    });
  });

  router.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  return router;
};
