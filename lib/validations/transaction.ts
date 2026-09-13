import { z } from "zod";

import { TRANSACTION_TYPES, categoriesForType } from "@/lib/categories";

export const transactionSchema = z
  .object({
    type: z.enum(TRANSACTION_TYPES),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    category: z.string().min(1, "Category is required"),
    description: z
      .string()
      .trim()
      .max(280, "Description must be 280 characters or fewer")
      .optional()
      .or(z.literal("")),
    date: z.coerce.date({ error: "A valid date is required" }),
  })
  .refine((data) => categoriesForType(data.type).includes(data.category), {
    message: "Select a category that matches the transaction type",
    path: ["category"],
  });

export type TransactionFormValues = z.infer<typeof transactionSchema>;
