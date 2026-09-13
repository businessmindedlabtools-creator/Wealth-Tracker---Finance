"use client";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  TRANSACTION_TYPES,
  categoriesForType,
  type TransactionType,
} from "@/lib/categories";
import { transactionSchema } from "@/lib/validations/transaction";

export interface TransactionFormRawValues {
  type: TransactionType;
  amount: string;
  category: string;
  description: string;
  date: string;
}

interface TransactionFormProps {
  defaultValues: TransactionFormRawValues;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: {
    type: TransactionType;
    amount: number;
    category: string;
    description?: string;
    date: Date;
  }) => Promise<void>;
}

export function TransactionForm({
  defaultValues,
  submitLabel,
  onCancel,
  onSubmit,
}: TransactionFormProps) {
  const form = useForm<TransactionFormRawValues>({ defaultValues });
  const type = form.watch("type");
  const category = form.watch("category");
  const categories = categoriesForType(type);

  const handleSubmit = form.handleSubmit(async (values) => {
    const parsed = transactionSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof TransactionFormRawValues;
        form.setError(field, { message: issue.message });
      }
      return;
    }
    await onSubmit(parsed.data);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={type}
            onValueChange={(value) => {
              const nextType = value as TransactionType;
              form.setValue("type", nextType);
              if (!categoriesForType(nextType).includes(form.getValues("category"))) {
                form.setValue("category", "");
              }
              form.clearErrors("category");
            }}
          >
            <SelectTrigger id="type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRANSACTION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "INCOME" ? "Income" : "Expense"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...form.register("amount")}
          />
          {form.formState.errors.amount && (
            <p className="text-sm text-destructive">
              {form.formState.errors.amount.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={category}
            onValueChange={(value) => {
              form.setValue("category", value ?? "");
              form.clearErrors("category");
            }}
          >
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category && (
            <p className="text-sm text-destructive">
              {form.formState.errors.category.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...form.register("date")} />
          {form.formState.errors.date && (
            <p className="text-sm text-destructive">
              {form.formState.errors.date.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Add a note..."
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
