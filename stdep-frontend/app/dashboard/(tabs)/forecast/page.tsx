// src/app/dashboard/(tabs)/forecast/page.tsx
export default function ForecastPage() {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Price & Trend Forecasting</h2>
      <p className="text-xs text-slate-400">
        This tab will display ML-based projections (e.g., 30-day price or
        demand forecasts) for selected focus products or categories.
      </p>
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-500">
        {/* TODO: bind to /api/v1/forecast later */}
        Forecast charts will appear here after we connect the forecasting
        endpoint and sample data.
      </div>
    </section>
  );
}
