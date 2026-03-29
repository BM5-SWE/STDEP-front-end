"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { apiFetch } from "@/lib/api"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layers, Search, ChevronDown, ChevronRight } from "lucide-react"

type CategoryDef = {
  id: string
  label: string
  is_user_generated: boolean
  suggested_items: string[]
}

function CategoriesContent() {
  useAuthGuard()
  const searchParams = useSearchParams()
  const router = useRouter()

  const openParam = searchParams.get("open")

  const [categories, setCategories] = useState<CategoryDef[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(openParam)
  const [platform, setPlatform] = useState<"amazon" | "aliexpress">("aliexpress")

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
      .finally(() => setLoading(false))
  }, [])

  const handleSuggestedClick = (categoryId: string, item: string) => {
    router.push(
      `/dashboard/search?q=${encodeURIComponent(item)}&platform=${platform}&category=${categoryId}`
    )
  }

  const systemCategories = categories.filter((c) => !c.is_user_generated)
  const userCategories = categories.filter((c) => c.is_user_generated)

  return (
    <main className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="ml-[240px] min-h-screen p-6 pl-0 animate-fade-in-up">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 p-2 rounded-xl">
                <Layers className="text-primary w-6 h-6" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">
                Browse Categories
              </h1>
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

          <p className="text-sm text-muted-foreground mb-6">
            Click a category to see suggested products, then click any
            suggestion to search for it. Results will be automatically tagged
            with the category.
          </p>

          {loading ? (
            <p className="text-muted-foreground">Loading categories...</p>
          ) : (
            <>
              <div className="columns-1 md:columns-2 gap-3 space-y-3">
                {systemCategories.map((cat) => (
                  <Card
                    key={cat.id}
                    className="border border-border shadow-sm break-inside-avoid"
                  >
                    <CardHeader className="pb-0">
                      <button
                        onClick={() =>
                          setExpanded(expanded === cat.id ? null : cat.id)
                        }
                        className="flex items-center gap-2 w-full text-left"
                      >
                        {expanded === cat.id ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                        <CardTitle className="text-base font-semibold">
                          {cat.label}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {cat.suggested_items.length} items
                        </span>
                      </button>
                    </CardHeader>
                    {expanded === cat.id && (
                      <CardContent className="pt-3">
                        <div className="flex flex-wrap gap-2">
                          {cat.suggested_items.map((item) => (
                            <button
                              key={item}
                              onClick={() =>
                                handleSuggestedClick(cat.id, item)
                              }
                              className="text-sm px-3 py-1.5 rounded-full border border-border hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-1"
                            >
                              <Search className="w-3 h-3" />
                              {item}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>

              {/* User-created categories */}
              {userCategories.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold mt-8 mb-3">
                    Your Categories
                  </h2>
                  <div className="columns-1 md:columns-2 gap-3 space-y-3">
                    {userCategories.map((cat) => (
                      <Card
                        key={cat.id}
                        className="border border-border shadow-sm break-inside-avoid"
                      >
                        <CardHeader className="pb-0">
                          <button
                            onClick={() =>
                              setExpanded(
                                expanded === cat.id ? null : cat.id
                              )
                            }
                            className="flex items-center gap-2 w-full text-left"
                          >
                            {expanded === cat.id ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                            <CardTitle className="text-base font-semibold">
                              {cat.label}
                            </CardTitle>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {cat.suggested_items.length} items
                            </span>
                          </button>
                        </CardHeader>
                        {expanded === cat.id && (
                          <CardContent className="pt-3">
                            {cat.suggested_items.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                No suggestions yet. Add items from search
                                results.
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {cat.suggested_items.map((item) => (
                                  <button
                                    key={item}
                                    onClick={() =>
                                      handleSuggestedClick(cat.id, item)
                                    }
                                    className="text-sm px-3 py-1.5 rounded-full border border-border hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-1"
                                  >
                                    <Search className="w-3 h-3" />
                                    {item}
                                  </button>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default function CategoriesPage() {
  return (
    <Suspense>
      <CategoriesContent />
    </Suspense>
  )
}
