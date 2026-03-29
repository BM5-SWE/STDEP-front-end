"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { History, BarChart3, Search, ExternalLink } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { apiFetch } from "@/lib/api"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type QueryRecord = {
  id: string
  query_text: string
  platform: string
  s3_result_key?: string
  total_products_returned?: number
  num_clusters?: number
  created_at: string
}

type MarginRecord = {
  id: string
  product_name: string
  platform: string
  cost_price: number
  selling_price: number | null
  margin_percentage: number | null
  created_at: string
}

export default function HistoryPage() {
  useAuthGuard()
  const router = useRouter()
  const [queries, setQueries] = useState<QueryRecord[]>([])
  const [margins, setMargins] = useState<MarginRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [platform, setPlatform] = useState<"all" | "amazon" | "aliexpress">("all")

  useEffect(() => {
    Promise.all([
      apiFetch("/api/query-history?limit=100").then((r) =>
        r.ok ? r.json() : []
      ),
      apiFetch("/api/margin-estimates?limit=100").then((r) =>
        r.ok ? r.json() : []
      ),
    ])
      .then(([q, m]) => {
        setQueries(Array.isArray(q) ? q : [])
        setMargins(Array.isArray(m) ? m : [])
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredQueries =
    platform === "all"
      ? queries
      : queries.filter(
          (q) => q.platform?.toLowerCase() === platform
        )

  const handleViewResults = (q: QueryRecord) => {
    router.push(
      `/dashboard/search?q=${encodeURIComponent(q.query_text)}&platform=${q.platform}`
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="ml-[240px] p-6 pl-0 animate-fade-in-up">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 p-2 rounded-xl">
                <History className="text-primary w-6 h-6" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">
                Query & Margin History
              </h1>
            </div>
            {/* Platform filter */}
            <div className="flex bg-card rounded-full p-1 border border-border shadow-sm">
              <button
                onClick={() => setPlatform("all")}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  platform === "all"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All
              </button>
              <button
                onClick={() => setPlatform("aliexpress")}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  platform === "aliexpress"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                AliExpress
              </button>
              <button
                onClick={() => setPlatform("amazon")}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  platform === "amazon"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Amazon
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <>
              {/* Query History */}
              <section className="mb-8">
                <div className="rounded-2xl bg-card/80 border border-border shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-muted-foreground" /> Past
                    Searches
                  </h2>
                  {filteredQueries.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No search history yet. Run a search to see it here.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredQueries.map((q) => (
                        <div
                          key={q.id}
                          className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">
                                {q.query_text}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded bg-muted shrink-0">
                                {q.platform}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {new Date(q.created_at).toLocaleString()}
                              </span>
                              {q.total_products_returned != null && (
                                <span className="text-xs text-muted-foreground">
                                  {q.total_products_returned} products
                                </span>
                              )}
                              {q.num_clusters != null && q.num_clusters > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {q.num_clusters} clusters
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewResults(q)}
                            className="shrink-0"
                          >
                            <Search className="w-3.5 h-3.5 mr-1" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Margin History */}
              <section>
                <div className="rounded-2xl bg-card/80 border border-border shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-muted-foreground" />{" "}
                    Past Margin Estimates
                  </h2>
                  {margins.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No margin estimates yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {margins.map((m) => (
                        <div
                          key={m.id}
                          className="rounded-lg border p-3 text-sm flex justify-between items-center"
                        >
                          <div>
                            <span className="font-medium">
                              {m.product_name}
                            </span>
                            <span className="text-muted-foreground ml-2">
                              {m.platform}
                            </span>
                            <span className="text-muted-foreground ml-2 text-xs">
                              {new Date(m.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <div>
                              Cost: ${m.cost_price}
                              {m.selling_price != null &&
                                ` → Sell: $${m.selling_price}`}
                            </div>
                            {m.margin_percentage != null && (
                              <div className="text-green-600 font-medium">
                                {m.margin_percentage.toFixed(1)}% margin
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
