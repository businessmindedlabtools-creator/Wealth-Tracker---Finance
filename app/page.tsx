import { Euro, Wallet, TrendingUp, TrendingDown, LineChart } from "lucide-react";

import { requireSession } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { ExpenseBreakdown } from "@/components/dashboard/expense-breakdown";

function portfolioNote(unpriced: number, stale: number) {
  const notes = [];
  if (unpriced > 0) {
    notes.push(`Excludes ${unpriced} holding${unpriced === 1 ? "" : "s"} with no price`);
  }
  if (stale > 0) {
    notes.push(`${stale} price${stale === 1 ? "" : "s"} out of date`);
  }
  return notes.length > 0 ? notes.join(" · ") : undefined;
}

export default async function Home() {
  await requireSession();
  const summary = await getDashboardSummary();
  const note = portfolioNote(summary.unpricedHoldings, summary.stalePrices);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Net Worth" valueCents={summary.netWorthCents} icon={Euro} note={note} />
        <StatCard label="Cash Balance" valueCents={summary.cashBalanceCents} icon={Wallet} />
        <StatCard
          label="Portfolio Value"
          valueCents={summary.portfolioValueCents}
          icon={LineChart}
          note={note}
        />
        <StatCard label="Total Income" valueCents={summary.totalIncomeCents} tone="positive" icon={TrendingUp} />
        <StatCard label="Total Expenses" valueCents={summary.totalExpensesCents} tone="negative" icon={TrendingDown} />
      </div>

      <ExpenseBreakdown categories={summary.expenseByCategory} />
    </div>
  );
}
