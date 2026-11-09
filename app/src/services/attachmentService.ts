import { PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { AppError } from "../errors.js";

export type AttachmentMeta = {
  key: string;
  bucket: string;
  contentType: string;
  sizeBytes: number;
};

export type AttachmentService = {
  putObject: (input: {
    contentBase64: string;
    contentType?: string;
    fileName?: string;
  }) => Promise<AttachmentMeta>;
};

export const createAttachmentService = (
  s3: S3Client | null,
  bucketName: string | undefined,
): AttachmentService => ({
  async putObject({ contentBase64, contentType, fileName }) {
    if (!s3 || !bucketName) {
      throw new AppError(
        503,
        "S3_UNAVAILABLE",
        "S3 is not configured (set S3_BUCKET_NAME for uploads)",
      );
    }

    let body: Buffer;
    try {
      body = Buffer.from(contentBase64, "base64");
    } catch {
      throw new AppError(400, "INVALID_BODY", "contentBase64 must be valid base64");
    }

    if (body.length === 0) {
      throw new AppError(400, "INVALID_BODY", "attachment body is empty");
    }
    if (body.length > 512 * 1024) {
      throw new AppError(413, "TOO_LARGE", "attachments must be <= 512 KiB for this lab");
    }

    const safeName = (fileName ?? "object.bin").replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `attachments/${randomUUID()}-${safeName}`;
    const type = contentType ?? "application/octet-stream";

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: type,
      }),
    );

    return {
      key,
      bucket: bucketName,
      contentType: type,
      sizeBytes: body.length,
    };
  },
});
