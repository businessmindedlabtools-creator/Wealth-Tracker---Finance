"use client";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BASE_CURRENCY } from "@/lib/money";
import { holdingSchema } from "@/lib/validations/holding";

export interface HoldingFormRawValues {
  ticker: string;
  shares: string;
  costBasis: string;
}

interface HoldingFormProps {
  defaultValues: HoldingFormRawValues;
  submitLabel: string;
  onCancel: () => void;
  /** Receives the raw form values; the server action re-validates them. */
  onSubmit: (values: HoldingFormRawValues) => Promise<void>;
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
    await onSubmit(values);
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

      <div className="space-y-2">
        <Label htmlFor="costBasis">Total cost in {BASE_CURRENCY} (optional)</Label>
        <Input
          id="costBasis"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          {...form.register("costBasis")}
        />
        {form.formState.errors.costBasis ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.costBasis.message}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            What you paid for all shares, including fees. Used for gain/loss.
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
