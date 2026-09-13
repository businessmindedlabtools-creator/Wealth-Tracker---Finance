"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { createTransaction } from "@/app/transactions/actions";

const today = () => new Date().toISOString().slice(0, 10);

export function AddTransactionDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Add Transaction
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm
          submitLabel="Add"
          onCancel={() => setOpen(false)}
          defaultValues={{
            type: "EXPENSE",
            amount: "",
            category: "",
            description: "",
            date: today(),
          }}
          onSubmit={async (values) => {
            try {
              await createTransaction(values);
              toast.success("Transaction added");
              setOpen(false);
            } catch {
              toast.error("Failed to add transaction");
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
