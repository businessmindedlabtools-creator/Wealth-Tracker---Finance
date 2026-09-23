import type { LucideIcon } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "cn";
import { formatCents } from "@/lib/money";

export function StatCard({
  label,
  valueCents,
  tone = "default",
  icon: Icon,
  note,
}: {
  label: string;
  valueCents: number;
  tone?: "default" | "positive" | "negative";
  icon?: LucideIcon;
  /** Short warning shown under the value, e.g. when a total is incomplete. */
  note?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
        {Icon ? (
          <CardAction>
            <Icon className="size-4 text-muted-foreground" />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-2xl font-semibold tabular-nums tracking-tight",
            tone === "positive" && "text-emerald-600 dark:text-emerald-400",
            tone === "negative" && "text-destructive",
          )}
        >
          {formatCents(valueCents)}
        </p>
        {note ? <p className="mt-1 text-xs text-amber-600">{note}</p> : null}
      </CardContent>
    </Card>
  );
}
