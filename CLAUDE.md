# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server (also regenerates the AGENTS.md block above)
- `npm run build` — production build
- `npm run lint` — ESLint (flat config via `eslint.config.mjs`, next core-web-vitals + typescript rules)
- `npm test` — Vitest unit tests in `tests/` (money parsing, validation, auth, portfolio valuation)
- `npm run db:backup` / `npm run db:restore -- <file>` — consistent SQLite backup (`VACUUM INTO` + integrity check, into `BACKUP_DIR`, default `backups/`, keeping `BACKUP_KEEP`, default 30) and restore. `npm run build` takes a backup before `prisma migrate deploy`.
- `npm run auth:hash` — prompts for the app password and prints `AUTH_PASSWORD_HASH` + a fresh `AUTH_SECRET` for `.env` (see `.env.example`).

### Database (Prisma + SQLite)

- Schema: `prisma/schema.prisma`. DB file: `prisma/dev.db` (SQLite, gitignored), URL from `DATABASE_URL` in `.env`.
- After editing the schema, run `npx prisma migrate dev --name <description>` to create a migration and regenerate the client.
- `npx prisma studio` to inspect data directly.

## Architecture

This is a Next.js App Router project (Next 16) for personal finance tracking, with three features implemented: transactions, portfolio (stock holdings), and a dashboard that aggregates both.

- **Single-user auth protects everything.** `proxy.ts` (Next 16's replacement for middleware) redirects any request without a valid session cookie to `/login`. The session is a stateless HMAC-signed cookie (`lib/session.ts`, `lib/auth.ts`) checked against a scrypt password hash in `AUTH_PASSWORD_HASH` (`lib/password.ts`); there is no user table or registration. Because server actions are reachable by direct POST, **every page and every server action must also call `await requireSession()` first** — don't rely on the proxy alone.
- **Money is stored as integer cents in EUR** (`Transaction.amountCents`, `Holding.costBasisCents`). Parse user input with `parseMoneyToCents` / the `moneyInCents` Zod helper (`lib/validations/money.ts`) and display with `formatCents` from `lib/money.ts` (`BASE_CURRENCY`); never do float math on money.
- **Server actions own all mutations.** Each feature route has a colocated `"use server"` `actions.ts` (`app/transactions/actions.ts`, `app/portfolio/actions.ts`) exporting `create*`/`update*`/`delete*` functions. Each parses input through a Zod schema (`lib/validations/transaction.ts`, `lib/validations/holding.ts`) before touching Prisma, then calls `revalidatePath` for its own route **and** `revalidatePath("/")` so the dashboard reflects the change. Follow this pattern (route-colocated `actions.ts`, schema-validate, revalidate own path + `/`) for new mutating features rather than API routes.
- **Validation and category logic are centralized.** `lib/categories.ts` defines `TRANSACTION_TYPES` and the category lists per type (`categoriesForType`); `lib/validations/transaction.ts` builds the Zod schema on top of it, including a `.refine()` that checks the category matches the selected type. Client forms re-run this same schema (see `transaction-form.tsx`) to surface field errors via `react-hook-form`'s `setError`, so the schema is the single source of truth for both client and server validation — update it in one place when adding fields/categories.
- **Stock prices are fetched and cached in `lib/stock-price.ts`.** `getQuotes` returns `{ price, currency, asOf, stale }` per ticker (minor units like GBp normalized), caching in `PriceCache` for 5 minutes and falling back to the stale cached quote (or `null`) if Yahoo fails; `getFxRatesToBase` gets `XXXEUR=X` rates the same way. The pure `valuePortfolio` in `lib/portfolio.ts` turns holdings + quotes + FX into EUR market value, cost basis and gain/loss, excluding (and counting) holdings with no price or FX rate. Pages use `getPortfolioValuation()` (`lib/portfolio-data.ts`) — reuse it rather than calling `yahoo-finance2` directly.
- **Pages read the DB at request time.** Data loaders call `connection()` (or read cookies via `requireSession`) so routes are dynamic; the build output should show `/`, `/transactions`, `/portfolio` as ƒ, never ○.
- **`lib/dashboard.ts` aggregates across features for the home page** (`app/page.tsx`): it sums transactions into income/expenses/cash balance, values holdings via `getPortfolioValuation`, and buckets expenses by category. It's the one place that reads both `Transaction` and `Holding` data together — extend it rather than duplicating aggregation logic in the page component.
- **Prisma client singleton** lives in `lib/prisma.ts` — import `prisma` from there rather than instantiating `PrismaClient` directly (avoids exhausting connections under dev hot-reload).
- **UI components** are shadcn/ui (`components/ui/*`, style `base-nova`, base color `neutral`, icon library `lucide`) generated via the `shadcn` CLI per `components.json`; path aliases are `@/components`, `@/lib`, `@/components/ui`, `@/hooks`. Feature components are grouped under `components/transactions/`, `components/portfolio/`, and `components/dashboard/` (dialogs wrap a shared `*-form.tsx` that owns form state; `*-row-actions.tsx` / `*-table.tsx` handle list views).
- Dates in forms are plain `type="date"` inputs bound as strings; the Zod schema coerces them (`z.coerce.date()`/`z.coerce.number()`), so form values travel as strings until validation.
- **`app/layout.tsx` wraps every page** in `ThemeProvider` (`components/theme-provider.tsx`, wraps `next-themes` with `attribute="class"`) and renders `components/nav.tsx` above `{children}`. `Nav` renders the page-level links (Dashboard/Transactions/Portfolio, each with a `lucide-react` icon) on one side and `components/theme-switcher.tsx` at the far right — add new top-level routes to `Nav`'s `links` array rather than linking between pages ad hoc. `ThemeSwitcher` cycles light/dark/system on a single icon button and needs the `mounted` guard pattern it uses (render a disabled placeholder until `useEffect` fires) to avoid SSR/client theme mismatches.
