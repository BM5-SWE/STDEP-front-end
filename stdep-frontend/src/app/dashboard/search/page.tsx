"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { apiFetch } from "@/lib/api"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Star, RefreshCw, Loader2, ExternalLink } from "lucide-react"

type ScoredProduct = {
  // Common
  title: string
  opportunity_score: number
  demand_score?: number
  structural_score?: number
  pricing_score?: number
  confidence_score?: number

  // AliExpress specific
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

  // Amazon specific
  asin?: string
  url?: string
  brand?: string
  price?: number
  price_buybox?: number
  currency?: string
  rating?: number
  reviews_count?: number
  avg_sentiment_score?: number
  mean_sample_rating?: number
  sales_volume?: string
  num_images?: number
  num_variations?: number
  is_prime_eligible?: boolean
  has_videos?: boolean
  verified_review_share?: number
  validation_score?: number
}

type SearchState =
  | { step: "idle" }
  | { step: "checking_cache" }
  | { step: "cached"; data: any; key: string }
  | { step: "running"; executionArn: string }
  | { step: "polling"; executionArn: string }
  | { step: "completed"; data: any; key: string }
  | { step: "failed"; error: string }

type CategoryDef = {
  id: string
  label: string
}

function SearchPageContent() {
  useAuthGuard()
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialQuery = searchParams.get("q") || ""
  const initialPlatform = (searchParams.get("platform") as "amazon" | "aliexpress") || "aliexpress"
  const presetCategory = searchParams.get("category") || null

  const [query, setQuery] = useState(initialQuery)
  const [platform, setPlatform] = useState<"amazon" | "aliexpress">(initialPlatform)
  const [state, setState] = useState<SearchState>({ step: "idle" })
  const [products, setProducts] = useState<ScoredProduct[]>([])
  const [clusterLegend, setClusterLegend] = useState<Record<string, any>>({})
  const [categories, setCategories] = useState<CategoryDef[]>([])
  const [favouriteModal, setFavouriteModal] = useState<ScoredProduct | null>(null)
  const [selectedCategory, setSelectedCategory] = useState(presetCategory || "uncategorized")
  const [favourited, setFavourited] = useState<Set<string>>(new Set())

  // Load categories for favourite modal
  useEffect(() => {
    apiFetch("/api/data/categories")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.categories) setCategories(data.categories)
      })
      .catch(() => {})
  }, [])

  const doSearch = useCallback(
    async (searchQuery: string, searchPlatform: string, forceFresh = false) => {
      if (!searchQuery.trim()) return

      setState({ step: "checking_cache" })
      setProducts([])

      try {
        // If force fresh, skip cache check — trigger pipeline directly
        if (forceFresh) {
          const res = await apiFetch("/api/data/search", {
            method: "POST",
            body: JSON.stringify({
              query: searchQuery,
              platform: searchPlatform,
            }),
          })
          const data = await res.json()

          if (data.status === "cached") {
            setProducts(data.data?.products || [])
            setClusterLegend(data.data?.cluster_legend || {})
            setState({ step: "cached", data: data.data, key: data.key })
            return
          }

          if (data.status === "started") {
            setState({ step: "running", executionArn: data.execution_arn })
            pollStatus(data.execution_arn, searchQuery, searchPlatform)
            return
          }

          setState({ step: "failed", error: data.detail || "Search failed" })
          return
        }

        // Normal flow: try cache first via the search endpoint
        const res = await apiFetch("/api/data/search", {
          method: "POST",
          body: JSON.stringify({
            query: searchQuery,
            platform: searchPlatform,
          }),
        })
        const data = await res.json()

        if (data.status === "cached") {
          setProducts(data.data?.products || [])
          setClusterLegend(data.data?.cluster_legend || {})
          setState({ step: "cached", data: data.data, key: data.key })
        } else if (data.status === "started") {
          setState({ step: "running", executionArn: data.execution_arn })
          pollStatus(data.execution_arn, searchQuery, searchPlatform)
        } else {
          setState({ step: "failed", error: data.detail || "Search failed" })
        }
      } catch (err) {
        setState({
          step: "failed",
          error: err instanceof Error ? err.message : "Network error",
        })
      }
    },
    []
  )

  const pollStatus = useCallback(
    async (arn: string, q: string, p: string) => {
      setState({ step: "polling", executionArn: arn })

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
            setProducts(data.data.products || [])
            setClusterLegend(data.data.cluster_legend || {})
            setState({ step: "completed", data: data.data, key: data.key })
          } else if (data.status === "failed") {
            setState({ step: "failed", error: data.error || "Pipeline failed" })
          } else {
            // Still running — poll again in 3 seconds
            setTimeout(poll, 3000)
          }
        } catch {
          setTimeout(poll, 5000)
        }
      }

      poll()
    },
    []
  )

  // Auto-search if query param present
  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery, initialPlatform)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    if (!query.trim()) return
    // Update URL
    router.replace(
      `/dashboard/search?q=${encodeURIComponent(query.trim())}&platform=${platform}`
    )
    doSearch(query.trim(), platform)
  }

  const handleFavourite = async (product: ScoredProduct) => {
    if (presetCategory) {
      // Category already known from browse flow
      await saveFavourite(presetCategory, "suggested")
      const id = product.product_id || product.asin || product.title
      setFavourited((prev) => new Set(prev).add(id))
    } else {
      setFavouriteModal(product)
    }
  }

  const saveFavourite = async (categoryId: string, source: string) => {
    try {
      await apiFetch(`/api/data/favourites/${platform}`, {
        method: "POST",
        body: JSON.stringify({
          category_id: categoryId,
          query: query,
          source,
        }),
      })
    } catch {}
    setFavouriteModal(null)
  }

  const getPrice = (p: ScoredProduct) =>
    p.effective_price ?? p.sale_price ?? p.price ?? p.price_buybox ?? null

  const getRating = (p: ScoredProduct) => p.star_rating ?? p.rating ?? null

  const isRunning =
    state.step === "checking_cache" ||
    state.step === "running" ||
    state.step === "polling"

  return (
    <main className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="ml-[240px] min-h-screen p-4 pl-0">
        <div className="flex flex-col gap-4 max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="flex gap-2 animate-fade-in-up">
            <div className="flex bg-card rounded-full p-1 border border-border shadow-sm">
              <button
                onClick={() => setPlatform("aliexpress")}
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
                onClick={() => setPlatform("amazon")}
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
              disabled={isRunning}
            />
            <Button onClick={handleSearch} disabled={isRunning}>
              {isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Status Messages */}
          {state.step === "checking_cache" && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking for cached results...
            </div>
          )}
          {(state.step === "running" || state.step === "polling") && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Pipeline is running — this may take 30-60 seconds...
            </div>
          )}
          {state.step === "cached" && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">
                Showing cached results ({products.length} products)
              </span>
              <button
                onClick={() => doSearch(query, platform, true)}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Use fresh data
              </button>
            </div>
          )}
          {state.step === "completed" && (
            <div className="text-sm text-muted-foreground">
              Pipeline completed — {products.length} products scored
            </div>
          )}
          {state.step === "failed" && (
            <div className="text-sm text-destructive">
              Error: {(state as any).error}
            </div>
          )}

          {/* Results */}
          {products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 animate-fade-in-up">
              {products.map((product, i) => {
                const price = getPrice(product)
                const rating = getRating(product)
                const id = product.product_id || product.asin || product.title
                const isFav = favourited.has(id)

                return (
                  <Card
                    key={id || i}
                    className="border border-border shadow-sm hover:shadow-md transition-all"
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
                        <p className="text-xs text-muted-foreground mb-1">
                          {product.brand}
                        </p>
                      )}

                      <div className="flex items-center justify-between mb-2">
                        {price != null && (
                          <span className="text-sm font-semibold">
                            {product.currency || "$"}
                            {price.toFixed(2)}
                          </span>
                        )}
                        <span className="text-xs font-medium bg-foreground text-background px-2 py-0.5 rounded">
                          Score: {product.opportunity_score}
                        </span>
                      </div>

                      {/* Platform-specific details */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {rating != null && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted">
                            ★ {rating.toFixed(1)}
                          </span>
                        )}
                        {product.reviews_count != null && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted">
                            {product.reviews_count.toLocaleString()} reviews
                          </span>
                        )}
                        {product.sales_count != null && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted">
                            {product.sales_count.toLocaleString()} sold
                          </span>
                        )}
                        {product.is_prime_eligible && (
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            Prime
                          </span>
                        )}
                        {product.discount_percent != null &&
                          product.discount_percent > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                              -{product.discount_percent.toFixed(0)}%
                            </span>
                          )}
                      </div>

                      {/* Cluster badge */}
                      {product.cluster_name && (
                        <span
                          className="text-xs inline-block px-2 py-0.5 rounded mb-2"
                          style={{
                            backgroundColor: product.cluster_color
                              ? `${product.cluster_color}20`
                              : undefined,
                            color: product.cluster_color || undefined,
                          }}
                        >
                          {product.cluster_name}
                        </span>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => handleFavourite(product)}
                          className={cn(
                            "p-1.5 rounded hover:bg-muted transition-colors",
                            isFav ? "text-yellow-500" : "text-muted-foreground"
                          )}
                          title="Add to favourites"
                        >
                          <Star
                            className="w-4 h-4"
                            fill={isFav ? "currentColor" : "none"}
                          />
                        </button>
                        {product.url && (
                          <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                            title="View on Amazon"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Favourite Category Modal */}
        {favouriteModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-lg p-6 min-w-[340px] max-w-[90vw] animate-fade-in-up">
              <h2 className="text-lg font-bold mb-3">Add to a category?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Choose a category for this search or skip to leave uncategorized.
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
                <Button onClick={() => saveFavourite(selectedCategory, "manual")}>
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => saveFavourite("uncategorized", "manual")}
                >
                  Skip
                </Button>
                <Button variant="ghost" onClick={() => setFavouriteModal(null)}>
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
