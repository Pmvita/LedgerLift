import { Router } from "express";
import { z } from "zod";
import { AppError } from "../errors.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { ItemService } from "../services/itemService.js";

const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().max(10_000).optional(),
  s3Key: z.string().min(1).max(1024).optional(),
});

export const createNotesRouter = (items: ItemService): Router => {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const notes = await items.list("NOTE");
      res.status(200).json({ items: notes });
    }),
  );

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const parsed = createNoteSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "invalid body");
      }
      const note = await items.createNote(parsed.data);
      res.status(201).json(note);
    }),
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const note = await items.get("NOTE", req.params.id ?? "");
      res.status(200).json(note);
    }),
  );

  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      await items.delete("NOTE", req.params.id ?? "");
      res.status(204).send();
    }),
  );

  return router;
};
