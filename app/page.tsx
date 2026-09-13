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
        <StatCard label="Net Worth" value={summary.netWorth} />
        <StatCard label="Cash Balance" value={summary.cashBalance} />
        <StatCard label="Portfolio Value" value={summary.portfolioValue} />
        <StatCard label="Total Income" value={summary.totalIncome} tone="positive" />
        <StatCard label="Total Expenses" value={summary.totalExpenses} tone="negative" />
      </div>

      <ExpenseBreakdown categories={summary.expenseByCategory} />
    </div>
  );
}
