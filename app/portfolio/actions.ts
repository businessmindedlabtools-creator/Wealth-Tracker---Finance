"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { holdingSchema } from "@/lib/validations/holding";

export type HoldingInput = {
  ticker: string;
  shares: string;
  /** Total amount paid (base currency) as entered, e.g. "1500.00"; "" if unknown. */
  costBasis: string;
};

export async function createHolding(input: HoldingInput) {
  await requireSession();
  const data = holdingSchema.parse(input);
  await prisma.holding.create({
    data: {
      ticker: data.ticker,
      shares: data.shares,
      costBasisCents: data.costBasisCents,
    },
  });
  revalidatePath("/portfolio");
  revalidatePath("/");
}

export async function updateHolding(id: string, input: HoldingInput) {
  await requireSession();
  const data = holdingSchema.parse(input);
  await prisma.holding.update({
    where: { id },
    data: {
      ticker: data.ticker,
      shares: data.shares,
      costBasisCents: data.costBasisCents,
    },
  });
  revalidatePath("/portfolio");
  revalidatePath("/");
}

export async function deleteHolding(id: string) {
  await requireSession();
  await prisma.holding.delete({ where: { id } });
  revalidatePath("/portfolio");
  revalidatePath("/");
}
