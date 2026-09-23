"use client";

import { toast } from "sonner";
import type { Transaction } from "@prisma/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { updateTransaction } from "@/app/transactions/actions";
import type { TransactionType } from "@/lib/categories";
import { centsToInputValue } from "@/lib/money";

interface EditTransactionDialogProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
}: EditTransactionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm
          submitLabel="Save"
          onCancel={() => onOpenChange(false)}
          defaultValues={{
            type: transaction.type as TransactionType,
            amount: centsToInputValue(transaction.amountCents),
            category: transaction.category,
            description: transaction.description ?? "",
            date: transaction.date.toISOString().slice(0, 10),
          }}
          onSubmit={async (values) => {
            try {
              await updateTransaction(transaction.id, values);
              toast.success("Transaction updated");
              onOpenChange(false);
            } catch {
              toast.error("Failed to update transaction");
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
