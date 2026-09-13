import type { Holding } from "@prisma/client";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HoldingRowActions } from "@/components/portfolio/holding-row-actions";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const sharesFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});

export function HoldingsTable({
  holdings,
  prices,
}: {
  holdings: Holding[];
  prices: Record<string, number | null>;
}) {
  if (holdings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
        No holdings yet. Add your first one to get started.
      </div>
    );
  }

  const totalValue = holdings.reduce((sum, holding) => {
    const price = prices[holding.ticker];
    return sum + (price ?? 0) * holding.shares;
  }, 0);

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Market Value</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {holdings.map((holding) => {
            const price = prices[holding.ticker];
            const marketValue = price != null ? price * holding.shares : null;
            return (
              <TableRow key={holding.id}>
                <TableCell className="font-medium">{holding.ticker}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {sharesFormat.format(holding.shares)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {price != null ? currency.format(price) : "—"}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {marketValue != null ? currency.format(marketValue) : "—"}
                </TableCell>
                <TableCell>
                  <HoldingRowActions holding={holding} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {currency.format(totalValue)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
