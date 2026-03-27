import React from "react";
import { History, BarChart3 } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function HistoryPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted/60 to-background">
      <DashboardSidebar />
      <div className="ml-60 p-6 animate-fade-in-up">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-primary/10 p-2 rounded-xl"><History className="text-primary w-6 h-6" /></span>
            <h1 className="text-2xl font-bold tracking-tight">Query & Margin History</h1>
          </div>
          <section className="mb-8">
            <div className="rounded-2xl bg-card/80 border border-border shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-muted-foreground" /> Past Queries</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg bg-gradient-to-br from-[#f7fafc] to-[#e3e8ee] dark:from-[#23272e] dark:to-[#181a1b] border p-4">
                  <h3 className="font-medium text-amazon mb-1">Amazon</h3>
                  <p className="text-muted-foreground text-sm">(No queries yet)</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-[#f7fafc] to-[#e3e8ee] dark:from-[#23272e] dark:to-[#181a1b] border p-4">
                  <h3 className="font-medium text-aliexpress mb-1">AliExpress</h3>
                  <p className="text-muted-foreground text-sm">(No queries yet)</p>
                </div>
              </div>
            </div>
          </section>
          <section>
            <div className="rounded-2xl bg-card/80 border border-border shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-muted-foreground" /> Past Margin Estimate Queries</h2>
              <div className="rounded-lg bg-gradient-to-br from-[#f7fafc] to-[#e3e8ee] dark:from-[#23272e] dark:to-[#181a1b] border p-4">
                <p className="text-muted-foreground text-sm">(No margin estimate queries yet)</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
