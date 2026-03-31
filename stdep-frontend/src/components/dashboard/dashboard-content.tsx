"use client"

import { useEffect, useState } from "react"
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
  Star,
  Package,
  ChevronRight,
  Award,
  RefreshCw,
  Info,
  X,
  HelpCircle,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Loader2,
} from "lucide-react"

type TopProduct = {
  product_id?: string
  asin?: string
  title: string
  main_image_url?: string
  effective_price?: number
  sale_price?: number
  price?: number
  price_buybox?: number
  original_price?: number
  currency?: string
  opportunity_score: number
  cluster_name?: string
  cluster_color?: string
  cluster_description?: string
  star_rating?: number
  rating?: number
  demand_score?: number
  structural_score?: number
  pricing_score?: number
  durability_score?: number
  validation_score?: number
  confidence_score?: number
  avg_sentiment_score?: number
  sales_count?: number
  reviews_count?: number
  discount_percent?: number
  is_prime_eligible?: boolean
  has_videos?: boolean
  brand?: string
  url?: string
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
}

const SCORE_COMPONENTS = [
  { key: "demand_score",     label: "Demand",     color: "#3B82F6", desc: "Sales volume & velocity" },
  { key: "structural_score", label: "Structural",  color: "#8B5CF6", desc: "Listing quality & completeness" },
  { key: "pricing_score",    label: "Pricing",     color: "#10B981", desc: "Price competitiveness" },
  { key: "durability_score", label: "Durability",  color: "#F59E0B", desc: "Long-term sales consistency" }
]

const CLUSTER_DEFINITIONS = [
  { name: "Winners",                    color: "#1D9E75", desc: "High demand, strong fundamentals. Best sourcing targets." },
  { name: "Full-Price Performers",      color: "#378ADD", desc: "Strong sales without heavy discounting." },
  { name: "Discount Fighters",          color: "#EF9F27", desc: "Cheap, heavily promoted, but risky quality." },
  { name: "Overpriced Underperformers", color: "#E24B4A", desc: "High prices, low demand. Avoid." },
  { name: "Quality Sleepers",           color: "#7F77DD", desc: "Great ratings, low sales. Hidden gems." },
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

function ScoreBar({ value, color, label }: { value?: number; color: string; label: string }) {
  if (value == null) return null
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[11px] font-semibold w-8 text-right" style={{ color }}>{pct}</span>
    </div>
  )
}

function OpportunityBadge({ score }: { score: number }) {
  const color = score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-blue-500" : score >= 30 ? "bg-amber-500" : "bg-red-500"
  const label = score >= 70 ? "Strong" : score >= 50 ? "Moderate" : score >= 30 ? "Weak" : "Poor"
  return (
    <div className="flex items-center gap-2">
      <div className={cn("text-sm font-bold text-white px-2.5 py-0.5 rounded", color)}>{score.toFixed(0)}</div>
      <span className="text-xs text-muted-foreground">{label} opportunity</span>
    </div>
  )
}

function ProductDetailModal({
  product,
  onClose,
}: {
  product: TopProduct
  onClose: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  let imageUrl = product.main_image_url || ""
  if (imageUrl.startsWith("//")) imageUrl = "https:" + imageUrl
  const price = product.effective_price ?? product.sale_price ?? product.price ?? product.price_buybox ?? null
  const rating = product.star_rating ?? product.rating ?? null

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await apiFetch("/api/saved-products", {
        method: "POST",
        body: JSON.stringify({
          product_name: product.title,
          platform: "aliexpress",
          platform_url: product.url || null,
          product_image_url: imageUrl || null,
          price,
          currency: product.currency || "USD",
          category: product.cluster_name || product.brand || null,
          cluster_id: null,
          scores: {
            opportunity_score: product.opportunity_score ?? null,
            demand_score: product.demand_score ?? null,
            structural_score: product.structural_score ?? null,
            pricing_score: product.pricing_score ?? null,
            durability_score: product.durability_score ?? null,
            confidence_score: product.confidence_score ?? null,
            validation_score: product.validation_score ?? null,
            avg_sentiment_score: product.avg_sentiment_score ?? null,
            star_rating: product.star_rating ?? null,
            rating: product.rating ?? null,
            reviews_count: product.reviews_count ?? null,
            sales_count: product.sales_count ?? null,
            discount_percent: product.discount_percent ?? null,
            is_prime_eligible: product.is_prime_eligible ?? null,
            has_videos: product.has_videos ?? null,
            brand: product.brand ?? null,
            cluster_name: product.cluster_name ?? null,
            cluster_description: product.cluster_description ?? null,
            cluster_color: product.cluster_color ?? null,
            original_price: product.original_price ?? null,
          },
        }),
      })
      if (res.ok) setSaved(true)
    } catch {}
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-4xl mx-4 h-[85vh] flex overflow-hidden animate-fade-in-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Image */}
        <div className="w-1/2 bg-muted flex items-center justify-center shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-contain p-6"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
            />
          ) : (
            <Package className="w-20 h-20 text-muted-foreground/20" />
          )}
        </div>

        {/* Right: Details */}
        <div className="w-1/2 p-6 flex flex-col">
          {/* Title */}
          <h2 className="text-base font-semibold leading-snug pr-8">{product.title}</h2>

          {/* Brand */}
          {product.brand && (
            <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>
          )}

          {/* Price + Opportunity */}
          <div className="flex items-center justify-between mt-4">
            {price != null && (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold">{product.currency || "$"}{price.toFixed(2)}</span>
                {product.discount_percent != null && product.discount_percent > 0 && (
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">-{product.discount_percent.toFixed(0)}%</span>
                )}
                {product.original_price != null && product.original_price > (price || 0) && (
                  <span className="text-sm text-muted-foreground line-through">{product.currency || "$"}{product.original_price.toFixed(2)}</span>
                )}
              </div>
            )}
            <OpportunityBadge score={product.opportunity_score} />
          </div>

          {/* Stats badges */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="text-xs px-2 py-0.5 rounded bg-muted font-medium">AliExpress</span>
            {rating != null && (
              <span className="text-xs px-2 py-0.5 rounded bg-muted flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />{rating.toFixed(1)}
              </span>
            )}
            {product.reviews_count != null && (
              <span className="text-xs px-2 py-0.5 rounded bg-muted">{product.reviews_count.toLocaleString()} reviews</span>
            )}
            {product.sales_count != null && (
              <span className="text-xs px-2 py-0.5 rounded bg-muted">{product.sales_count.toLocaleString()} sold</span>
            )}
            {product.is_prime_eligible && (
              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">Prime</span>
            )}
          </div>

          {/* Score bars */}
          <div className="space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border mt-4 flex-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Score Breakdown</p>
            {SCORE_COMPONENTS.map((c) => (
              <ScoreBar
                key={c.key}
                value={(product as unknown as Record<string, number | undefined>)[c.key]}
                color={c.color}
                label={c.label}
              />
            ))}
          </div>

          {/* Cluster badge */}
          {product.cluster_name && (
            <div className="flex items-center gap-2 mt-3">
              <span
                className="text-xs inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ backgroundColor: product.cluster_color ? `${product.cluster_color}20` : undefined, color: product.cluster_color || undefined }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: product.cluster_color }} />
                {product.cluster_name}
              </span>
              {product.cluster_description && (
                <span className="text-[11px] text-muted-foreground">{product.cluster_description}</span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-3 mt-3 border-t border-border">
            <Button
              onClick={handleSave}
              disabled={saving || saved}
              className="flex-1 gap-1.5"
              variant={saved ? "outline" : "default"}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              {saved ? "Saved" : "Save Product"}
            </Button>
            {product.url && (
              <Button variant="outline" asChild className="gap-1.5">
                <a href={product.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  View Listing
                </a>
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
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
  const [showGuide, setShowGuide] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<TopProduct | null>(null)

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [selectedProduct])

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

  const hasClusterData = topProducts.some((p) => p.cluster_name)

  return (
    <main className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="ml-[240px] min-h-screen p-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col gap-4 animate-fade-in-up">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Your e-commerce intelligence hub</p>
            </div>

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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowGuide((v) => !v)}
                        className="h-7 px-2 text-[11px] gap-1"
                      >
                        <HelpCircle className="w-3 h-3" />
                        {showGuide ? "Hide guide" : "How to read"}
                      </Button>
                      <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full flex items-center gap-1.5" title="Refreshed weekly from your default + favourited categories">
                        <RefreshCw className="w-3 h-3" />
                        AliExpress · Weekly refresh
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Reading guide */}
                  {showGuide && (
                    <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border animate-fade-in-up">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-xs font-semibold flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-primary" />
                          How to Read These Results
                        </h4>
                        <button onClick={() => setShowGuide(false)} className="text-muted-foreground hover:text-foreground">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-muted-foreground">
                        <div className="space-y-1.5">
                          <p className="font-semibold text-foreground">Score Ring (0–100)</p>
                          <p>Overall opportunity score. Higher = better sourcing target.</p>
                          <div className="flex gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">70+ Strong</span>
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">50–69 Moderate</span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">30–49 Weak</span>
                            <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-medium">&lt;30 Poor</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <p className="font-semibold text-foreground">Score Bars (left to right)</p>
                          <div className="space-y-0.5">
                            {SCORE_COMPONENTS.map((c) => (
                              <div key={c.key} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                                <span className="font-medium text-foreground w-14">{c.label}</span>
                                <span>{c.desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Score bar legend — compact inline */}
                  {!showGuide && (
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
                  )}

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
                            onClick={() => setSelectedProduct(p)}
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

            {/* Right sidebar */}
            <div className="space-y-4">

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

      {/* Product detail modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  )
}
