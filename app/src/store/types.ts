export type EntityType = "NOTE" | "EXPENSE";

export type Note = {
  id: string;
  type: "NOTE";
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  s3Key?: string;
};

export type Expense = {
  id: string;
  type: "EXPENSE";
  title: string;
  amountCents: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  s3Key?: string;
};

export type Item = Note | Expense;

export type CreateNoteInput = {
  title: string;
  body?: string;
  s3Key?: string;
};

export type CreateExpenseInput = {
  title: string;
  amountCents: number;
  currency?: string;
  s3Key?: string;
};

export type ItemStore = {
  createNote: (input: CreateNoteInput) => Promise<Note>;
  createExpense: (input: CreateExpenseInput) => Promise<Expense>;
  list: (type: EntityType) => Promise<Item[]>;
  get: (type: EntityType, id: string) => Promise<Item | null>;
  delete: (type: EntityType, id: string) => Promise<boolean>;
};
