import YahooFinance from "yahoo-finance2";

import { prisma } from "@/lib/prisma";

const yahooFinance = new YahooFinance();

const CACHE_TTL_MS = 5 * 60 * 1000;

export async function getPrice(ticker: string): Promise<number | null> {
  const cached = await prisma.priceCache.findUnique({ where: { ticker } });
  if (cached && Date.now() - cached.updatedAt.getTime() < CACHE_TTL_MS) {
    return cached.price;
  }

  try {
    const quote = await yahooFinance.quote(ticker);
    const price = quote?.regularMarketPrice;
    if (typeof price !== "number") {
      return cached?.price ?? null;
    }
    await prisma.priceCache.upsert({
      where: { ticker },
      create: { ticker, price },
      update: { price },
    });
    return price;
  } catch {
    return cached?.price ?? null;
  }
}

export async function getPrices(tickers: string[]): Promise<Record<string, number | null>> {
  const uniqueTickers = [...new Set(tickers)];
  const entries = await Promise.all(
    uniqueTickers.map(async (ticker) => [ticker, await getPrice(ticker)] as const),
  );
  return Object.fromEntries(entries);
}
