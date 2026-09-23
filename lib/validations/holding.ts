import { z } from "zod";

import { moneyInCents } from "@/lib/validations/money";

export const holdingSchema = z
  .object({
    ticker: z
      .string()
      .trim()
      .min(1, "Ticker is required")
      .max(10, "Ticker must be 10 characters or fewer")
      .transform((value) => value.toUpperCase())
      .refine((value) => /^[A-Z0-9.\-]+$/.test(value), {
        message: "Ticker may only contain letters, numbers, '.' and '-'",
      }),
    shares: z.coerce.number().positive("Shares must be greater than 0"),
    // Total amount paid in the base currency; optional because it is not always known.
    costBasis: z
      .literal("")
      .transform(() => null)
      .or(moneyInCents("Cost basis"))
      .optional()
      .transform((value) => value ?? null),
  })
  .transform(({ costBasis, ...rest }) => ({ ...rest, costBasisCents: costBasis }));

export type HoldingFormValues = z.infer<typeof holdingSchema>;
