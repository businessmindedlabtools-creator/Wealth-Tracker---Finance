import { prisma } from "@/lib/prisma";
import { getPrices } from "@/lib/stock-price";

export type CategoryTotal = {
  category: string;
  total: number;
};

export type DashboardSummary = {
  totalIncome: number;
  totalExpenses: number;
  cashBalance: number;
  portfolioValue: number;
  netWorth: number;
  expenseByCategory: CategoryTotal[];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [transactions, holdings] = await Promise.all([
    prisma.transaction.findMany(),
    prisma.holding.findMany(),
  ]);

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
  const cashBalance = totalIncome - totalExpenses;

  const prices = await getPrices(holdings.map((h) => h.ticker));
  const portfolioValue = holdings.reduce((sum, h) => {
    const price = prices[h.ticker];
    return sum + (price ?? 0) * h.shares;
  }, 0);

  const expenseTotals = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "EXPENSE") continue;
    expenseTotals.set(t.category, (expenseTotals.get(t.category) ?? 0) + t.amount);
  }
  const expenseByCategory = [...expenseTotals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  return {
    totalIncome,
    totalExpenses,
    cashBalance,
    portfolioValue,
    netWorth: cashBalance + portfolioValue,
    expenseByCategory,
  };
}
