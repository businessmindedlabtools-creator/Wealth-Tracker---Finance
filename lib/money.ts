// Money is handled as integer cents of BASE_CURRENCY everywhere it is stored
// or summed. Kept free of path-alias imports so scripts and tests can use it.

/** The app's single currency for stored amounts, totals and display. */
export const BASE_CURRENCY = "EUR";

const MONEY_PATTERN = /^\d+(\.\d{0,2})?$/;

/**
 * Parses an amount ("12", "12.3", "12.34", "12,34", or a number) into integer
 * cents without going through floating-point multiplication. A single comma is
 * accepted as the decimal separator; thousands separators are rejected rather
 * than guessed, so "1,250" can never silently become 1.25 or 1250. Returns
 * null for anything that is not a non-negative amount with at most two decimals.
 */
export function parseMoneyToCents(value: string | number): number | null {
  let text = (typeof value === "number" ? String(value) : value).trim();
  if (!text.includes(".") && /^\d+,\d{1,2}$/.test(text)) {
    text = text.replace(",", ".");
  }
  if (!MONEY_PATTERN.test(text)) return null;
  const [whole, fraction = ""] = text.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

/** Formats cents as a plain input value, e.g. 1050 -> "10.50". */
export function centsToInputValue(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: BASE_CURRENCY,
});

/** Formats cents for display, e.g. 123456 -> "€1,234.56". */
export function formatCents(cents: number): string {
  return currency.format(cents / 100);
}
