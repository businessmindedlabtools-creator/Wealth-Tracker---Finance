import { ClockIcon, TriangleAlertIcon } from "lucide-react";

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
import { BASE_CURRENCY, formatCents } from "@/lib/money";
import type { HoldingValuation, PortfolioValuation } from "@/lib/portfolio";

const sharesFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});

const percentFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

const timeFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);
}

function PriceCell({ row }: { row: HoldingValuation }) {
  const { quote, status, holding } = row;
  if (!quote || status === "no-price") {
    return (
      <span
        className="inline-flex items-center gap-1 text-amber-600"
        title={`Price unavailable for "${holding.ticker}" — check that it's a valid Yahoo Finance ticker symbol`}
      >
        <TriangleAlertIcon className="size-3.5" />
        Unavailable
      </span>
    );
  }
  const price = formatPrice(quote.price, quote.currency);
  if (status === "no-fx") {
    return (
      <span
        className="inline-flex items-center gap-1 text-amber-600"
        title={`No ${quote.currency}→${BASE_CURRENCY} exchange rate available; excluded from totals`}
      >
        <TriangleAlertIcon className="size-3.5" />
        {price}
      </span>
    );
  }
  if (status === "stale") {
    return (
      <span
        className="inline-flex items-center gap-1 text-amber-600"
        title={`Live price unavailable; using price from ${timeFormat.format(quote.asOf)}`}
      >
        <ClockIcon className="size-3.5" />
        {price}
      </span>
    );
  }
  return <>{price}</>;
}

function GainCell({ gainCents, gainRatio }: { gainCents: number | null; gainRatio: number | null }) {
  if (gainCents == null) return <>—</>;
  const tone =
    gainCents > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : gainCents < 0
        ? "text-destructive"
        : undefined;
  return (
    <span className={tone}>
      {gainCents > 0 ? "+" : ""}
      {formatCents(gainCents)}
      {gainRatio != null && (
        <span className="block text-xs">{percentFormat.format(gainRatio)}</span>
      )}
    </span>
  );
}

export function HoldingsTable({ valuation }: { valuation: PortfolioValuation }) {
  if (valuation.holdings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
        No holdings yet. Add your first one to get started.
      </div>
    );
  }

  const { unpricedCount } = valuation;

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Market Value</TableHead>
            <TableHead className="text-right">Cost Basis</TableHead>
            <TableHead className="text-right">Gain/Loss</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {valuation.holdings.map((row) => (
            <TableRow key={row.holding.id}>
              <TableCell className="font-medium">{row.holding.ticker}</TableCell>
              <TableCell className="text-right tabular-nums">
                {sharesFormat.format(row.holding.shares)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <PriceCell row={row} />
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {row.marketValueCents != null ? formatCents(row.marketValueCents) : "—"}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {row.holding.costBasisCents != null ? formatCents(row.holding.costBasisCents) : "—"}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <GainCell gainCents={row.gainCents} gainRatio={row.gainRatio} />
              </TableCell>
              <TableCell>
                <HoldingRowActions holding={row.holding} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>
              Total
              {unpricedCount > 0 && (
                <span className="block text-xs font-normal text-amber-600">
                  Excludes {unpricedCount} holding{unpricedCount === 1 ? "" : "s"} with no price
                </span>
              )}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatCents(valuation.totalValueCents)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {valuation.totalCostBasisCents ? formatCents(valuation.totalCostBasisCents) : "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              <GainCell
                gainCents={valuation.totalCostBasisCents ? valuation.totalGainCents : null}
                gainRatio={valuation.totalGainRatio}
              />
            </TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
