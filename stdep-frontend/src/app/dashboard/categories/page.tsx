"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { apiFetch } from "@/lib/api"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search,
  Layers,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
  Check,
  X,
  Star,
} from "lucide-react"

type CategoryDef = {
  id: string
  label: string
  is_user_generated: boolean
  suggested_items: string[]
}

type Favourite = {
  category_id: string
  query: string
  source: string
  added_at: string
  is_favourite: boolean
}

function CategoriesContent() {
  useAuthGuard()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [categories, setCategories] = useState<CategoryDef[]>([])
  const [favouritesAlix, setFavouritesAlix] = useState<Favourite[]>([])
  const [favouritesAmz, setFavouritesAmz] = useState<Favourite[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(
    searchParams.get("id") || null
  )

  const [showNewForm, setShowNewForm] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [newItems, setNewItems] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      apiFetch("/api/data/categories").then((r) => r.ok ? r.json() : { categories: [] }),
      apiFetch("/api/data/favourites/aliexpress").then((r) => r.ok ? r.json() : { favourites: [] }),
      apiFetch("/api/data/favourites/amazon").then((r) => r.ok ? r.json() : { favourites: [] }),
    ])
      .then(([catData, favAlixData, favAmzData]) => {
        setCategories(catData.categories || [])
        setFavouritesAlix(favAlixData.favourites || [])
        setFavouritesAmz(favAmzData.favourites || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const getMergedItems = (cat: CategoryDef): { item: string; isFavourited: boolean }[] => {
    const allFavs = [...favouritesAlix, ...favouritesAmz]
    const favQueries = allFavs
      .filter((f) => f.is_favourite && f.category_id === cat.id)
      .map((f) => f.query)

    const seen = new Set<string>()
    const result: { item: string; isFavourited: boolean }[] = []

    for (const item of cat.suggested_items) {
      const key = item.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        const isFav = favQueries.some((q) => q.toLowerCase() === key)
        result.push({ item, isFavourited: isFav })
      }
    }

    for (const q of favQueries) {
      const key = q.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        result.push({ item: q, isFavourited: true })
      }
    }

    return result
  }

  const handleSuggestedClick = (catId: string, item: string) => {
    router.push(
      `/dashboard/search?q=${encodeURIComponent(item)}&platform=aliexpress&category=${encodeURIComponent(catId)}`
    )
  }

  const handleCreateCategory = async () => {
    const label = newLabel.trim()
    if (!label) {
      setCreateError("Category name is required.")
      return
    }
    setCreating(true)
    setCreateError("")
    try {
      const id = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
      const suggestedItems = newItems
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

      const res = await apiFetch("/api/data/categories", {
        method: "POST",
        body: JSON.stringify({
          id,
          label,
          is_user_generated: true,
          suggested_items: suggestedItems,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setCreateError(data.detail || "Failed to create category.")
        return
      }
      const newCat: CategoryDef = {
        id,
        label,
        is_user_generated: true,
        suggested_items: suggestedItems,
      }
      setCategories((prev) => [...prev, newCat])
      setNewLabel("")
      setNewItems("")
      setShowNewForm(false)
      setExpandedId(id)
    } catch {
      setCreateError("Network error. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteCategory = async (catId: string) => {
    if (!window.confirm("Delete this category? Its saved searches will move to Uncategorized.")) return
    setDeletingId(catId)
    try {
      await apiFetch(`/api/data/categories/${catId}`, { method: "DELETE" })
      setCategories((prev) => prev.filter((c) => c.id !== catId))
      if (expandedId === catId) setExpandedId(null)
    } catch {
    } finally {
      setDeletingId(null)
    }
  }

  const systemCats = categories.filter((c) => !c.is_user_generated && c.id !== "uncategorized")
  const userCats = categories.filter((c) => c.is_user_generated)

  return (
    <main className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="ml-[240px] min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 p-2 rounded-xl">
                <Layers className="text-primary w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
                <p className="text-sm text-muted-foreground">Browse suggested items or manage your own categories</p>
              </div>
            </div>
            <Button
              onClick={() => setShowNewForm((v) => !v)}
              variant={showNewForm ? "outline" : "default"}
              size="sm"
              className="gap-1.5"
            >
              {showNewForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showNewForm ? "Cancel" : "New Category"}
            </Button>
          </div>

          {showNewForm && (
            <Card className="border border-primary/30 shadow-sm mb-6 animate-fade-in-up">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Create New Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Sports & Outdoors"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Suggested search items <span className="text-muted-foreground font-normal">(comma-separated, optional)</span>
                  </label>
                  <Input
                    placeholder="e.g. yoga mat, resistance bands, water bottle"
                    value={newItems}
                    onChange={(e) => setNewItems(e.target.value)}
                  />
                </div>
                {createError && (
                  <p className="text-xs text-red-500">{createError}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setShowNewForm(false); setNewLabel(""); setNewItems(""); setCreateError("") }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleCreateCategory} disabled={creating} className="gap-1.5">
                    {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Create Category
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {systemCats.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    System Categories
                  </h2>
                  <div className="space-y-2">
                    {systemCats.map((cat) => {
                      const mergedItems = getMergedItems(cat)
                      return (
                        <CategoryCard
                          key={cat.id}
                          cat={cat}
                          mergedItems={mergedItems}
                          expanded={expandedId === cat.id}
                          onToggle={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
                          onItemClick={handleSuggestedClick}
                          onDelete={null}
                          deleting={false}
                        />
                      )
                    })}
                  </div>
                </section>
              )}

              {userCats.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    My Categories
                  </h2>
                  <div className="space-y-2">
                    {userCats.map((cat) => {
                      const mergedItems = getMergedItems(cat)
                      return (
                        <CategoryCard
                          key={cat.id}
                          cat={cat}
                          mergedItems={mergedItems}
                          expanded={expandedId === cat.id}
                          onToggle={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
                          onItemClick={handleSuggestedClick}
                          onDelete={handleDeleteCategory}
                          deleting={deletingId === cat.id}
                        />
                      )
                    })}
                  </div>
                </section>
              )}

              {categories.filter((c) => c.id !== "uncategorized").length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-base font-medium text-foreground">No categories yet</p>
                  <p className="text-sm mt-1">Create your first category to organise your searches.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function CategoryCard({
  cat,
  mergedItems,
  expanded,
  onToggle,
  onItemClick,
  onDelete,
  deleting,
}: {
  cat: CategoryDef
  mergedItems: { item: string; isFavourited: boolean }[]
  expanded: boolean
  onToggle: () => void
  onItemClick: (catId: string, item: string) => void
  onDelete: ((id: string) => void) | null
  deleting: boolean
}) {
  return (
    <Card className="border border-border shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">{cat.label}</span>
            {cat.is_user_generated && (
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                Custom
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {mergedItems.length} suggested item{mergedItems.length !== 1 ? "s" : ""}
            {mergedItems.some((m) => m.isFavourited) && (
              <span className="ml-1">
                · {mergedItems.filter((m) => m.isFavourited).length} favourited
              </span>
            )}
          </p>
        </div>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(cat.id) }}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors"
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border">
          {mergedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No suggested items yet.{cat.is_user_generated ? " Save searches to this category and they'll appear here." : ""}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {mergedItems.map(({ item, isFavourited }) => (
                <button
                  key={item}
                  onClick={() => onItemClick(cat.id, item)}
                  className={cn(
                    "text-sm px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5",
                    isFavourited
                      ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      : "border-border hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  )}
                >
                  {isFavourited ? (
                    <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                  ) : (
                    <Search className="w-3 h-3" />
                  )}
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default function CategoriesPage() {
  return (
    <Suspense>
      <CategoriesContent />
    </Suspense>
  )
}
