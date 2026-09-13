import type { LucideIcon } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "cn";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function StatCard({
  label,
  value,
  tone = "default",
  icon: Icon,
}: {
  label: string;
  value: number;
  tone?: "default" | "positive" | "negative";
  icon?: LucideIcon;
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
          {currency.format(value)}
        </p>
      </CardContent>
    </Card>
  );
}
