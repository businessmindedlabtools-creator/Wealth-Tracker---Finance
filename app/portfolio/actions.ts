"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { holdingSchema } from "@/lib/validations/holding";

export type HoldingInput = {
  ticker: string;
  shares: number | string;
};

export async function createHolding(input: HoldingInput) {
  const data = holdingSchema.parse(input);
  await prisma.holding.create({
    data: {
      ticker: data.ticker,
      shares: data.shares,
    },
  });
  revalidatePath("/portfolio");
}

export async function updateHolding(id: string, input: HoldingInput) {
  const data = holdingSchema.parse(input);
  await prisma.holding.update({
    where: { id },
    data: {
      ticker: data.ticker,
      shares: data.shares,
    },
  });
  revalidatePath("/portfolio");
}

export async function deleteHolding(id: string) {
  await prisma.holding.delete({ where: { id } });
  revalidatePath("/portfolio");
}
