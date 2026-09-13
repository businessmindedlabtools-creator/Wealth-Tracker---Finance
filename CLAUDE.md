# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server (also regenerates the AGENTS.md block above)
- `npm run build` — production build
- `npm run lint` — ESLint (flat config via `eslint.config.mjs`, next core-web-vitals + typescript rules)
- No test suite is configured.

### Database (Prisma + SQLite)

- Schema: `prisma/schema.prisma`. DB file: `prisma/dev.db` (SQLite, gitignored), URL from `DATABASE_URL` in `.env`.
- After editing the schema, run `npx prisma migrate dev --name <description>` to create a migration and regenerate the client.
- `npx prisma studio` to inspect data directly.

## Architecture

This is a Next.js App Router project (Next 16) for personal finance tracking. Only the transactions feature is implemented so far; `Holding` and `PriceCache` models exist in the Prisma schema for a planned investment-tracking feature (intended to use `yahoo-finance2`, already a dependency) but have no corresponding UI or actions yet.

- **Server actions own all mutations.** `app/transactions/actions.ts` is a `"use server"` module exporting `createTransaction`/`updateTransaction`/`deleteTransaction`. Each parses input through the Zod schema in `lib/validations/transaction.ts` before touching Prisma, and calls `revalidatePath("/transactions")` after writing. Follow this pattern (route-colocated `actions.ts`, schema-validate, revalidate) for new mutating features rather than API routes.
- **Validation and category logic are centralized.** `lib/categories.ts` defines `TRANSACTION_TYPES` and the category lists per type (`categoriesForType`); `lib/validations/transaction.ts` builds the Zod schema on top of it, including a `.refine()` that checks the category matches the selected type. Client forms re-run this same schema (see `transaction-form.tsx`) to surface field errors via `react-hook-form`'s `setError`, so the schema is the single source of truth for both client and server validation — update it in one place when adding fields/categories.
- **Prisma client singleton** lives in `lib/prisma.ts` — import `prisma` from there rather than instantiating `PrismaClient` directly (avoids exhausting connections under dev hot-reload).
- **UI components** are shadcn/ui (`components/ui/*`, style `base-nova`, base color `neutral`, icon library `lucide`) generated via the `shadcn` CLI per `components.json`; path aliases are `@/components`, `@/lib`, `@/components/ui`, `@/hooks`. Feature components live under `components/transactions/` (dialogs wrap the shared `TransactionForm`, which owns form state; `transaction-row-actions.tsx` / `transactions-table.tsx` handle the list view).
- Dates in forms are plain `type="date"` inputs bound as strings; the Zod schema coerces them (`z.coerce.date()`/`z.coerce.number()`), so form values travel as strings until validation.
