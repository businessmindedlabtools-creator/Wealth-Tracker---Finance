"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validations/transaction";

export type TransactionInput = {
  type: string;
  /** Amount as entered, e.g. "12.34"; stored as integer cents. */
  amount: string;
  category: string;
  description?: string;
  date: string;
};

export async function createTransaction(input: TransactionInput) {
  await requireSession();
  const data = transactionSchema.parse(input);
  await prisma.transaction.create({
    data: {
      type: data.type,
      amountCents: data.amountCents,
      category: data.category,
      description: data.description || null,
      date: data.date,
    },
  });
  revalidatePath("/transactions");
  revalidatePath("/");
}

export async function updateTransaction(id: string, input: TransactionInput) {
  await requireSession();
  const data = transactionSchema.parse(input);
  await prisma.transaction.update({
    where: { id },
    data: {
      type: data.type,
      amountCents: data.amountCents,
      category: data.category,
      description: data.description || null,
      date: data.date,
    },
  });
  revalidatePath("/transactions");
  revalidatePath("/");
}

export async function deleteTransaction(id: string) {
  await requireSession();
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/transactions");
  revalidatePath("/");
}
