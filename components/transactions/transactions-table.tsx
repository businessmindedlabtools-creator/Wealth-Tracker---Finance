import type { Transaction } from "@prisma/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TransactionRowActions } from "@/components/transactions/transaction-row-actions";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
        No transactions yet. Add your first one to get started.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="whitespace-nowrap">
                {dateFormat.format(transaction.date)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={transaction.type === "INCOME" ? "default" : "secondary"}
                >
                  {transaction.type === "INCOME" ? "Income" : "Expense"}
                </Badge>
              </TableCell>
              <TableCell>{transaction.category}</TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">
                {transaction.description || "—"}
              </TableCell>
              <TableCell
                className={`text-right font-medium tabular-nums ${
                  transaction.type === "INCOME" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {transaction.type === "INCOME" ? "+" : "-"}
                {currency.format(transaction.amount)}
              </TableCell>
              <TableCell>
                <TransactionRowActions transaction={transaction} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
