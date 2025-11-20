// src/app/dashboard/page.tsx
export default function DashboardOverviewPage() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 md:col-span-2">
        <h2 className="text-sm font-semibold mb-1">Trend Signals</h2>
        <p className="text-xs text-slate-400 mb-3">
          Top product or category scores from the latest ingestion + scoring
          run. This will eventually pull from the ML scoring engine.
        </p>
        <div className="text-xs text-slate-500">
          {/* TODO: replace with table/chart bound to backend */}
          No data yet – connect to backend /api/v1/analytics/trends.
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-sm font-semibold mb-1">Focus Categories</h2>
        <p className="text-xs text-slate-400 mb-3">
          User-selected watchlist of categories or items to track.
        </p>
        {/* TODO: later bind to user focus list */}
        <ul className="text-xs text-slate-500 space-y-1">
          <li>– Electronics (example)</li>
          <li>– Kitchen & Home (example)</li>
          <li>– Sports Accessories (example)</li>
        </ul>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 md:col-span-3">
        <h2 className="text-sm font-semibold mb-1">Margin Calculator</h2>
        <p className="text-xs text-slate-400 mb-3">
          Quick view of expected margin and profit per unit given Amazon fees,
          supplier price, and duties.
        </p>
        {/* TODO: later replace with real calculator widget */}
        <p className="text-xs text-slate-500">
          This section will connect to the margin calculation API and supplier
          pricing data.
        </p>
      </section>
    </div>
  );
}
