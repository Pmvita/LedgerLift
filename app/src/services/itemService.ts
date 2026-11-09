import { AppError } from "../errors.js";
import type {
  CreateExpenseInput,
  CreateNoteInput,
  EntityType,
  Expense,
  Item,
  ItemStore,
  Note,
} from "../store/types.js";

export type ItemService = {
  createNote: (input: CreateNoteInput) => Promise<Note>;
  createExpense: (input: CreateExpenseInput) => Promise<Expense>;
  list: (type: EntityType) => Promise<Item[]>;
  get: (type: EntityType, id: string) => Promise<Item>;
  delete: (type: EntityType, id: string) => Promise<void>;
};

export const createItemService = (store: ItemStore): ItemService => ({
  createNote: (input) => store.createNote(input),
  createExpense: (input) => store.createExpense(input),
  list: (type) => store.list(type),
  async get(type, id) {
    const item = await store.get(type, id);
    if (!item) {
      throw new AppError(404, "NOT_FOUND", `${type.toLowerCase()} not found`);
    }
    return item;
  },
  async delete(type, id) {
    const deleted = await store.delete(type, id);
    if (!deleted) {
      throw new AppError(404, "NOT_FOUND", `${type.toLowerCase()} not found`);
    }
  },
});
