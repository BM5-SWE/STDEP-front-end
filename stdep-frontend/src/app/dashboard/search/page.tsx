"use client"

import { useEffect, useState, useCallback, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { apiFetch } from "@/lib/api"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Search,
  Star,
  RefreshCw,
  Loader2,
  ExternalLink,
  TrendingUp,
  Users,
  DollarSign,
  ShieldCheck,
  BarChart2,
  Award,
  Zap,
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
  verified_review_share?: number
  num_images?: number
  num_variations?: number
  sales_volume?: string
  mean_sample_rating?: number
}

type SearchResults = {
  query: string
  platform: string
  products: ScoredProduct[]
  clusterLegend: Record<string, { name: string; description: string; color: string }>
  cachedAt?: string
}

type CategoryDef = {
  id: string
  label: string
  is_user_generated: boolean
  suggested_items: string[]
}

// Cluster metadata with icon + plain-English meaning
const CLUSTER_DISPLAY: Record<string, { icon: React.ElementType; tagline: string }> = {
  "Winners":             { icon: Award,      tagline: "High demand & strong fundamentals" },
  "Full-Price Performers":{ icon: DollarSign, tagline: "Sells well without heavy discounting" },
  "Quality Sleepers":    { icon: Zap,        tagline: "Great ratings, untapped traffic" },
  "Discount Fighters":   { icon: TrendingUp, tagline: "Cheap & promoted, but riskier" },
  "Niche Specialists":   { icon: Package,    tagline: "Specific audience, low competition" },
}

function ScoreBar({ label, value, color }: { label: string; value?: number; color: string }) {
  if (value == null) return null
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-6 text-right text-muted-foreground">{pct}</span>
    </div>
  )
}

function SentimentBadge({ score }: { score?: number }) {
  if (score == null) return null
  const pct = Math.round((score + 1) * 50) // -1..1 → 0..100
  const label = score >= 0.05 ? "Positive" : score <= -0.05 ? "Negative" : "Neutral"
  const color = score >= 0.05 ? "text-emerald-600" : score <= -0.05 ? "text-red-500" : "text-yellow-600"
  return (
    <span className={cn("text-xs font-medium", color)}>
      {label} ({pct}%)
    </span>
  )
}

function ProductCard({
  product,
  platform,
  onFavourite,
}: {
  product: ScoredProduct
  platform: string
  onFavourite: (p: ScoredProduct) => void
}) {
  const [imgError, setImgError] = useState(false)
  const id = product.product_id || product.asin || product.title
  const price = product.effective_price ?? product.sale_price ?? product.price
  const rating = product.star_rating ?? product.rating
  const reviewCount = product.sales_count ?? product.reviews_count
  const score = product.opportunity_score ?? 0

  // Score colour ramp
  const scoreColor =
    score >= 70 ? "#1D9E75" :
    score >= 50 ? "#3B82F6" :
    score >= 30 ? "#EF9F27" : "#EF4444"

  // Normalise AliExpress image URL
  let imageUrl = product.main_image_url || ""
  if (imageUrl && imageUrl.startsWith("//")) imageUrl = "https:" + imageUrl

  const ClusterIcon = product.cluster_name
    ? (CLUSTER_DISPLAY[product.cluster_name]?.icon ?? BarChart2)
    : BarChart2

  return (
    <Card className="border border-border shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
      {/* Image */}
      <div className="relative w-full h-40 bg-muted flex items-center justify-center overflow-hidden shrink-0">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <Package className="w-12 h-12 text-muted-foreground/30" />
        )}
        {/* Score badge */}
        <div
          className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-bold text-white shadow"
          style={{ backgroundColor: scoreColor }}
        >
          {score.toFixed(0)}
        </div>
        {/* Prime badge */}
        {product.is_prime_eligible && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            PRIME
          </div>
        )}
      </div>

      <CardContent className="p-3 flex flex-col flex-1 gap-2">
        {/* Title */}
        <p className="text-xs font-semibold leading-snug line-clamp-2 text-foreground">
          {product.title}
        </p>

        {/* Brand */}
        {product.brand && (
          <p className="text-[11px] text-muted-foreground -mt-1">{product.brand}</p>
        )}

        {/* Cluster badge */}
        {product.cluster_name && (
          <div
            className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full w-fit"
            style={{
              backgroundColor: product.cluster_color ? `${product.cluster_color}18` : undefined,
              color: product.cluster_color || undefined,
              border: product.cluster_color ? `1px solid ${product.cluster_color}40` : undefined,
            }}
          >
            <ClusterIcon className="w-3 h-3 shrink-0" />
            {product.cluster_name}
          </div>
        )}

        {/* Price + Rating row */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">
            {price != null ? `$${price.toFixed(2)}` : "—"}
            {product.currency && product.currency !== "CAD" && (
              <span className="text-[10px] text-muted-foreground ml-1">{product.currency}</span>
            )}
          </span>
          {rating != null && (
            <span className="flex items-center gap-0.5 text-xs text-amber-500 font-medium">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              {rating.toFixed(1)}
              {reviewCount != null && (
                <span className="text-muted-foreground ml-0.5">
                  ({reviewCount >= 1000 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount})
                </span>
              )}
            </span>
          )}
        </div>

        {/* Discount (AliExpress) */}
        {product.discount_percent != null && product.discount_percent > 0 && (
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-medium px-1.5 py-0.5 rounded">
              -{product.discount_percent.toFixed(0)}%
            </span>
            {product.original_price != null && (
              <span className="text-muted-foreground line-through">
                ${product.original_price.toFixed(2)}
              </span>
            )}
          </div>
        )}

        {/* Sales volume */}
        {product.sales_volume && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3 shrink-0" />
            {product.sales_volume} sold
          </p>
        )}

        {/* Sentiment (Amazon) */}
        {product.avg_sentiment_score != null && (
          <div className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Sentiment:</span>
            <SentimentBadge score={product.avg_sentiment_score} />
          </div>
        )}

        {/* Score breakdown bars */}
        <div className="space-y-1 pt-1 border-t border-border">
          {platform === "aliexpress" ? (
            <>
              <ScoreBar label="Demand"    value={product.demand_score}    color="#3B82F6" />
              <ScoreBar label="Pricing"   value={product.pricing_score}   color="#10B981" />
              <ScoreBar label="Structural" value={product.structural_score} color="#8B5CF6" />
              <ScoreBar label="Durability" value={product.durability_score} color="#F59E0B" />
            </>
          ) : (
            <>
              <ScoreBar label="Demand"     value={product.demand_score}     color="#3B82F6" />
              <ScoreBar label="Validation" value={product.validation_score} color="#10B981" />
              <ScoreBar label="Structural" value={product.structural_score} color="#8B5CF6" />
              <ScoreBar label="Pricing"    value={product.pricing_score}    color="#F59E0B" />
            </>
          )}
        </div>

        {/* Footer row: favourite + view listing */}
        <div className="flex items-center justify-between pt-1 mt-auto">
          <button
            onClick={() => onFavourite(product)}
            className="text-[11px] text-muted-foreground hover:text-amber-500 transition-colors flex items-center gap-1"
          >
            <Star className="w-3.5 h-3.5" />
            Save
          </button>
          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              View listing
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ClusterLegendPanel({
  legend,
}: {
  legend: Record<string, { name: string; description: string; color: string }>
}) {
  if (!legend || Object.keys(legend).length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-primary" />
        Cluster Guide
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(legend).map(([id, info]) => {
          const meta = CLUSTER_DISPLAY[info.name]
          const Icon = meta?.icon ?? BarChart2
          return (
            <div
              key={id}
              className="flex items-start gap-2.5 p-2.5 rounded-lg"
              style={{ backgroundColor: info.color ? `${info.color}12` : undefined }}
            >
              <div
                className="p-1.5 rounded-lg shrink-0 mt-0.5"
                style={{ backgroundColor: info.color ? `${info.color}25` : undefined }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: info.color || undefined }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: info.color || undefined }}>
                  {info.name}
                </p>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                  {meta?.tagline || info.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SearchContent() {
  useAuthGuard()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [platform, setPlatform] = useState<"amazon" | "aliexpress">(
    (searchParams.get("platform") as "amazon" | "aliexpress") || "aliexpress"
  )
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [isSearching, setIsSearching] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [error, setError] = useState("")
  const [currentResults, setCurrentResults] = useState<SearchResults | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [favouriteModal, setFavouriteModal] = useState(false)
  const [categories, setCategories] = useState<CategoryDef[]>([])
  const [selectedCategory, setSelectedCategory] = useState("uncategorized")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [savingFavourite, setSavingFavourite] = useState(false)

  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const executionArnRef = useRef<string | null>(null)

  // Cache per-platform results in memory
  const resultsCache = useRef<Record<string, SearchResults>>({})

  const products = currentResults?.products ?? []

  // Fetch categories for the modal
  useEffect(() => {
    apiFetch("/api/data/categories")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.categories) setCategories(data.categories.filter((c: CategoryDef) => c.id !== "uncategorized"))
      })
      .catch(() => {})
  }, [])

  // On mount: if q + platform params present, auto-search
  useEffect(() => {
    const fileKey = searchParams.get("file_key")
    const q = searchParams.get("q")
    const p = (searchParams.get("platform") as "amazon" | "aliexpress") || "aliexpress"

    if (fileKey && q) {
      loadFileByKey(fileKey, q, p)
    } else if (q) {
      handleSearch(q, p)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadFileByKey = async (fileKey: string, q: string, p: string) => {
    setIsSearching(true)
    setStatusMessage("Loading results...")
    setError("")
    try {
      const res = await apiFetch(
        `/api/data/scored/${p}/file?key=${encodeURIComponent(fileKey)}`
      )
      if (!res.ok) throw new Error("Failed to load file")
      const data = await res.json()
      processResults(data, q, p as "amazon" | "aliexpress")
    } catch {
      setError("Failed to load the requested file.")
    } finally {
      setIsSearching(false)
      setStatusMessage("")
    }
  }

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  const processResults = useCallback(
    (data: Record<string, unknown>, q: string, p: "amazon" | "aliexpress") => {
      const productsRaw = (data.products as ScoredProduct[]) || []

      // Build cluster legend from products
      const legend: SearchResults["clusterLegend"] = {}
      for (const prod of productsRaw) {
        if (prod.cluster != null && prod.cluster_name && !legend[prod.cluster]) {
          legend[prod.cluster] = {
            name: prod.cluster_name,
            description: prod.cluster_description || "",
            color: prod.cluster_color || "#888",
          }
        }
      }

      const results: SearchResults = {
        query: q,
        platform: p,
        products: productsRaw,
        clusterLegend: legend,
        cachedAt: data.cached_at as string | undefined,
      }
      const cacheKey = `${p}:${q.toLowerCase().trim()}`
      resultsCache.current[cacheKey] = results
      setCurrentResults(results)
      setIsSaved(false)
    },
    []
  )

  const pollStatus = useCallback(
    async (executionArn: string, q: string, p: "amazon" | "aliexpress") => {
      try {
        const res = await apiFetch("/api/data/search/status", {
          method: "POST",
          body: JSON.stringify({ execution_arn: executionArn }),
        })
        if (!res.ok) throw new Error("Status check failed")
        const data = await res.json()

        if (data.status === "SUCCEEDED") {
          stopPolling()
          setStatusMessage("Processing results...")
          const resultRes = await apiFetch(
            `/api/data/scored/${p}/latest?query_slug=${encodeURIComponent(q.replace(/ /g, "_").toLowerCase())}`
          )
          if (!resultRes.ok) throw new Error("Failed to fetch results")
          const resultData = await resultRes.json()
          processResults(resultData, q, p)
          setIsSearching(false)
          setStatusMessage("")
        } else if (data.status === "FAILED" || data.status === "TIMED_OUT") {
          stopPolling()
          setError(`Pipeline ${data.status.toLowerCase()}. Please try again.`)
          setIsSearching(false)
          setStatusMessage("")
        } else {
          setStatusMessage(`Running pipeline… (${data.status})`)
          pollingRef.current = setTimeout(() => pollStatus(executionArn, q, p), 4000)
        }
      } catch {
        stopPolling()
        setError("Lost contact with the pipeline. Please try again.")
        setIsSearching(false)
        setStatusMessage("")
      }
    },
    [stopPolling, processResults]
  )

  const handleSearch = useCallback(
    async (overrideQuery?: string, overridePlatform?: string) => {
      const q = (overrideQuery ?? query).trim()
      const p = (overridePlatform ?? platform) as "amazon" | "aliexpress"
      if (!q) return

      stopPolling()
      setError("")
      setCurrentResults(null)
      setIsSaved(false)

      // Check memory cache first
      const cacheKey = `${p}:${q.toLowerCase()}`
      if (resultsCache.current[cacheKey]) {
        setCurrentResults(resultsCache.current[cacheKey])
        return
      }

      setIsSearching(true)
      setStatusMessage("Checking cache...")

      try {
        const res = await apiFetch("/api/data/search", {
          method: "POST",
          body: JSON.stringify({ query: q, platform: p }),
        })
        if (!res.ok) throw new Error("Search request failed")
        const data = await res.json()

        if (data.cached && data.products) {
          processResults(data, q, p)
          setIsSearching(false)
          setStatusMessage("")
        } else if (data.execution_arn) {
          executionArnRef.current = data.execution_arn
          setStatusMessage("Pipeline started. Collecting products...")
          pollingRef.current = setTimeout(() => pollStatus(data.execution_arn, q, p), 5000)
        } else {
          throw new Error("Unexpected response from search endpoint")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed")
        setIsSearching(false)
        setStatusMessage("")
      }
    },
    [query, platform, stopPolling, processResults, pollStatus]
  )

  useEffect(() => () => stopPolling(), [stopPolling])

  const handleSaveSearch = () => {
    setFavouriteModal(true)
  }

  const handleConfirmSave = async () => {
    setSavingFavourite(true)
    try {
      let catId = selectedCategory

      // Create new category if typed
      if (newCategoryName.trim()) {
        const slug = newCategoryName.trim().toLowerCase().replace(/\s+/g, "_")
        await apiFetch("/api/data/categories", {
          method: "POST",
          body: JSON.stringify({ id: slug, label: newCategoryName.trim(), is_user_generated: true }),
        })
        catId = slug
      }

      await apiFetch(`/api/data/favourites/${platform}`, {
        method: "POST",
        body: JSON.stringify({
          query: currentResults?.query || query,
          category_id: catId,
          source: "manual",
        }),
      })
      setIsSaved(true)
    } catch {
      // silent
    } finally {
      setSavingFavourite(false)
      setFavouriteModal(false)
      setNewCategoryName("")
      setSelectedCategory("uncategorized")
    }
  }

  const getScoreLabel = (score: number) => {
    if (score >= 70) return { label: "Excellent", color: "#1D9E75" }
    if (score >= 50) return { label: "Good", color: "#3B82F6" }
    if (score >= 30) return { label: "Fair", color: "#EF9F27" }
    return { label: "Weak", color: "#EF4444" }
  }

  return (
    <main className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="ml-[240px] min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-5">
          {/* Header + search bar */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Product Search</h1>
              {/* Platform toggle */}
              <div className="flex bg-card rounded-full p-1 border border-border shadow-sm">
                {(["aliexpress", "amazon"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize",
                      platform === p
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {p === "aliexpress" ? "AliExpress" : "Amazon"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={`Search ${platform === "amazon" ? "Amazon" : "AliExpress"} products…`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="border border-border shadow-sm"
              />
              <Button onClick={() => handleSearch()} disabled={isSearching || !query.trim()}>
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span className="ml-1.5 hidden sm:inline">Search</span>
              </Button>
            </div>
          </div>

          {/* Status / error */}
          {statusMessage && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              {statusMessage}
            </div>
          )}
          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-4 py-3 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* Results header */}
          {currentResults && products.length > 0 && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{products.length}</span> products for{" "}
                  <span className="font-semibold text-foreground">&ldquo;{currentResults.query}&rdquo;</span>
                  {currentResults.cachedAt && (
                    <span className="ml-2 text-xs opacity-70">(cached)</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                {currentResults.cachedAt && (
                  <Button size="sm" variant="ghost" onClick={() => handleSearch()} className="text-xs gap-1">
                    <RefreshCw className="w-3 h-3" />
                    Use fresh data
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={isSaved ? "default" : "outline"}
                  onClick={handleSaveSearch}
                  disabled={isSaved}
                  className="flex items-center gap-1.5"
                >
                  <Star className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
                  {isSaved ? "Saved" : "Save search"}
                </Button>
              </div>
            </div>
          )}

          {/* Cluster legend — always visible when results present */}
          {currentResults && <ClusterLegendPanel legend={currentResults.clusterLegend} />}

          {/* Score scale explanation */}
          {currentResults && products.length > 0 && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="font-medium text-foreground">Opportunity Score:</span>
              {[{ range: "70–100", label: "Excellent", color: "#1D9E75" }, { range: "50–69", label: "Good", color: "#3B82F6" }, { range: "30–49", label: "Fair", color: "#EF9F27" }, { range: "0–29", label: "Weak", color: "#EF4444" }].map((s) => (
                <span key={s.label} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: s.color }} />
                  {s.range} = {s.label}
                </span>
              ))}
            </div>
          )}

          {/* Product grid */}
          {products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 animate-fade-in-up">
              {products.map((product, i) => {
                const id = product.product_id || product.asin || `${product.title}-${i}`
                return (
                  <ProductCard
                    key={id}
                    product={product}
                    platform={platform}
                    onFavourite={() => handleSaveSearch()}
                  />
                )
              })}
            </div>
          )}

          {/* Empty state */}
          {!isSearching && !statusMessage && products.length === 0 && !error && (
            <div className="text-center py-20 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-lg font-medium text-foreground">Search for products</p>
              <p className="text-sm mt-1">
                Enter a query above to find and score {platform === "amazon" ? "Amazon" : "AliExpress"} products
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save Search Modal */}
      {favouriteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl shadow-xl p-6 w-full max-w-sm animate-fade-in-up">
            <h2 className="text-lg font-bold mb-1">Save this search</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Assign &ldquo;{currentResults?.query || query}&rdquo; to a category so you can find it later.
            </p>

            <label className="text-xs font-medium text-muted-foreground block mb-1">Category</label>
            <select
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background mb-3"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="uncategorized">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>

            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Or create a new category
            </label>
            <Input
              placeholder="e.g. Sports & Outdoors"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="mb-4"
            />

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setFavouriteModal(false); setNewCategoryName("") }}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmSave}
                disabled={savingFavourite}
              >
                {savingFavourite ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  )
}
