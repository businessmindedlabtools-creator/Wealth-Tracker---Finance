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
import { HoldingForm } from "@/components/portfolio/holding-form";
import { createHolding } from "@/app/portfolio/actions";

export function AddHoldingDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Add Holding
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Holding</DialogTitle>
        </DialogHeader>
        <HoldingForm
          submitLabel="Add"
          onCancel={() => setOpen(false)}
          defaultValues={{ ticker: "", shares: "" }}
          onSubmit={async (values) => {
            try {
              await createHolding(values);
              toast.success("Holding added");
              setOpen(false);
            } catch {
              toast.error("Failed to add holding");
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
