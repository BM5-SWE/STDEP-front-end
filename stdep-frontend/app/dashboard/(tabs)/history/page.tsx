// src/app/dashboard/(tabs)/history/page.tsx
export default function HistoryPage() {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Query & Ingestion History</h2>
      <p className="text-xs text-slate-400">
        This view will show previous analytics runs, including their timestamp,
        sources (Amazon/AliExpress/Google), and the number of products scored.
      </p>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-500">
        {/* TODO: bind to /api/v1/analytics/runs later */}
        No runs recorded yet – once the ETL pipeline is wired, recent jobs will
        be listed here.
      </div>
    </section>
  );
}
