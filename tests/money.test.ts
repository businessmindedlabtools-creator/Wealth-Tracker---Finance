import { describe, expect, it } from "vitest";

import { centsToInputValue, formatCents, parseMoneyToCents } from "@/lib/money";

describe("parseMoneyToCents", () => {
  it.each([
    ["12", 1200],
    ["12.3", 1230],
    ["12.34", 1234],
    ["0.01", 1],
    ["  7.5 ", 750],
    ["12,34", 1234],
    ["12,5", 1250],
    ["1234567.89", 123456789],
    [19.99, 1999],
    [0.1, 10],
  ] as const)("parses %j as %i cents", (input, cents) => {
    expect(parseMoneyToCents(input)).toBe(cents);
  });

  it("avoids float drift that naive *100 would introduce", () => {
    // 4.35 * 100 === 434.99999999999994 in floating point
    expect(parseMoneyToCents("4.35")).toBe(435);
    expect(parseMoneyToCents("1.00")).toBe(100);
  });

  it.each(["", "abc", "-5", "1.234", "1,250.00", "1.250,00", "1,2,3", "1e3", 0.1 + 0.2, NaN])(
    "rejects %j",
    (input) => {
      expect(parseMoneyToCents(input)).toBeNull();
    },
  );
});

describe("formatting", () => {
  it("formats cents in euros", () => {
    expect(formatCents(123456)).toBe("€1,234.56");
    expect(formatCents(-5)).toBe("-€0.05");
  });

  it("round-trips input values", () => {
    for (const cents of [0, 1, 99, 100, 105700, 123456789]) {
      expect(parseMoneyToCents(centsToInputValue(cents))).toBe(cents);
    }
  });
});
