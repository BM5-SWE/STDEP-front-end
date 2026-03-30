"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { apiFetch } from "@/lib/api"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search,
  Calculator,
  Layers,
  History,
  TrendingUp,
  Star,
  Package,
  ChevronRight,
  BarChart2,
  Award,
  Zap,
  DollarSign,
  RefreshCw,
  Info,
  X,
} from "lucide-react"

type TopProduct = {
  product_id?: string
  asin?: string
  title: string
  main_image_url?: string
  effective_price?: number
  sale_price?: number
  price?: number
  opportunity_score: number
  cluster_name?: string
  cluster_color?: string
  star_rating?: number
  rating?: number
  demand_score?: number
  structural_score?: number
  pricing_score?: number
  durability_score?: number
  validation_score?: number
  confidence_score?: number
  sales_count?: number
  reviews_count?: number
}

type CategoryDef = {
  id: string
  label: string
  is_user_generated: boolean
  suggested_items: string[]
}

type QueryRecord = {
  id: string
  query_text: string
  platform: string
  created_at: string
  total_products_returned?: number
  num_clusters?: number
}

// Score components config
const SCORE_COMPONENTS = [
  { key: "demand_score",     label: "Demand",     color: "#3B82F6", desc: "Sales volume & velocity" },
  { key: "structural_score", label: "Structural",  color: "#8B5CF6", desc: "Listing quality & completeness" },
  { key: "pricing_score",    label: "Pricing",     color: "#10B981", desc: "Price competitiveness" },
  { key: "durability_score", label: "Durability",  color: "#F59E0B", desc: "Long-term sales consistency" },
  { key: "validation_score", label: "Validation",  color: "#EC4899", desc: "Review quality & sentiment" },
]

const CLUSTER_DEFINITIONS = [
  { name: "Winners",                  color: "#1D9E75", desc: "High demand, strong fundamentals, proven sellers. Best sourcing targets." },
  { name: "Full-Price Performers",    color: "#378ADD", desc: "Strong sales without heavy discounting. Higher margin opportunities." },
  { name: "Discount Fighters",        color: "#EF9F27", desc: "Cheap prices, heavy promotions, but low ratings. Risky." },
  { name: "Overpriced Underperformers", color: "#E24B4A", desc: "High prices, low demand. Avoid for sourcing." },
  { name: "Quality Sleepers",         color: "#7F77DD", desc: "Excellent ratings but low sales. Hidden gems needing traffic." },
]

function MiniScoreBar({ value, color }: { value?: number; color: string }) {
  if (value == null) return null
  return (
    <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${Math.round(value * 100)}%`, backgroundColor: color }} />
    </div>
  )
}

function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2
  const circ = 2 * Math.PI * radius
  const dash = (score / 100) * circ
  const color = score >= 70 ? "#1D9E75" : score >= 50 ? "#3B82F6" : score >= 30 ? "#EF9F27" : "#EF4444"

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        fontSize="10" fontWeight="700" fill={color}>
        {score.toFixed(0)}
      </text>
    </svg>
  )
}

function ClusterDistributionChart({ products }: { products: TopProduct[] }) {
  const clusterCounts: Record<string, { count: number; color: string }> = {}
  for (const p of products) {
    if (!p.cluster_name) continue
    if (!clusterCounts[p.cluster_name]) {
      clusterCounts[p.cluster_name] = { count: 0, color: p.cluster_color || "#888" }
    }
    clusterCounts[p.cluster_name].count++
  }

  const total = products.length
  const entries = Object.entries(clusterCounts).sort((a, b) => b[1].count - a[1].count)
  if (entries.length === 0) return null

  return (
    <div className="space-y-2">
      {entries.map(([name, { count, color }]) => (
        <div key={name} className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="w-32 truncate text-muted-foreground">{name}</span>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${(count / total) * 100}%`, backgroundColor: color }} />
          </div>
          <span className="w-6 text-right font-medium text-foreground">{count}</span>
        </div>
      ))}
    </div>
  )
}

function ScoreHistogram({ products }: { products: TopProduct[] }) {
  const buckets = [0, 0, 0, 0, 0]
  const labels = ["0–20", "20–40", "40–60", "60–80", "80–100"]
  const colors = ["#EF4444", "#EF9F27", "#3B82F6", "#1D9E75", "#10B981"]

  for (const p of products) {
    const idx = Math.min(Math.floor(p.opportunity_score / 20), 4)
    buckets[idx]++
  }

  const max = Math.max(...buckets, 1)

  return (
    <div className="flex items-end gap-1.5 h-16">
      {buckets.map((count, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-sm transition-all" style={{
            height: `${(count / max) * 48}px`,
            minHeight: count > 0 ? "4px" : "0",
            backgroundColor: colors[i],
            opacity: 0.85,
          }} />
          <span className="text-[9px] text-muted-foreground">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

function ProductTopCard({
  product,
  rank,
  onClick,
}: {
  product: TopProduct
  rank: number
  onClick: () => void
}) {
  const [imgError, setImgError] = useState(false)
  let imageUrl = product.main_image_url || ""
  if (imageUrl.startsWith("//")) imageUrl = "https:" + imageUrl
  const price = product.effective_price ?? product.sale_price ?? product.price
  const rating = product.star_rating ?? product.rating

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <span className="text-xs font-bold text-muted-foreground w-4 shrink-0 pt-1">
        {rank}
      </span>

      <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
        {imageUrl && !imgError ? (
          <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        ) : (
          <Package className="w-6 h-6 text-muted-foreground/30" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium line-clamp-2 leading-snug text-foreground group-hover:text-primary transition-colors">
          {product.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {price != null && (
            <span className="text-xs font-bold">${price.toFixed(2)}</span>
          )}
          {rating != null && (
            <span className="flex items-center gap-0.5 text-[11px] text-amber-500">
              <Star className="w-2.5 h-2.5 fill-amber-400 stroke-amber-400" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
        {/* Mini score bars with inline legend on hover via title */}
        <div className="flex gap-0.5 mt-1.5">
          {SCORE_COMPONENTS.map((c) => (
            <div key={c.key} className="flex-1" title={`${c.label}: ${c.desc}`}>
              <MiniScoreBar value={(product as unknown as Record<string, number | undefined>)[c.key]} color={c.color} />
            </div>
          ))}
        </div>
      </div>

      <ScoreRing score={product.opportunity_score} size={40} />
    </div>
  )
}

export function DashboardContent() {
  useAuthGuard()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [categories, setCategories] = useState<CategoryDef[]>([])
  const [recentQueries, setRecentQueries] = useState<QueryRecord[]>([])
  const [loadingTop, setLoadingTop] = useState(true)
  const [loadingCats, setLoadingCats] = useState(true)
  const [platform, setPlatform] = useState<"amazon" | "aliexpress">("aliexpress")
  const [showAllTop, setShowAllTop] = useState(false)
  const [showSearchBar, setShowSearchBar] = useState(false)
  const [showClusterInfo, setShowClusterInfo] = useState(false)

  // Fetch weekly top 50
  useEffect(() => {
    apiFetch("/api/data/weekly-top")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.products) setTopProducts(data.products.slice(0, 50))
        else if (Array.isArray(data)) setTopProducts(data.slice(0, 50))
      })
      .catch(() => {})
      .finally(() => setLoadingTop(false))
  }, [])

  // Fetch categories
  useEffect(() => {
    apiFetch("/api/data/categories")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.categories)
          setCategories(data.categories.filter((c: CategoryDef) => c.id !== "uncategorized"))
      })
      .catch(() => {})
      .finally(() => setLoadingCats(false))
  }, [])

  // Fetch recent queries
  useEffect(() => {
    apiFetch("/api/query-history?limit=8")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setRecentQueries(Array.isArray(data) ? data.slice(0, 8) : []))
      .catch(() => {})
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams({ platform })
    if (query.trim()) params.set("q", query.trim())
    router.push(`/dashboard/search?${params.toString()}`)
  }

  const handleQuickSearch = (p: "amazon" | "aliexpress") => {
    setPlatform(p)
    setShowSearchBar(true)
  }

  const displayedProducts = showAllTop ? topProducts : topProducts.slice(0, 10)

  // Stats derived from top products
  const avgScore = topProducts.length
    ? (topProducts.reduce((s, p) => s + p.opportunity_score, 0) / topProducts.length).toFixed(1)
    : "—"
  const topScore = topProducts.length
    ? topProducts[0].opportunity_score.toFixed(1)
    : "—"

  return (
    <main className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="ml-[240px] min-h-screen p-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col gap-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Your e-commerce intelligence hub</p>
              </div>
            </div>

            {/* Search bar — only visible after clicking a search button */}
            {showSearchBar && (
              <div className="flex gap-2 animate-fade-in-up">
                <div className="flex bg-card rounded-full p-1 border border-border shadow-sm">
                  {(["aliexpress", "amazon"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                        platform === p ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {p === "aliexpress" ? "AliExpress" : "Amazon"}
                    </button>
                  ))}
                </div>
                <Input
                  placeholder={`Search ${platform === "amazon" ? "Amazon" : "AliExpress"} products…`}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="border border-border shadow-sm"
                  autoFocus
                />
                <Button onClick={handleSearch} className="shrink-0">
                  <Search className="w-4 h-4 mr-1.5" />
                  Search
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setShowSearchBar(false); setQuery("") }}
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Quick access */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in-up">
            {[
              { label: "Search AliExpress", icon: Search, action: () => handleQuickSearch("aliexpress"), color: "text-orange-500" },
              { label: "Search Amazon",     icon: Search, action: () => handleQuickSearch("amazon"),     color: "text-blue-500" },
              { label: "Margin Calculator", icon: Calculator, action: () => router.push("/dashboard/calculator"), color: "text-emerald-500" },
              { label: "Browse Categories", icon: Layers,     action: () => router.push("/dashboard/categories"), color: "text-purple-500" },
            ].map(({ label, icon: Icon, action, color }) => (
              <Button
                key={label}
                variant="outline"
                className="h-auto py-4 flex flex-col gap-1.5 hover:border-primary/40 transition-colors"
                onClick={action}
              >
                <Icon className={cn("w-5 h-5", color)} />
                <span className="text-xs font-medium">{label}</span>
              </Button>
            ))}
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in-up">

            {/* Left: Top Acquisition Suggestions */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border border-border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      Top Acquisition Suggestions
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full flex items-center gap-1.5" title="Refreshed weekly from your default + favourited categories">
                        <RefreshCw className="w-3 h-3" />
                        AliExpress · Weekly refresh
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Score bar legend — compact inline */}
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider shrink-0">Score bars:</span>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {SCORE_COMPONENTS.map((c) => (
                        <div key={c.key} className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                          <span className="text-[10px] text-muted-foreground">{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {loadingTop ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
                      ))}
                    </div>
                  ) : topProducts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No data yet</p>
                    </div>
                  ) : (
                    <>
                      <div className="divide-y divide-border">
                        {displayedProducts.map((p, i) => (
                          <ProductTopCard
                            key={p.product_id || p.asin || i}
                            product={p}
                            rank={i + 1}
                            onClick={() => {
                              router.push("/dashboard/search?platform=aliexpress")
                            }}
                          />
                        ))}
                      </div>
                      {topProducts.length > 10 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-2 text-xs"
                          onClick={() => setShowAllTop((v) => !v)}
                        >
                          {showAllTop ? "Show less" : `Show all ${topProducts.length} products`}
                          <ChevronRight className={cn("w-3 h-3 ml-1 transition-transform", showAllTop && "rotate-90")} />
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Stats + Charts */}
            <div className="space-y-4">

              {/* Score stats */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="border border-border shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Avg Score</p>
                    <p className="text-2xl font-bold text-primary">{avgScore}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">this week</p>
                  </CardContent>
                </Card>
                <Card className="border border-border shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Top Score</p>
                    <p className="text-2xl font-bold text-emerald-500">{topScore}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">this week</p>
                  </CardContent>
                </Card>
              </div>

              {/* Score distribution */}
              {topProducts.length > 0 && (
                <Card className="border border-border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-blue-500" />
                      Score Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScoreHistogram products={topProducts} />
                  </CardContent>
                </Card>
              )}

              {/* Cluster breakdown */}
              {topProducts.length > 0 && (
                <Card className="border border-border shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-500" />
                        Cluster Breakdown
                      </CardTitle>
                      <span className="text-[10px] text-muted-foreground bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-medium">
                        AliExpress only
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ClusterDistributionChart products={topProducts} />
                    <button
                      onClick={() => setShowClusterInfo((v) => !v)}
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      <Info className="w-3 h-3" />
                      {showClusterInfo ? "Hide cluster guide" : "What do these clusters mean?"}
                    </button>
                  </CardContent>
                </Card>
              )}

              {/* Cluster Legend — expandable */}
              {showClusterInfo && (
                <Card className="border border-border shadow-sm animate-fade-in-up">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Cluster Guide</CardTitle>
                      <span className="text-[10px] text-muted-foreground bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-medium">
                        AliExpress only
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    <p className="text-[11px] text-muted-foreground mb-2">
                      Products are grouped into clusters using ML analysis of pricing, demand, ratings, and promotions.
                    </p>
                    {CLUSTER_DEFINITIONS.map((c) => (
                      <div key={c.name} className="flex gap-2.5 items-start">
                        <div className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: c.color }} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground">{c.name}</p>
                          <p className="text-[11px] text-muted-foreground leading-snug">{c.desc}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Recent queries */}
              {recentQueries.length > 0 && (
                <Card className="border border-border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <History className="w-4 h-4 text-muted-foreground" />
                      Recent Searches
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {recentQueries.map((q) => (
                      <button
                        key={q.id}
                        onClick={() =>
                          router.push(
                            `/dashboard/search?q=${encodeURIComponent(q.query_text)}&platform=${q.platform}`
                          )
                        }
                        className="w-full flex items-center justify-between text-left px-2 py-1.5 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                            {q.query_text}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {q.platform} · {new Date(q.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                      </button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs mt-1"
                      onClick={() => router.push("/dashboard/history")}
                    >
                      View all history
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Categories quick-access */}
              {categories.length > 0 && (
                <Card className="border border-border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-500" />
                      Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingCats ? (
                      <div className="space-y-1.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-7 rounded-lg bg-muted animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {categories.slice(0, 8).map((c) => (
                          <button
                            key={c.id}
                            onClick={() =>
                              router.push(`/dashboard/categories?id=${c.id}`)
                            }
                            className="text-xs px-2.5 py-1 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
                          >
                            {c.label}
                          </button>
                        ))}
                        {categories.length > 8 && (
                          <button
                            onClick={() => router.push("/dashboard/categories")}
                            className="text-xs px-2.5 py-1 rounded-full border border-dashed border-border text-muted-foreground hover:text-foreground transition-colors"
                          >
                            +{categories.length - 8} more
                          </button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
