import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { Env } from "../config/env.js";

export const createDynamoDocClient = (env: Env): DynamoDBDocumentClient => {
  const client = new DynamoDBClient({ region: env.AWS_REGION });
  return DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  });
};

export const createS3Client = (env: Env): S3Client => {
  return new S3Client({
    region: env.AWS_REGION,
    ...(env.S3_ENDPOINT
      ? {
          endpoint: env.S3_ENDPOINT,
          forcePathStyle: env.S3_FORCE_PATH_STYLE ?? true,
        }
      : {}),
  });
};
