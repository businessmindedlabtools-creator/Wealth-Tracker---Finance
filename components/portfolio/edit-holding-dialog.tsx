"use client";

import { toast } from "sonner";
import type { Holding } from "@prisma/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HoldingForm } from "@/components/portfolio/holding-form";
import { updateHolding } from "@/app/portfolio/actions";
import { centsToInputValue } from "@/lib/money";

interface EditHoldingDialogProps {
  holding: Holding;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditHoldingDialog({
  holding,
  open,
  onOpenChange,
}: EditHoldingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Holding</DialogTitle>
        </DialogHeader>
        <HoldingForm
          submitLabel="Save"
          onCancel={() => onOpenChange(false)}
          defaultValues={{
            ticker: holding.ticker,
            shares: String(holding.shares),
            costBasis:
              holding.costBasisCents != null ? centsToInputValue(holding.costBasisCents) : "",
          }}
          onSubmit={async (values) => {
            try {
              await updateHolding(holding.id, values);
              toast.success("Holding updated");
              onOpenChange(false);
            } catch {
              toast.error("Failed to update holding");
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
