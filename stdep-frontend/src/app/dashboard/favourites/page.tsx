"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { apiFetch } from "@/lib/api"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Star,
  ChevronDown,
  ChevronRight,
  Search,
  Trash2,
  RefreshCw,
} from "lucide-react"

type Favourite = {
  category_id: string
  query: string
  source: string
  added_at: string
  is_favourite: boolean
}

type CategoryDef = {
  id: string
  label: string
}

type ScoredFile = {
  key: string
  date: string
  filename: string
}

export default function FavouritesPage() {
  useAuthGuard()
  const router = useRouter()
  const [platform, setPlatform] = useState<"amazon" | "aliexpress">("aliexpress")
  const [favourites, setFavourites] = useState<Favourite[]>([])
  const [categories, setCategories] = useState<CategoryDef[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [expandedQuery, setExpandedQuery] = useState<string | null>(null)
  const [queryFiles, setQueryFiles] = useState<ScoredFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      apiFetch(`/api/data/favourites/${platform}`).then((r) =>
        r.ok ? r.json() : { favourites: [] }
      ),
      apiFetch("/api/data/categories").then((r) =>
        r.ok ? r.json() : { categories: [] }
      ),
    ])
      .then(([favData, catData]) => {
        setFavourites(favData.favourites || [])
        setCategories(catData.categories || [])
      })
      .finally(() => setLoading(false))
  }, [platform])

  // Group favourites by category
  const grouped = favourites
    .filter((f) => f.is_favourite)
    .reduce(
      (acc, f) => {
        const cat = f.category_id || "uncategorized"
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(f)
        return acc
      },
      {} as Record<string, Favourite[]>
    )

  const getCategoryLabel = (id: string) =>
    categories.find((c) => c.id === id)?.label || id

  const loadHistory = async (queryText: string) => {
    if (expandedQuery === queryText) {
      setExpandedQuery(null)
      return
    }
    setExpandedQuery(queryText)
    setLoadingFiles(true)
    try {
      const slug = queryText.replace(/ /g, "_").toLowerCase()
      const res = await apiFetch(
        `/api/data/scored/${platform}?query_slug=${encodeURIComponent(slug)}`
      )
      if (res.ok) {
        const data = await res.json()
        setQueryFiles(data.files || [])
      }
    } catch {
      setQueryFiles([])
    } finally {
      setLoadingFiles(false)
    }
  }

  const handleRemoveFavourite = async (queryText: string) => {
    try {
      await apiFetch(
        `/api/data/favourites/${platform}/${encodeURIComponent(queryText)}`,
        { method: "DELETE" }
      )
      setFavourites((prev) =>
        prev.filter((f) => f.query.toLowerCase() !== queryText.toLowerCase())
      )
    } catch {}
  }

  const handleRerun = (queryText: string) => {
    router.push(
      `/dashboard/search?q=${encodeURIComponent(queryText)}&platform=${platform}`
    )
  }

  const handleViewFile = (key: string) => {
    router.push(
      `/dashboard/search?q=${encodeURIComponent(expandedQuery || "")}&platform=${platform}&file_key=${encodeURIComponent(key)}`
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="ml-[240px] min-h-screen p-6 pl-0 animate-fade-in-up">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 p-2 rounded-xl">
                <Star className="text-primary w-6 h-6" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">Favourites</h1>
            </div>
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
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading favourites...</p>
          ) : Object.keys(grouped).length === 0 ? (
            <Card className="border border-border">
              <CardContent className="py-12 text-center">
                <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No favourites yet. Search for products and click the star icon
                  to save them here.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => router.push("/dashboard/search")}
                >
                  Go to Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {Object.entries(grouped)
                .sort(([a], [b]) => {
                  if (a === "uncategorized") return 1
                  if (b === "uncategorized") return -1
                  return getCategoryLabel(a).localeCompare(getCategoryLabel(b))
                })
                .map(([catId, items]) => (
                  <Card key={catId} className="border border-border shadow-sm">
                    <CardHeader className="pb-0">
                      <button
                        onClick={() =>
                          setExpandedCategory(
                            expandedCategory === catId ? null : catId
                          )
                        }
                        className="flex items-center gap-2 w-full text-left"
                      >
                        {expandedCategory === catId ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <CardTitle className="text-base font-semibold">
                          {getCategoryLabel(catId)}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {items.length} {items.length === 1 ? "query" : "queries"}
                        </span>
                      </button>
                    </CardHeader>
                    {expandedCategory === catId && (
                      <CardContent className="pt-3">
                        <div className="space-y-2">
                          {items.map((fav) => (
                            <div key={fav.query}>
                              <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted/50">
                                <button
                                  onClick={() => loadHistory(fav.query)}
                                  className="flex-1 text-left text-sm font-medium"
                                >
                                  {fav.query}
                                </button>
                                <span className="text-xs text-muted-foreground">
                                  {fav.source === "suggested"
                                    ? "from category"
                                    : "manual"}
                                </span>
                                <button
                                  onClick={() => handleRerun(fav.query)}
                                  className="p-1 rounded hover:bg-muted text-muted-foreground"
                                  title="Search again"
                                >
                                  <Search className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleRemoveFavourite(fav.query)
                                  }
                                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                  title="Remove"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Historical files for this query */}
                              {expandedQuery === fav.query && (
                                <div className="ml-6 mt-1 mb-2 p-3 rounded-lg bg-muted/30 border border-border">
                                  {loadingFiles ? (
                                    <p className="text-xs text-muted-foreground">
                                      Loading history...
                                    </p>
                                  ) : queryFiles.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">
                                      No historical data found.
                                    </p>
                                  ) : (
                                    <div className="space-y-1">
                                      <p className="text-xs font-medium text-muted-foreground mb-2">
                                        {queryFiles.length} results found
                                      </p>
                                      {queryFiles.map((file) => (
                                        <button
                                          key={file.key}
                                          onClick={() =>
                                            handleViewFile(file.key)
                                          }
                                          className="flex items-center gap-2 w-full text-left text-xs py-1.5 px-2 rounded hover:bg-muted"
                                        >
                                          <span className="font-medium">
                                            {file.date}
                                          </span>
                                          <span className="text-muted-foreground truncate">
                                            {file.filename}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-2"
                                    onClick={() => handleRerun(fav.query)}
                                  >
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    Run fresh search
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
