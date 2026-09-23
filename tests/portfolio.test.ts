import { describe, expect, it } from "vitest";
import type { Holding } from "@prisma/client";

import { valuePortfolio } from "@/lib/portfolio";
import { normalizeQuote, type Quote } from "@/lib/stock-price";

const asOf = new Date("2026-09-23T12:00:00Z");
const q = (price: number, currency: string, stale = false): Quote => ({ price, currency, asOf, stale });
const h = (ticker: string, shares: number, costBasisCents: number | null = null): Holding => ({
  id: ticker,
  ticker,
  shares,
  costBasisCents,
  createdAt: asOf,
  updatedAt: asOf,
});
const EUR = { EUR: q(1, "EUR") };

describe("normalizeQuote", () => {
  it("converts minor-unit currencies to major units", () => {
    expect(normalizeQuote(250, "GBp")).toEqual({ price: 2.5, currency: "GBP" });
    expect(normalizeQuote(1000, "ILA")).toEqual({ price: 10, currency: "ILS" });
    expect(normalizeQuote(100, "USD")).toEqual({ price: 100, currency: "USD" });
  });
});

describe("valuePortfolio", () => {
  it("values EUR holdings and computes gain/loss in cents", () => {
    const v = valuePortfolio([h("SAP.DE", 10, 150000)], { "SAP.DE": q(200.5, "EUR") }, EUR);
    expect(v.holdings[0].marketValueCents).toBe(200500);
    expect(v.holdings[0].gainCents).toBe(50500);
    expect(v.holdings[0].gainRatio).toBeCloseTo(0.33667, 4);
    expect(v.totalValueCents).toBe(200500);
    expect(v.totalGainCents).toBe(50500);
  });

  it("converts foreign-currency prices with the FX rate", () => {
    const v = valuePortfolio([h("AAPL", 2, 30000)], { AAPL: q(200, "USD") }, { USD: q(0.9, "EUR") });
    expect(v.holdings[0].marketValueCents).toBe(36000);
    expect(v.holdings[0].gainCents).toBe(6000);
  });

  it("excludes holdings without a price or FX rate and counts them", () => {
    const v = valuePortfolio(
      [h("SAP.DE", 1, 10000), h("BAD", 5, 10000), h("VOD.L", 100)],
      { "SAP.DE": q(100, "EUR"), BAD: null, "VOD.L": q(0.7, "GBP") },
      { ...EUR, GBP: null },
    );
    expect(v.holdings.map((r) => r.status)).toEqual(["ok", "no-price", "no-fx"]);
    expect(v.holdings[1].marketValueCents).toBeNull();
    expect(v.totalValueCents).toBe(10000);
    expect(v.unpricedCount).toBe(2);
    // Cost basis total only covers holdings that also have a value.
    expect(v.totalCostBasisCents).toBe(10000);
    expect(v.totalGainCents).toBe(0);
  });

  it("flags stale prices but still values them", () => {
    const v = valuePortfolio([h("SAP.DE", 1)], { "SAP.DE": q(100, "EUR", true) }, EUR);
    expect(v.holdings[0].status).toBe("stale");
    expect(v.staleCount).toBe(1);
    expect(v.totalValueCents).toBe(10000);
    expect(v.holdings[0].gainCents).toBeNull();
    expect(v.totalGainRatio).toBeNull();
  });

  it("handles zero cost basis without dividing by zero", () => {
    const v = valuePortfolio([h("SAP.DE", 1, 0)], { "SAP.DE": q(100, "EUR") }, EUR);
    expect(v.holdings[0].gainCents).toBe(10000);
    expect(v.holdings[0].gainRatio).toBeNull();
  });
});
