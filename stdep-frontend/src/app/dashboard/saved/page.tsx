"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { apiFetch } from "@/lib/api"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Bookmark,
  Trash2,
  ExternalLink,
  Calculator,
  Package,
  Loader2,
  Star,
} from "lucide-react"

type Scores = {
  opportunity_score?: number | null
  demand_score?: number | null
  structural_score?: number | null
  pricing_score?: number | null
  durability_score?: number | null
  confidence_score?: number | null
  validation_score?: number | null
  avg_sentiment_score?: number | null
  star_rating?: number | null
  rating?: number | null
  reviews_count?: number | null
  sales_count?: number | null
  discount_percent?: number | null
  is_prime_eligible?: boolean | null
  has_videos?: boolean | null
  brand?: string | null
  cluster_name?: string | null
  cluster_description?: string | null
  cluster_color?: string | null
  original_price?: number | null
}

type Product = {
  id: string
  product_name: string
  platform: string
  price: number | null
  currency: string | null
  category: string | null
  platform_url: string | null
  product_image_url: string | null
  cluster_id: number | null
  scores: Scores | null
  created_at: string
}

const SCORE_COMPONENTS = [
  { key: "demand_score", label: "Demand", color: "#3B82F6" },
  { key: "structural_score", label: "Structural", color: "#8B5CF6" },
  { key: "pricing_score", label: "Pricing", color: "#10B981" },
  { key: "durability_score", label: "Durability", color: "#F59E0B" },
  { key: "validation_score", label: "Validation", color: "#EC4899" },
]

function ScoreBar({ value, color, label }: { value?: number | null; color: string; label: string }) {
  if (value == null) return null
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-medium w-7 text-right" style={{ color }}>{pct}</span>
    </div>
  )
}

function OpportunityBadge({ score }: { score: number }) {
  const color = score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-blue-500" : score >= 30 ? "bg-amber-500" : "bg-red-500"
  const label = score >= 70 ? "Strong" : score >= 50 ? "Moderate" : score >= 30 ? "Weak" : "Poor"
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("text-xs font-bold text-white px-2 py-0.5 rounded", color)}>{score.toFixed(0)}</div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}

export default function SavedPage() {
  useAuthGuard()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [platformFilter, setPlatformFilter] = useState<"all" | "amazon" | "aliexpress">("all")

  useEffect(() => {
    apiFetch("/api/saved-products")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (productId: string) => {
    setDeletingId(productId)
    try {
      const res = await apiFetch(`/api/saved-products/${productId}`, { method: "DELETE" })
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId))
      }
    } catch {}
    setDeletingId(null)
  }

  const handleUseInCalculator = (product: Product) => {
    // Navigate to calculator — the calculator page will load saved products and the user can select
    router.push("/dashboard/calculator")
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.product_name.toLowerCase().includes(filter.toLowerCase())
    const matchesPlatform = platformFilter === "all" || p.platform === platformFilter
    return matchesSearch && matchesPlatform
  })

  return (
    <main className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="ml-[240px] min-h-screen p-6 animate-fade-in-up">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 p-2 rounded-xl">
                <Bookmark className="text-primary w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Saved Products</h1>
                <p className="text-sm text-muted-foreground">
                  Products you&apos;ve bookmarked from search results · {products.length} total
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.push("/dashboard/calculator")}>
              <Calculator className="w-4 h-4" />
              Open Calculator
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-6">
            <Input
              placeholder="Filter by name..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-xs"
            />
            <div className="flex bg-card rounded-full p-1 border border-border shadow-sm">
              {(["all", "aliexpress", "amazon"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    platformFilter === p
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p === "all" ? "All" : p === "aliexpress" ? "AliExpress" : "Amazon"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card className="border border-border">
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {products.length === 0
                    ? "No saved products yet. Use the bookmark icon on search results to save products here."
                    : "No products match your filter."}
                </p>
                {products.length === 0 && (
                  <Button className="mt-4" onClick={() => router.push("/dashboard/search")}>
                    Go to Search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProducts.map((product) => {
                let imageUrl = product.product_image_url || ""
                if (imageUrl.startsWith("//")) imageUrl = "https:" + imageUrl
                const isDeleting = deletingId === product.id
                const s = product.scores
                const rating = s?.star_rating ?? s?.rating ?? null
                const opportunityScore = s?.opportunity_score ?? null

                return (
                  <Card key={product.id} className="border border-border shadow-sm hover:shadow-md transition-all group">
                    <CardContent className="p-3 relative">
                      {/* Image */}
                      {imageUrl ? (
                        <div className="aspect-square mb-2 rounded overflow-hidden bg-muted">
                          <img
                            src={imageUrl}
                            alt={product.product_name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                          />
                        </div>
                      ) : (
                        <div className="aspect-square mb-2 rounded bg-muted flex items-center justify-center">
                          <Package className="w-10 h-10 text-muted-foreground/20" />
                        </div>
                      )}

                      {/* Title */}
                      <p className="text-sm font-medium line-clamp-2 mb-2">{product.product_name}</p>

                      {/* Brand */}
                      {s?.brand && <p className="text-xs text-muted-foreground mb-1.5">{s.brand}</p>}

                      {/* Price + Opportunity Score */}
                      <div className="flex items-center justify-between mb-2">
                        {product.price != null && (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-semibold">{product.currency || "$"}{product.price.toFixed(2)}</span>
                            {s?.discount_percent != null && s.discount_percent > 0 && (
                              <span className="text-[10px] font-medium text-green-600 dark:text-green-400">-{s.discount_percent.toFixed(0)}%</span>
                            )}
                          </div>
                        )}
                        {opportunityScore != null && <OpportunityBadge score={opportunityScore} />}
                      </div>

                      {/* Stats badges */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-medium">
                          {product.platform === "aliexpress" ? "AliExpress" : "Amazon"}
                        </span>
                        {rating != null && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted flex items-center gap-0.5" title="Customer rating">
                            <Star className="w-2.5 h-2.5 fill-amber-400 stroke-amber-400" />{rating.toFixed(1)}
                          </span>
                        )}
                        {s?.reviews_count != null && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted" title="Total reviews">{s.reviews_count.toLocaleString()} reviews</span>
                        )}
                        {s?.sales_count != null && (
                          <span className="text-xs px-2 py-0.5 rounded bg-muted" title="Units sold">{s.sales_count.toLocaleString()} sold</span>
                        )}
                        {s?.is_prime_eligible && (
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" title="Amazon Prime eligible">Prime</span>
                        )}
                      </div>

                      {/* Score bars */}
                      {s && (
                        <div className="space-y-0.5 mb-2">
                          {SCORE_COMPONENTS.map((c) => (
                            <ScoreBar key={c.key} value={(s as Record<string, number | undefined | null>)[c.key]} color={c.color} label={c.label} />
                          ))}
                        </div>
                      )}

                      {/* Cluster badge */}
                      {s?.cluster_name && (
                        <span className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded mb-2"
                          style={{ backgroundColor: s.cluster_color ? `${s.cluster_color}20` : undefined, color: s.cluster_color || undefined }}
                          title={s.cluster_description || ""}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.cluster_color || undefined }} />
                          {s.cluster_name}
                        </span>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-border">
                        {product.platform_url && (
                          <a
                            href={product.platform_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 flex-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View listing
                          </a>
                        )}
                        <button
                          onClick={() => handleUseInCalculator(product)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Use in Margin Calculator"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          title="Remove from saved"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
