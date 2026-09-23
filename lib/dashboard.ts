import { connection } from "next/server";

import { prisma } from "@/lib/prisma";
import { getPortfolioValuation } from "@/lib/portfolio-data";

// All amounts are integer cents of BASE_CURRENCY (lib/money.ts).

export type CategoryTotal = {
  category: string;
  totalCents: number;
};

export type DashboardSummary = {
  totalIncomeCents: number;
  totalExpensesCents: number;
  cashBalanceCents: number;
  portfolioValueCents: number;
  netWorthCents: number;
  /** Holdings left out of portfolio value because no price (or FX rate) is available. */
  unpricedHoldings: number;
  /** Holdings valued with an expired cached price because the live fetch failed. */
  stalePrices: number;
  expenseByCategory: CategoryTotal[];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  // Always read at request time, never from a build-time prerender.
  await connection();
  const [transactions, portfolio] = await Promise.all([
    prisma.transaction.findMany(),
    getPortfolioValuation(),
  ]);

  const totalIncomeCents = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amountCents, 0);
  const totalExpensesCents = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amountCents, 0);
  const cashBalanceCents = totalIncomeCents - totalExpensesCents;

  const expenseTotals = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "EXPENSE") continue;
    expenseTotals.set(t.category, (expenseTotals.get(t.category) ?? 0) + t.amountCents);
  }
  const expenseByCategory = [...expenseTotals.entries()]
    .map(([category, totalCents]) => ({ category, totalCents }))
    .sort((a, b) => b.totalCents - a.totalCents);

  return {
    totalIncomeCents,
    totalExpensesCents,
    cashBalanceCents,
    portfolioValueCents: portfolio.totalValueCents,
    netWorthCents: cashBalanceCents + portfolio.totalValueCents,
    unpricedHoldings: portfolio.unpricedCount,
    stalePrices: portfolio.staleCount,
    expenseByCategory,
  };
}
