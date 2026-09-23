import { describe, expect, it } from "vitest";

import { holdingSchema } from "@/lib/validations/holding";
import { transactionSchema } from "@/lib/validations/transaction";

const tx = { type: "EXPENSE", amount: "12.34", category: "Food", description: "", date: "2026-09-01" };

describe("transactionSchema", () => {
  it("outputs integer cents", () => {
    const parsed = transactionSchema.parse(tx);
    expect(parsed.amountCents).toBe(1234);
    expect(parsed).not.toHaveProperty("amount");
  });

  it("rejects zero, negative and sub-cent amounts on the amount field", () => {
    for (const amount of ["0", "-1", "1.001", "abc"]) {
      const result = transactionSchema.safeParse({ ...tx, amount });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toEqual(["amount"]);
    }
  });

  it("still enforces category/type matching", () => {
    expect(transactionSchema.safeParse({ ...tx, category: "Salary" }).success).toBe(false);
  });
});

describe("holdingSchema", () => {
  it("treats an empty or missing cost basis as unknown", () => {
    expect(holdingSchema.parse({ ticker: "aapl", shares: "2", costBasis: "" })).toEqual({
      ticker: "AAPL",
      shares: 2,
      costBasisCents: null,
    });
    expect(holdingSchema.parse({ ticker: "AAPL", shares: "2" }).costBasisCents).toBeNull();
  });

  it("converts cost basis to cents and allows zero", () => {
    expect(
      holdingSchema.parse({ ticker: "AAPL", shares: "2", costBasis: "350.10" }).costBasisCents,
    ).toBe(35010);
    expect(holdingSchema.parse({ ticker: "AAPL", shares: "2", costBasis: "0" }).costBasisCents).toBe(0);
  });

  it("rejects an invalid cost basis", () => {
    const result = holdingSchema.safeParse({ ticker: "AAPL", shares: "2", costBasis: "-3" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["costBasis"]);
  });
});
