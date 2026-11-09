import { Router } from "express";
import { z } from "zod";
import { AppError } from "../errors.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { AttachmentService } from "../services/attachmentService.js";

const uploadSchema = z.object({
  contentBase64: z.string().min(1),
  contentType: z.string().min(1).max(200).optional(),
  fileName: z.string().min(1).max(200).optional(),
});

export const createAttachmentsRouter = (attachments: AttachmentService): Router => {
  const router = Router();

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const parsed = uploadSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "invalid body");
      }
      const meta = await attachments.putObject(parsed.data);
      res.status(201).json(meta);
    }),
  );

  return router;
};
