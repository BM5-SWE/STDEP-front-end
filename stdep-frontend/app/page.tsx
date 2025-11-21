// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-50">
      <div className="max-w-xl px-4 text-center space-y-4">
        <h1 className="text-3xl font-semibold">
          Smart Trend-Driven eCommerce Pilot
        </h1>
        <p className="text-slate-300 text-sm">
          Prototype analytics portal for PSCC to explore product trends,
          profitability, and supplier options from marketplaces and suppliers.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-600"
        >
          Go to dashboard login
        </Link>
      </div>
    </main>
  );
}
