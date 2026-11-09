import { randomUUID } from "node:crypto";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import type {
  CreateExpenseInput,
  CreateNoteInput,
  EntityType,
  Expense,
  Item,
  ItemStore,
  Note,
} from "./types.js";

type DynamoItem = {
  pk: string;
  sk: string;
  entityType: EntityType;
  id: string;
  title: string;
  body?: string;
  amountCents?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
  s3Key?: string;
};

const toItem = (row: DynamoItem): Item => {
  if (row.entityType === "NOTE") {
    return {
      id: row.id,
      type: "NOTE",
      title: row.title,
      body: row.body ?? "",
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      ...(row.s3Key ? { s3Key: row.s3Key } : {}),
    };
  }
  return {
    id: row.id,
    type: "EXPENSE",
    title: row.title,
    amountCents: row.amountCents ?? 0,
    currency: row.currency ?? "CAD",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ...(row.s3Key ? { s3Key: row.s3Key } : {}),
  };
};

export const createDynamoStore = (
  client: DynamoDBDocumentClient,
  tableName: string,
): ItemStore => {
  return {
    async createNote(input: CreateNoteInput): Promise<Note> {
      const now = new Date().toISOString();
      const id = randomUUID();
      const row: DynamoItem = {
        pk: "NOTE",
        sk: id,
        entityType: "NOTE",
        id,
        title: input.title,
        body: input.body ?? "",
        createdAt: now,
        updatedAt: now,
        ...(input.s3Key ? { s3Key: input.s3Key } : {}),
      };
      await client.send(
        new PutCommand({
          TableName: tableName,
          Item: row,
        }),
      );
      return toItem(row) as Note;
    },

    async createExpense(input: CreateExpenseInput): Promise<Expense> {
      const now = new Date().toISOString();
      const id = randomUUID();
      const row: DynamoItem = {
        pk: "EXPENSE",
        sk: id,
        entityType: "EXPENSE",
        id,
        title: input.title,
        amountCents: input.amountCents,
        currency: input.currency ?? "CAD",
        createdAt: now,
        updatedAt: now,
        ...(input.s3Key ? { s3Key: input.s3Key } : {}),
      };
      await client.send(
        new PutCommand({
          TableName: tableName,
          Item: row,
        }),
      );
      return toItem(row) as Expense;
    },

    async list(type: EntityType): Promise<Item[]> {
      const result = await client.send(
        new QueryCommand({
          TableName: tableName,
          KeyConditionExpression: "pk = :pk",
          ExpressionAttributeValues: { ":pk": type },
        }),
      );
      const rows = (result.Items ?? []) as DynamoItem[];
      return rows.map(toItem).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async get(type: EntityType, id: string): Promise<Item | null> {
      const result = await client.send(
        new GetCommand({
          TableName: tableName,
          Key: { pk: type, sk: id },
        }),
      );
      if (!result.Item) {
        return null;
      }
      return toItem(result.Item as DynamoItem);
    },

    async delete(type: EntityType, id: string): Promise<boolean> {
      const existing = await client.send(
        new GetCommand({
          TableName: tableName,
          Key: { pk: type, sk: id },
        }),
      );
      if (!existing.Item) {
        return false;
      }
      await client.send(
        new DeleteCommand({
          TableName: tableName,
          Key: { pk: type, sk: id },
        }),
      );
      return true;
    },
  };
};
