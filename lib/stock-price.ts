import YahooFinance from "yahoo-finance2";

import { BASE_CURRENCY } from "@/lib/money";
import { prisma } from "@/lib/prisma";

const yahooFinance = new YahooFinance();

const CACHE_TTL_MS = 5 * 60 * 1000;

export type Quote = {
  /** Price in major units of `currency` (e.g. GBP, never pence). */
  price: number;
  currency: string;
  asOf: Date;
  /** True when the live fetch failed and an expired cached price is used. */
  stale: boolean;
};

// Yahoo quotes some exchanges in minor units (e.g. LSE in pence as "GBp").
const MINOR_UNIT_CURRENCIES: Record<string, [currency: string, divisor: number]> = {
  GBp: ["GBP", 100],
  GBX: ["GBP", 100],
  ILA: ["ILS", 100],
  ZAc: ["ZAR", 100],
  ZAC: ["ZAR", 100],
};

export function normalizeQuote(
  price: number,
  currency: string,
): { price: number; currency: string } {
  const minor = MINOR_UNIT_CURRENCIES[currency];
  if (minor) return { price: price / minor[1], currency: minor[0] };
  return { price, currency: currency.toUpperCase() };
}

async function getQuote(symbol: string): Promise<Quote | null> {
  const cached = await prisma.priceCache.findUnique({ where: { ticker: symbol } });
  const usableCache = cached?.currency
    ? { price: cached.price, currency: cached.currency, asOf: cached.updatedAt }
    : null;
  if (usableCache && Date.now() - usableCache.asOf.getTime() < CACHE_TTL_MS) {
    return { ...usableCache, stale: false };
  }

  const fallback = usableCache ? { ...usableCache, stale: true } : null;
  try {
    const quote = await yahooFinance.quote(symbol);
    const rawPrice = quote?.regularMarketPrice;
    const rawCurrency = quote?.currency;
    if (typeof rawPrice !== "number" || !Number.isFinite(rawPrice) || !rawCurrency) {
      return fallback;
    }
    const { price, currency } = normalizeQuote(rawPrice, rawCurrency);
    const asOf = new Date();
    await prisma.priceCache.upsert({
      where: { ticker: symbol },
      create: { ticker: symbol, price, currency, updatedAt: asOf },
      update: { price, currency, updatedAt: asOf },
    });
    return { price, currency, asOf, stale: false };
  } catch {
    return fallback;
  }
}

/** Latest quote per ticker, in the ticker's own trading currency. */
export async function getQuotes(tickers: string[]): Promise<Record<string, Quote | null>> {
  const unique = [...new Set(tickers)];
  const entries = await Promise.all(
    unique.map(async (ticker) => [ticker, await getQuote(ticker)] as const),
  );
  return Object.fromEntries(entries);
}

/** How much one unit of each currency is worth in BASE_CURRENCY (1 for itself). */
export async function getFxRatesToBase(currencies: string[]): Promise<Record<string, Quote | null>> {
  const unique = [...new Set(currencies)];
  const entries = await Promise.all(
    unique.map(async (currency) => {
      if (currency === BASE_CURRENCY) {
        return [currency, { price: 1, currency, asOf: new Date(), stale: false }] as const;
      }
      // Yahoo FX symbols such as "USDEUR=X" can't collide with user tickers,
      // which may not contain "=".
      const quote = await getQuote(`${currency}${BASE_CURRENCY}=X`);
      return [currency, quote?.currency === BASE_CURRENCY ? quote : null] as const;
    }),
  );
  return Object.fromEntries(entries);
}
