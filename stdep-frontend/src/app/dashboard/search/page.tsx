"use client"

import { useEffect, useState, useCallback, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { apiFetch } from "@/lib/api"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search,
  Star,
  RefreshCw,
  Loader2,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronRight,
  X,
  HelpCircle,
  Package,
} from "lucide-react"

type ScoredProduct = {
  title: string
  opportunity_score: number
  demand_score?: number
  structural_score?: number
  pricing_score?: number
  confidence_score?: number
  product_id?: string
  effective_price?: number
  sale_price?: number
  original_price?: number
  discount_percent?: number
  star_rating?: number
  sales_count?: number
  main_image_url?: string
  cluster?: number
  cluster_name?: string
  cluster_description?: string
  cluster_color?: string
  durability_score?: number
  asin?: string
  url?: string
  brand?: string
  price?: number
  price_buybox?: number
  currency?: string
  rating?: number
  reviews_count?: number
  avg_sentiment_score?: number
  is_prime_eligible?: boolean
  has_videos?: boolean
  validation_score?: number
}

type PlatformResults = {
  products: ScoredProduct[]
  clusterLegend: Record<string, any>
  key: string
  query: string
  isCached: boolean
}

type CategoryDef = {
  id: string
  label: string
}

const SCORE_COMPONENTS = [
  { key: "demand_score",     label: "Demand",     color: "#3B82F6", desc: "How well the product is selling — based on sales volume & velocity." },
  { key: "structural_score", label: "Structural",  color: "#8B5CF6", desc: "Listing completeness — images, description quality, video presence." },
  { key: "pricing_score",    label: "Pricing",     color: "#10B981", desc: "Price competitiveness relative to the category average." },
  { key: "durability_score", label: "Durability",  color: "#F59E0B", desc: "Long-term consistency — does it sell steadily or in spikes?" },
  { key: "validation_score", label: "Validation",  color: "#EC4899", desc: "Review quality, sentiment, and buyer confidence signals." },
]

const CLUSTER_DEFINITIONS = [
  { name: "Winners",                  color: "#1D9E75", desc: "High demand, strong fundamentals. Best sourcing targets." },
  { name: "Full-Price Performers",    color: "#378ADD", desc: "Strong sales without heavy discounting." },
  { name: "Discount Fighters",        color: "#EF9F27", desc: "Cheap, heavily promoted, but risky quality." },
  { name: "Overpriced Underperformers", color: "#E24B4A", desc: "High prices, low demand. Avoid." },
  { name: "Quality Sleepers",         color: "#7F77DD", desc: "Great ratings, low sales. Hidden gems." },
]

function ScoreBar({ value, color, label }: { value?: number; color: string; label: string }) {
  if (value == null) return null
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-medium w-7 text-right" style={{ color }}>
        {pct}
      </span>
    </div>
  )
}

function OpportunityBadge({ score }: { score: number }) {
  const color = score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-blue-500" : score >= 30 ? "bg-amber-500" : "bg-red-500"
  const label = score >= 70 ? "Strong" : score >= 50 ? "Moderate" : score >= 30 ? "Weak" : "Poor"
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("text-xs font-bold text-white px-2 py-0.5 rounded", color)}>
        {score.toFixed(0)}
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}

function SearchPageContent() {
  useAuthGuard()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const initialQuery = searchParams.get("q") || ""
  const initialPlatform =
    (searchParams.get("platform") as "amazon" | "aliexpress") || "aliexpress"
  const presetCategory = searchParams.get("category") || null

  const [query, setQuery] = useState(initialQuery)
  const [platform, setPlatform] = useState<"amazon" | "aliexpress">(initialPlatform)
  const [isSearching, setIsSearching] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [error, setError] = useState("")

  const [resultsByPlatform, setResultsByPlatform] = useState<
    Record<string, PlatformResults>
  >({})

  const [categories, setCategories] = useState<CategoryDef[]>([])
  const [favouriteModal, setFavouriteModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(
    presetCategory || "uncategorized"
  )
  const [isSaved, setIsSaved] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  const currentResults = resultsByPlatform[platform] || null

  useEffect(() => {
    apiFetch("/api/data/categories")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.categories) setCategories(data.categories)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current)
    }
  }, [])

  const storeResults = useCallback(
    (p: string, data: any, key: string, q: string, cached: boolean) => {
      const products = data?.products || []
      const clusterLegend = data?.cluster_legend || {}
      setResultsByPlatform((prev) => ({
        ...prev,
        [p]: { products, clusterLegend, key, query: q, isCached: cached },
      }))
    },
    []
  )

  const pollStatus = useCallback(
    (arn: string, q: string, p: string) => {
      const poll = async () => {
        try {
          const res = await apiFetch("/api/data/search/status", {
            method: "POST",
            body: JSON.stringify({
              execution_arn: arn,
              query: q,
              platform: p,
            }),
          })
          const data = await res.json()

          if (data.status === "completed" && data.data) {
            storeResults(p, data.data, data.key, q, false)
            setIsSearching(false)
            setStatusMessage("")
            setIsSaved(false)
          } else if (data.status === "failed") {
            setError(data.error || "Pipeline failed")
            setIsSearching(false)
            setStatusMessage("")
          } else {
            setStatusMessage("Pipeline is running — this may take 30-60 seconds...")
            pollRef.current = setTimeout(poll, 3000)
          }
        } catch {
          pollRef.current = setTimeout(poll, 5000)
        }
      }

      poll()
    },
    [storeResults]
  )

  const doSearch = useCallback(
    async (searchQuery: string, searchPlatform: string) => {
      if (!searchQuery.trim()) return
      setError("")
      setIsSearching(true)
      setStatusMessage("Checking for cached results...")
      setIsSaved(false)

      if (pollRef.current) {
        clearTimeout(pollRef.current)
        pollRef.current = null
      }

      try {
        const res = await apiFetch("/api/data/search", {
          method: "POST",
          body: JSON.stringify({
            query: searchQuery,
            platform: searchPlatform,
          }),
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.detail || "Search failed")
          setIsSearching(false)
          setStatusMessage("")
          return
        }

        if (data.status === "cached") {
          storeResults(searchPlatform, data.data, data.key, searchQuery, true)
          setIsSearching(false)
          setStatusMessage("")
        } else if (data.status === "started") {
          setStatusMessage("Pipeline started — waiting for results...")
          pollStatus(data.execution_arn, searchQuery, searchPlatform)
        } else {
          setError("Unexpected response from server")
          setIsSearching(false)
          setStatusMessage("")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error")
        setIsSearching(false)
        setStatusMessage("")
      }
    },
    [storeResults, pollStatus]
  )

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery, initialPlatform)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    if (!query.trim()) return
    router.replace(
      `/dashboard/search?q=${encodeURIComponent(query.trim())}&platform=${platform}`
    )
    doSearch(query.trim(), platform)
  }

  const handlePlatformSwitch = (newPlatform: "amazon" | "aliexpress") => {
    if (newPlatform === platform) return
    if (pollRef.current) {
      clearTimeout(pollRef.current)
      pollRef.current = null
    }
    setPlatform(newPlatform)
    setIsSearching(false)
    setStatusMessage("")
    setError("")
    setIsSaved(false)
  }

  const handleSaveSearch = async () => {
    if (presetCategory) {
      await doSaveFavourite(presetCategory, "suggested")
    } else {
      setFavouriteModal(true)
    }
  }

  const doSaveFavourite = async (categoryId: string, source: string) => {
    const q = currentResults?.query || query
    try {
      await apiFetch(`/api/data/favourites/${platform}`, {
        method: "POST",
        body: JSON.stringify({
          category_id: categoryId,
          query: q,
          source,
        }),
      })
      setIsSaved(true)
    } catch {}
    setFavouriteModal(false)
  }

  const getPrice = (p: ScoredProduct) =>
    p.effective_price ?? p.sale_price ?? p.price ?? p.price_buybox ?? null

  const getRating = (p: ScoredProduct) => p.star_rating ?? p.rating ?? null

  const products = currentResults?.products || []

  const hasClusterData = products.some((p) => p.cluster_name)

  return (
    <main className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="ml-[240px] min-h-screen p-4 pl-0">
        <div className="flex flex-col gap-4 max-w-7xl mx-auto">
          {/* Search Bar + Platform Toggle */}
          <div className="flex gap-2 animate-fade-in-up">
            <div className="flex bg-card rounded-full p-1 border border-border shadow-sm">
              <button
                onClick={() => handlePlatformSwitch("aliexpress")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                  platform === "aliexpress"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                AliExpress
              </button>
              <button
                onClick={() => handlePlatformSwitch("amazon")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                  platform === "amazon"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Amazon
              </button>
            </div>
            <Input
              type="text"
              placeholder={`Search ${platform === "amazon" ? "Amazon" : "AliExpress"} products...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch()
              }}
              className="flex-1 border border-border shadow-sm"
              disabled={isSearching}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Status / Error Messages */}
          {statusMessage && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {statusMessage}
            </div>
          )}
          {error && (
            <div className="text-sm text-destructive">Error: {error}</div>
          )}

          {/* Results Header */}
          {products.length > 0 && !isSearching && (
            <div className="flex items-center justify-between animate-fade-in-up">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {products.length} products
                  {currentResults?.query && (
                    <> for &ldquo;{currentResults.query}&rdquo;</>
                  )}
                  {currentResults?.isCached && (
                    <span className="ml-1 text-xs">(cached)</span>
                  )}
                </span>
                {currentResults?.isCached && (
                  <button
                    onClick={() =>
                      doSearch(currentResults.query || query, platform)
                    }
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGuide((v) => !v)}
                  className="gap-1.5 text-xs"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {showGuide ? "Hide guide" : "How to read results"}
                </Button>
                <Button
                  variant={isSaved ? "outline" : "default"}
                  size="sm"
                  onClick={handleSaveSearch}
                  disabled={isSaved}
                  className="flex items-center gap-1.5"
                >
                  <Star
                    className="w-4 h-4"
                    fill={isSaved ? "currentColor" : "none"}
                  />
                  {isSaved ? "Search saved" : "Save this search"}
                </Button>
              </div>
            </div>
          )}

          {/* Reading Guide — collapsible */}
          {showGuide && products.length > 0 && (
            <Card className="border border-primary/20 shadow-sm animate-fade-in-up">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-primary" />
                    How to Read Product Cards
                  </h3>
                  <button onClick={() => setShowGuide(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">Opportunity Score (0–100)</p>
                    <p>Composite score combining all factors below. Higher = better sourcing opportunity.</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-medium">70+ Strong</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-medium">50–69 Moderate</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-medium">30–49 Weak</span>
                      <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 font-medium">&lt;30 Poor</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">Score Breakdown Bars</p>
                    <div className="space-y-1">
                      {SCORE_COMPONENTS.map((c) => (
                        <div key={c.key} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                          <span className="font-medium text-foreground w-16">{c.label}</span>
                          <span>{c.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {hasClusterData && (
                    <div className="space-y-2 md:col-span-2">
                      <p className="font-semibold text-foreground">
                        Clusters
                        <span className="ml-1.5 font-normal text-[10px] bg-orange-500/10 text-orange-600 px-1.5 py-0.5 rounded-full">AliExpress only</span>
                      </p>
                      <p>Products are grouped by ML analysis of pricing, demand, ratings, and promotions.</p>
                      <div className="flex flex-wrap gap-2">
                        {CLUSTER_DEFINITIONS.map((c) => (
                          <span
                            key={c.name}
                            className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border"
                            style={{ borderColor: c.color, color: c.color }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                            <span className="font-medium">{c.name}</span>
                            <span className="text-muted-foreground">— {c.desc}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cluster Legend — compact inline */}
          {currentResults?.clusterLegend &&
            Object.keys(currentResults.clusterLegend).length > 0 && (
              <div className="flex flex-wrap gap-2 animate-fade-in-up">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider self-center mr-1">Clusters:</span>
                {Object.entries(currentResults.clusterLegend).map(
                  ([id, info]: [string, any]) => (
                    <span
                      key={id}
                      className="text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5"
                      style={{
                        borderColor: info.color || undefined,
                        color: info.color || undefined,
                      }}
                      title={info.description || ""}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: info.color }} />
                      {info.name}
                    </span>
                  )
                )}
              </div>
            )}

          {/* Product Grid */}
          {products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 animate-fade-in-up">
              {products.map((product, i) => {
                const price = getPrice(product)
                const rating = getRating(product)
                const id =
                  product.product_id || product.asin || `${product.title}-${i}`

                return (
                  <Card
                    key={id}
                    className="border border-border shadow-sm hover:shadow-md transition-all group"
                  >
                    <CardContent className="p-3">
                      {product.main_image_url && (
                        <div className="aspect-square mb-2 rounded overflow-hidden bg-muted">
                          <img
                            src={product.main_image_url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <p className="text-sm font-medium line-clamp-2 mb-2">
                        {product.title}
                      </p>

                      {product.brand && (
                        <p className="text-xs text-muted-foreground mb-1.5">
                          {product.brand}
                        </p>
                      )}

                      {/* Price + Opportunity Score */}
                      <div className="flex items-center justify-between mb-2">
                        {price != null && (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-semibold">
                              {product.currency || "$"}{price.toFixed(2)}
                            </span>
                            {product.discount_percent != null && product.discount_percent > 0 && (
                              <span className="text-[10px] font-medium text-green-600 dark:text-green-400">
                                -{product.discount_percent.toFixed(0)}%
                              </span>
                            )}
                          </div>
                        )}
                        <OpportunityBadge score={product.opportunity_score} />
                      </div>

                      {/* Key stats — human readable */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {rating != null && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted flex items-center gap-0.5" title="Customer rating">
                            <Star className="w-2.5 h-2.5 fill-amber-400 stroke-amber-400" />
                            {rating.toFixed(1)}
                          </span>
                        )}
                        {product.reviews_count != null && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted" title="Total reviews">
                            {product.reviews_count.toLocaleString()} reviews
                          </span>
                        )}
                        {product.sales_count != null && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted" title="Units sold">
                            {product.sales_count.toLocaleString()} sold
                          </span>
                        )}
                        {product.is_prime_eligible && (
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" title="Amazon Prime eligible">
                            Prime
                          </span>
                        )}
                      </div>

                      {/* Score breakdown bars */}
                      <div className="space-y-0.5 mb-2">
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
                        <span
                          className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded mb-2"
                          style={{
                            backgroundColor: product.cluster_color
                              ? `${product.cluster_color}20`
                              : undefined,
                            color: product.cluster_color || undefined,
                          }}
                          title={product.cluster_description || ""}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: product.cluster_color }} />
                          {product.cluster_name}
                        </span>
                      )}

                      {product.url && (
                        <div className="mt-1">
                          <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View listing
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Empty state */}
          {!isSearching && !statusMessage && products.length === 0 && !error && (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg">
                Search {platform === "amazon" ? "Amazon" : "AliExpress"} for
                products
              </p>
              <p className="text-sm mt-1">
                Enter a query above to find and score products
              </p>
            </div>
          )}
        </div>

        {/* Save Search Category Modal */}
        {favouriteModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-lg p-6 min-w-[340px] max-w-[90vw] animate-fade-in-up">
              <h2 className="text-lg font-bold mb-3">Save this search</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Choose a category for &ldquo;
                {currentResults?.query || query}&rdquo; or skip to leave
                uncategorized.
              </p>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm mb-4 bg-background"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button
                  onClick={() => doSaveFavourite(selectedCategory, "manual")}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => doSaveFavourite("uncategorized", "manual")}
                >
                  Skip
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setFavouriteModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageContent />
    </Suspense>
  )
}
