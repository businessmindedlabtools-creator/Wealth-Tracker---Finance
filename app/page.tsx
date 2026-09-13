import { DollarSign, Wallet, TrendingUp, TrendingDown, LineChart } from "lucide-react";

import { getDashboardSummary } from "@/lib/dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { ExpenseBreakdown } from "@/components/dashboard/expense-breakdown";

export default async function Home() {
  const summary = await getDashboardSummary();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Net Worth" value={summary.netWorth} icon={DollarSign} />
        <StatCard label="Cash Balance" value={summary.cashBalance} icon={Wallet} />
        <StatCard label="Portfolio Value" value={summary.portfolioValue} icon={LineChart} />
        <StatCard label="Total Income" value={summary.totalIncome} tone="positive" icon={TrendingUp} />
        <StatCard label="Total Expenses" value={summary.totalExpenses} tone="negative" icon={TrendingDown} />
      </div>

      <ExpenseBreakdown categories={summary.expenseByCategory} />
    </div>
  );
}
