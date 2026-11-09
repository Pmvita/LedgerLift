import { randomUUID } from "node:crypto";
import type {
  CreateExpenseInput,
  CreateNoteInput,
  EntityType,
  Expense,
  Item,
  ItemStore,
  Note,
} from "./types.js";

export const createMemoryStore = (): ItemStore => {
  const items = new Map<string, Item>();

  const key = (type: EntityType, id: string) => `${type}#${id}`;

  return {
    async createNote(input: CreateNoteInput): Promise<Note> {
      const now = new Date().toISOString();
      const note: Note = {
        id: randomUUID(),
        type: "NOTE",
        title: input.title,
        body: input.body ?? "",
        createdAt: now,
        updatedAt: now,
        ...(input.s3Key ? { s3Key: input.s3Key } : {}),
      };
      items.set(key("NOTE", note.id), note);
      return note;
    },

    async createExpense(input: CreateExpenseInput): Promise<Expense> {
      const now = new Date().toISOString();
      const expense: Expense = {
        id: randomUUID(),
        type: "EXPENSE",
        title: input.title,
        amountCents: input.amountCents,
        currency: input.currency ?? "CAD",
        createdAt: now,
        updatedAt: now,
        ...(input.s3Key ? { s3Key: input.s3Key } : {}),
      };
      items.set(key("EXPENSE", expense.id), expense);
      return expense;
    },

    async list(type: EntityType): Promise<Item[]> {
      return [...items.values()]
        .filter((item) => item.type === type)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async get(type: EntityType, id: string): Promise<Item | null> {
      return items.get(key(type, id)) ?? null;
    },

    async delete(type: EntityType, id: string): Promise<boolean> {
      return items.delete(key(type, id));
    },
  };
};
