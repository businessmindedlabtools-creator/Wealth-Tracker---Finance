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

This is a Next.js App Router project (Next 16) for personal finance tracking, with three features implemented: transactions, portfolio (stock holdings), and a dashboard that aggregates both.

- **Server actions own all mutations.** Each feature route has a colocated `"use server"` `actions.ts` (`app/transactions/actions.ts`, `app/portfolio/actions.ts`) exporting `create*`/`update*`/`delete*` functions. Each parses input through a Zod schema (`lib/validations/transaction.ts`, `lib/validations/holding.ts`) before touching Prisma, then calls `revalidatePath` for its own route **and** `revalidatePath("/")` so the dashboard reflects the change. Follow this pattern (route-colocated `actions.ts`, schema-validate, revalidate own path + `/`) for new mutating features rather than API routes.
- **Validation and category logic are centralized.** `lib/categories.ts` defines `TRANSACTION_TYPES` and the category lists per type (`categoriesForType`); `lib/validations/transaction.ts` builds the Zod schema on top of it, including a `.refine()` that checks the category matches the selected type. Client forms re-run this same schema (see `transaction-form.tsx`) to surface field errors via `react-hook-form`'s `setError`, so the schema is the single source of truth for both client and server validation — update it in one place when adding fields/categories.
- **Stock prices are fetched and cached in `lib/stock-price.ts`.** `getPrice`/`getPrices` check `PriceCache` in the DB first and only call `yahoo-finance2` when the cached price is older than `CACHE_TTL_MS` (5 minutes) or missing, falling back to the stale cached price (or `null`) if the live fetch fails. Both `app/portfolio/page.tsx` and `lib/dashboard.ts` call `getPrices` to value holdings — reuse it rather than calling `yahoo-finance2` directly.
- **`lib/dashboard.ts` aggregates across features for the home page** (`app/page.tsx`): it sums transactions into income/expenses/cash balance, values holdings via `getPrices`, and buckets expenses by category. It's the one place that reads both `Transaction` and `Holding` data together — extend it rather than duplicating aggregation logic in the page component.
- **Prisma client singleton** lives in `lib/prisma.ts` — import `prisma` from there rather than instantiating `PrismaClient` directly (avoids exhausting connections under dev hot-reload).
- **UI components** are shadcn/ui (`components/ui/*`, style `base-nova`, base color `neutral`, icon library `lucide`) generated via the `shadcn` CLI per `components.json`; path aliases are `@/components`, `@/lib`, `@/components/ui`, `@/hooks`. Feature components are grouped under `components/transactions/`, `components/portfolio/`, and `components/dashboard/` (dialogs wrap a shared `*-form.tsx` that owns form state; `*-row-actions.tsx` / `*-table.tsx` handle list views).
- Dates in forms are plain `type="date"` inputs bound as strings; the Zod schema coerces them (`z.coerce.date()`/`z.coerce.number()`), so form values travel as strings until validation.
