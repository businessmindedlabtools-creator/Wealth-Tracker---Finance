import { connection } from "next/server";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { TransactionsTable } from "@/components/transactions/transactions-table";

export default async function TransactionsPage() {
  await requireSession();
  // Always read at request time, never from a build-time prerender.
  await connection();
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <AddTransactionDialog />
      </div>
      <TransactionsTable transactions={transactions} />
    </div>
  );
}
