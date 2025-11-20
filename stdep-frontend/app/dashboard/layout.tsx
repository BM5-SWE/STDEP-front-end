// src/app/dashboard/layout.tsx
import Link from "next/link";
import type { ReactNode } from "react";

const tabs = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/forecast", label: "Forecast" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Analytics Dashboard</h1>
          <p className="text-xs text-slate-400">
            PSCC product trend, margin, and supplier signal prototype.
          </p>
        </div>
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          Back to landing
        </Link>
      </header>

      <nav className="border-b border-slate-800 px-6 py-2 text-sm flex gap-4">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="text-slate-300 hover:text-emerald-400"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <main className="p-6">{children}</main>
    </div>
  );
}
