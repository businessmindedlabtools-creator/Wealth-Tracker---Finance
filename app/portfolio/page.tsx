import { requireSession } from "@/lib/auth";
import { getPortfolioValuation } from "@/lib/portfolio-data";
import { AddHoldingDialog } from "@/components/portfolio/add-holding-dialog";
import { HoldingsTable } from "@/components/portfolio/holdings-table";

export default async function PortfolioPage() {
  await requireSession();
  const valuation = await getPortfolioValuation();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Portfolio</h1>
        <AddHoldingDialog />
      </div>
      <HoldingsTable valuation={valuation} />
    </div>
  );
}
