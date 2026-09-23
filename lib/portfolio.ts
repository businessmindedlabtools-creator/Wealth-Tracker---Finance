// Pure portfolio valuation (no I/O) so the money math can be unit-tested.
// All results are in integer cents of BASE_CURRENCY (lib/money.ts).
import type { Holding } from "@prisma/client";

import type { Quote } from "@/lib/stock-price";

export type ValuationStatus = "ok" | "stale" | "no-price" | "no-fx";

export type HoldingValuation = {
  holding: Holding;
  /** Quote in the ticker's trading currency, when available. */
  quote: Quote | null;
  marketValueCents: number | null;
  gainCents: number | null;
  /** Gain as a fraction of cost basis (0.1 = +10%); null if unknown or zero cost. */
  gainRatio: number | null;
  status: ValuationStatus;
};

export type PortfolioValuation = {
  holdings: HoldingValuation[];
  /** Sum of market values of the priced holdings only. */
  totalValueCents: number;
  /** Cost basis and gain cover only holdings that have both a cost basis and a price. */
  totalCostBasisCents: number;
  totalGainCents: number;
  totalGainRatio: number | null;
  unpricedCount: number;
  staleCount: number;
};

export function valuePortfolio(
  holdings: HoldingValuation["holding"][],
  quotes: Record<string, Quote | null>,
  fxRatesToBase: Record<string, Quote | null>,
): PortfolioValuation {
  const rows = holdings.map((holding): HoldingValuation => {
    const quote = quotes[holding.ticker] ?? null;
    const empty = { holding, quote, marketValueCents: null, gainCents: null, gainRatio: null };
    if (!quote) return { ...empty, status: "no-price" };

    const fx = fxRatesToBase[quote.currency] ?? null;
    if (!fx) return { ...empty, status: "no-fx" };

    const marketValueCents = Math.round(quote.price * fx.price * holding.shares * 100);
    const cost = holding.costBasisCents;
    const gainCents = cost != null ? marketValueCents - cost : null;
    return {
      holding,
      quote,
      marketValueCents,
      gainCents,
      gainRatio: gainCents != null && cost ? gainCents / cost : null,
      status: quote.stale || fx.stale ? "stale" : "ok",
    };
  });

  let totalValueCents = 0;
  let totalCostBasisCents = 0;
  let totalGainCents = 0;
  for (const row of rows) {
    if (row.marketValueCents == null) continue;
    totalValueCents += row.marketValueCents;
    if (row.gainCents != null) {
      totalCostBasisCents += row.holding.costBasisCents ?? 0;
      totalGainCents += row.gainCents;
    }
  }

  return {
    holdings: rows,
    totalValueCents,
    totalCostBasisCents,
    totalGainCents,
    totalGainRatio: totalCostBasisCents ? totalGainCents / totalCostBasisCents : null,
    unpricedCount: rows.filter((r) => r.status === "no-price" || r.status === "no-fx").length,
    staleCount: rows.filter((r) => r.status === "stale").length,
  };
}
