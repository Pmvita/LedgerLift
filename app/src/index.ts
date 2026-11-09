import { createDynamoDocClient, createS3Client } from "./aws/clients.js";
import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { logger } from "./logger.js";
import { createDynamoStore } from "./store/dynamoStore.js";
import { createMemoryStore } from "./store/memoryStore.js";

const env = loadEnv();

const store = env.DYNAMODB_TABLE
  ? createDynamoStore(createDynamoDocClient(env), env.DYNAMODB_TABLE)
  : createMemoryStore();

const s3 = env.S3_BUCKET_NAME ? createS3Client(env) : null;

const app = createApp({ env, store, s3 });

app.listen(env.PORT, () => {
  logger.info("ledgerlift_started", {
    port: env.PORT,
    store: env.DYNAMODB_TABLE ? "dynamodb" : "memory",
    s3: Boolean(env.S3_BUCKET_NAME),
    region: env.AWS_REGION,
    nodeEnv: env.NODE_ENV,
  });
});
