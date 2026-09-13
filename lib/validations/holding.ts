import { z } from "zod";

export const holdingSchema = z.object({
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
});

export type HoldingFormValues = z.infer<typeof holdingSchema>;
