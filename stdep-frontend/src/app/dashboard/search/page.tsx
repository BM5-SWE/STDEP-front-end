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

  // Per-platform result cache
  const [resultsByPlatform, setResultsByPlatform] = useState<
    Record<string, PlatformResults>
  >({})

  // Favourite state
  const [categories, setCategories] = useState<CategoryDef[]>([])
  const [favouriteModal, setFavouriteModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(
    presetCategory || "uncategorized"
  )
  const [isSaved, setIsSaved] = useState(false)

  const currentResults = resultsByPlatform[platform] || null

  // Load categories for favourite modal
  useEffect(() => {
    apiFetch("/api/data/categories")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.categories) setCategories(data.categories)
      })
      .catch(() => {})
  }, [])

  // Cleanup polling on unmount
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
            // Still running — poll again
            setStatusMessage("Pipeline is running — this may take 30-60 seconds...")
            pollRef.current = setTimeout(poll, 3000)
          }
        } catch {
          // Retry on network error
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

      // Stop any existing polling
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

  // Auto-search if query param present
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
    // Stop any active polling
    if (pollRef.current) {
      clearTimeout(pollRef.current)
      pollRef.current = null
    }
    setPlatform(newPlatform)
    setIsSearching(false)
    setStatusMessage("")
    setError("")
    setIsSaved(false)
    // Results for the new platform will be loaded from resultsByPlatform cache
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

  return (
    <main className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="ml-[240px] min-h-screen p-4 pl-0">
        <div className="flex flex-col gap-4 max-w-6xl mx-auto">
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

              {/* Save Search Button */}
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
          )}

          {/* Cluster Legend */}
          {currentResults?.clusterLegend &&
            Object.keys(currentResults.clusterLegend).length > 0 && (
              <div className="flex flex-wrap gap-2 animate-fade-in-up">
                {Object.entries(currentResults.clusterLegend).map(
                  ([id, info]: [string, any]) => (
                    <span
                      key={id}
                      className="text-xs px-2.5 py-1 rounded-full border"
                      style={{
                        borderColor: info.color || undefined,
                        color: info.color || undefined,
                      }}
                      title={info.description || ""}
                    >
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

          {/* Empty state when platform switched with no results */}
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
