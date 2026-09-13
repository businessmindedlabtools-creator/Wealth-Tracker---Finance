export const TRANSACTION_TYPES = ["INCOME", "EXPENSE"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const EXPENSE_CATEGORIES = [
  "Rent",
  "Food",
  "Groceries",
  "Subscriptions",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Other",
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Side Hustle",
  "Dividends",
  "Other",
] as const;

export function categoriesForType(type: TransactionType): readonly string[] {
  return type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}
