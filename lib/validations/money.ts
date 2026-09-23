import { z } from "zod";

import { parseMoneyToCents } from "@/lib/money";

/** A money amount (string or number) validated and converted to integer cents. */
export function moneyInCents(label: string) {
  return z.union([z.string(), z.number()]).transform((value, ctx) => {
    const cents = parseMoneyToCents(value);
    if (cents === null) {
      ctx.addIssue({
        code: "custom",
        message: `${label} must be a valid amount with at most 2 decimal places`,
      });
      return z.NEVER;
    }
    return cents;
  });
}
