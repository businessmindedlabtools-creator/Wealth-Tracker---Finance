"use client";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { holdingSchema } from "@/lib/validations/holding";

export interface HoldingFormRawValues {
  ticker: string;
  shares: string;
}

interface HoldingFormProps {
  defaultValues: HoldingFormRawValues;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: { ticker: string; shares: number }) => Promise<void>;
}

export function HoldingForm({
  defaultValues,
  submitLabel,
  onCancel,
  onSubmit,
}: HoldingFormProps) {
  const form = useForm<HoldingFormRawValues>({ defaultValues });

  const handleSubmit = form.handleSubmit(async (values) => {
    const parsed = holdingSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof HoldingFormRawValues;
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
          <Label htmlFor="ticker">Ticker</Label>
          <Input
            id="ticker"
            placeholder="AAPL"
            autoCapitalize="characters"
            {...form.register("ticker")}
          />
          {form.formState.errors.ticker && (
            <p className="text-sm text-destructive">
              {form.formState.errors.ticker.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shares">Shares</Label>
          <Input
            id="shares"
            type="number"
            step="any"
            min="0"
            placeholder="0"
            {...form.register("shares")}
          />
          {form.formState.errors.shares && (
            <p className="text-sm text-destructive">
              {form.formState.errors.shares.message}
            </p>
          )}
        </div>
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
