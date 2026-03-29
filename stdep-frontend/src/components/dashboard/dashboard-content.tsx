"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { apiFetch } from "@/lib/api"
import { useRouter } from "next/navigation"
import {
  Star,
  Search,
  Calculator,
  History,
  Layers,
  ExternalLink,
  TrendingUp,
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

export function DashboardContent() {
  useAuthGuard()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [categories, setCategories] = useState<CategoryDef[]>([])
  const [recentQueries, setRecentQueries] = useState<QueryRecord[]>([])
  const [loadingTop, setLoadingTop] = useState(true)
  const [loadingCats, setLoadingCats] = useState(true)

  // Fetch weekly top 50
  useEffect(() => {
    apiFetch("/api/data/weekly-top")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.products) {
          setTopProducts(data.products.slice(0, 50))
        } else if (Array.isArray(data)) {
          setTopProducts(data.slice(0, 50))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTop(false))
  }, [])

  // Fetch categories
  useEffect(() => {
    apiFetch("/api/data/categories")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.categories) {
          setCategories(
            data.categories.filter((c: CategoryDef) => c.id !== "uncategorized")
          )
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCats(false))
  }, [])

  // Fetch recent queries
  useEffect(() => {
    apiFetch("/api/query-history?limit=5")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setRecentQueries(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => {})
  }, [])

  const handleSearch = (platform: "amazon" | "aliexpress") => {
    if (!query.trim()) return
    router.push(
      `/dashboard/search?q=${encodeURIComponent(query.trim())}&platform=${platform}`
    )
  }

  const getPrice = (p: TopProduct) =>
    p.effective_price ?? p.sale_price ?? p.price ?? null

  return (
    <div className="ml-[240px] min-h-screen p-4 pl-0">
      <div className="flex flex-col gap-6">

        {/* Search Bar */}
        <div className="flex justify-center animate-fade-in-up">
          <div className="flex gap-2 w-full max-w-2xl">
            <Input
              type="text"
              placeholder="Search for products (e.g. water bottle, gaming mouse...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch("aliexpress")
              }}
              className="border border-border shadow-sm"
            />
            <Button
              onClick={() => handleSearch("aliexpress")}
              className="whitespace-nowrap"
            >
              AliExpress
            </Button>
            <Button
              onClick={() => handleSearch("amazon")}
              variant="outline"
              className="whitespace-nowrap"
            >
              Amazon
            </Button>
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-4 gap-3 animate-fade-in-up">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col gap-1"
            onClick={() => router.push("/dashboard/search?platform=aliexpress")}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs">Search AliExpress</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col gap-1"
            onClick={() => router.push("/dashboard/search?platform=amazon")}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs">Search Amazon</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col gap-1"
            onClick={() => router.push("/dashboard/calculator")}
          >
            <Calculator className="w-5 h-5" />
            <span className="text-xs">Margin Calculator</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col gap-1"
            onClick={() => router.push("/dashboard/categories")}
          >
            <Layers className="w-5 h-5" />
            <span className="text-xs">Browse Categories</span>
          </Button>
        </div>

        {/* Recent Queries */}
        {recentQueries.length > 0 && (
          <Card className="border border-border shadow-sm animate-fade-in-up">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <History className="w-5 h-5" /> Recent Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recentQueries.map((q) => (
                  <button
                    key={q.id}
                    onClick={() =>
                      router.push(
                        `/dashboard/search?q=${encodeURIComponent(q.query_text)}&platform=${q.platform}`
                      )
                    }
                    className="text-sm px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors"
                  >
                    {q.query_text}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({q.platform})
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trending on AliExpress */}
        <Card className="border border-border shadow-sm animate-fade-in-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Trending on AliExpress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTop ? (
              <p className="text-muted-foreground text-sm">Loading trending products...</p>
            ) : topProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No trending data available yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {topProducts.slice(0, 20).map((product, i) => {
                  const price = getPrice(product)
                  return (
                    <div
                      key={product.product_id || product.asin || i}
                      className="border rounded-lg p-3 hover:shadow-md transition-all bg-background/80"
                    >
                      {product.main_image_url && (
                        <div className="aspect-square mb-2 rounded overflow-hidden bg-muted">
                          <img
                            src={product.main_image_url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <p className="text-sm font-medium line-clamp-2 mb-1">
                        {product.title}
                      </p>
                      <div className="flex items-center justify-between">
                        {price != null && (
                          <span className="text-sm font-semibold">
                            ${price.toFixed(2)}
                          </span>
                        )}
                        <span className="text-xs font-medium bg-foreground text-background px-2 py-0.5 rounded">
                          {product.opportunity_score}
                        </span>
                      </div>
                      {product.cluster_name && (
                        <span
                          className="text-xs mt-1 inline-block px-2 py-0.5 rounded"
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
                    </div>
                  )
                })}
              </div>
            )}
            {topProducts.length > 20 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  Show all {topProducts.length} products
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Browse Categories Preview */}
        <Card className="border border-border shadow-sm animate-fade-in-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Layers className="w-5 h-5" /> Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCats ? (
              <p className="text-muted-foreground text-sm">Loading categories...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.slice(0, 8).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      router.push(`/dashboard/categories?open=${cat.id}`)
                    }
                    className="border rounded-lg p-3 text-left hover:shadow-md transition-all hover:bg-muted/50"
                  >
                    <p className="text-sm font-medium">{cat.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cat.suggested_items.length} suggestions
                    </p>
                  </button>
                ))}
              </div>
            )}
            {categories.length > 8 && (
              <div className="mt-3 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard/categories")}
                >
                  View all {categories.length} categories
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
