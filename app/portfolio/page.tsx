import { prisma } from "@/lib/prisma";
import { getPrices } from "@/lib/stock-price";
import { AddHoldingDialog } from "@/components/portfolio/add-holding-dialog";
import { HoldingsTable } from "@/components/portfolio/holdings-table";

export default async function PortfolioPage() {
  const holdings = await prisma.holding.findMany({
    orderBy: { ticker: "asc" },
  });
  const prices = await getPrices(holdings.map((holding) => holding.ticker));

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Portfolio</h1>
        <AddHoldingDialog />
      </div>
      <HoldingsTable holdings={holdings} prices={prices} />
    </div>
  );
}
