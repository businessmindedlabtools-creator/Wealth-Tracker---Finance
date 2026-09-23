import type { CategoryTotal } from "@/lib/dashboard";
import { formatCents } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ExpenseBreakdown({ categories }: { categories: CategoryTotal[] }) {
  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No expenses recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  const max = Math.max(...categories.map((c) => c.totalCents));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {categories.map((c) => (
            <li key={c.category} className="group flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="font-medium">{c.category}</span>
                <span className="tabular-nums text-muted-foreground group-hover:text-foreground">
                  {formatCents(c.totalCents)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground/70 transition-colors group-hover:bg-foreground"
                  style={{ width: `${(c.totalCents / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
