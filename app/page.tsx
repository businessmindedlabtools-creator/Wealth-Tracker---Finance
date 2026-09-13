import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Finance Tracker</h1>
      <p className="text-muted-foreground">Coming soon.</p>
      <div className="flex gap-4">
        <Link href="/transactions" className="text-sm font-medium underline">
          View Transactions
        </Link>
        <Link href="/portfolio" className="text-sm font-medium underline">
          View Portfolio
        </Link>
      </div>
    </div>
  );
}
