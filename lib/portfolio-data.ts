import { connection } from "next/server";

import { prisma } from "@/lib/prisma";
import { valuePortfolio, type PortfolioValuation } from "@/lib/portfolio";
import { getFxRatesToBase, getQuotes } from "@/lib/stock-price";

/** Loads holdings with live (cached) prices, converted to the base currency. */
export async function getPortfolioValuation(): Promise<PortfolioValuation> {
  // Always read at request time, never from a build-time prerender.
  await connection();
  const holdings = await prisma.holding.findMany({ orderBy: { ticker: "asc" } });
  const quotes = await getQuotes(holdings.map((h) => h.ticker));
  const currencies = Object.values(quotes).flatMap((q) => (q ? [q.currency] : []));
  const fxRates = await getFxRatesToBase(currencies);
  return valuePortfolio(holdings, quotes, fxRates);
}
