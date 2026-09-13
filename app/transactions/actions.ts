"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validations/transaction";

export type TransactionInput = {
  type: string;
  amount: number | string;
  category: string;
  description?: string;
  date: Date | string;
};

export async function createTransaction(input: TransactionInput) {
  const data = transactionSchema.parse(input);
  await prisma.transaction.create({
    data: {
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description || null,
      date: data.date,
    },
  });
  revalidatePath("/transactions");
  revalidatePath("/");
}

export async function updateTransaction(id: string, input: TransactionInput) {
  const data = transactionSchema.parse(input);
  await prisma.transaction.update({
    where: { id },
    data: {
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description || null,
      date: data.date,
    },
  });
  revalidatePath("/transactions");
  revalidatePath("/");
}

export async function deleteTransaction(id: string) {
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/transactions");
  revalidatePath("/");
}
