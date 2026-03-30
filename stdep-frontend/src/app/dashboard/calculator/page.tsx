"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { apiFetch } from "@/lib/api"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronDown, ChevronRight, Package } from "lucide-react"

type Product = {
  id: string
  product_name: string
  platform: string
  price: number | null
  currency: string | null
  category: string | null
  product_image_url: string | null
}

export default function MarginCalculatorPage() {
  useAuthGuard()
  const [savedProducts, setSavedProducts] = useState<Product[]>([])
  const [activeTab, setActiveTab] = useState<"calculator" | "estimator">("calculator")
  const [bulkPrice, setBulkPrice] = useState("")
  const [bulkQuantity, setBulkQuantity] = useState("")
  const [sellingPrice, setSellingPrice] = useState("")
  const [optionalQuantity, setOptionalQuantity] = useState("")
  const [productName, setProductName] = useState("")
  const [brand, setBrand] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [showSavedProducts, setShowSavedProducts] = useState(true)
  const [estimateResult, setEstimateResult] = useState<{
    bulkCost: number
    sellingPrice: number
    marginPercent: number | null
    marginValue: number | null
    uncertainty: string
  } | null>(null)
  const [estimateError, setEstimateError] = useState<string | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)

  useEffect(() => {
    apiFetch("/api/saved-products")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setSavedProducts(Array.isArray(data) ? data : []))
  }, [])

  const calculation = useMemo(() => {
    const p = Number.parseFloat(bulkPrice)
    const bulkQty = Number.parseInt(bulkQuantity, 10)
    const sellPrice = Number.parseFloat(sellingPrice)
    const qtyProvided = optionalQuantity.trim().length > 0
    const qtyValue = qtyProvided ? Number.parseInt(optionalQuantity, 10) : null

    if (!Number.isFinite(p) || p <= 0) return { error: "Enter a valid bulk price greater than 0." }
    if (!Number.isFinite(bulkQty) || bulkQty <= 0) return { error: "Enter a valid bulk quantity greater than 0." }
    if (!Number.isFinite(sellPrice) || sellPrice <= 0) return { error: "Enter a valid selling price greater than 0." }
    if (qtyProvided && (!Number.isFinite(qtyValue) || (qtyValue ?? 0) <= 0))
      return { error: "Optional quantity must be a whole number greater than 0." }

    const costPerItem = p / bulkQty
    const marginPercent = ((sellPrice - costPerItem) / sellPrice) * 100

    if (qtyProvided && qtyValue !== null) {
      const profit = (sellPrice - costPerItem) * qtyValue
      return { marginPercent, profit }
    }
    return { marginPercent }
  }, [bulkPrice, bulkQuantity, sellingPrice, optionalQuantity])

  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product.id)
    setProductName(product.product_name)
    setBrand("")
    setCategory("")
    setPrice(product.price != null ? String(product.price) : "")
    setEstimateResult(null)
    setEstimateError(null)
  }

  const handleEstimate = async () => {
    setEstimateError(null)
    setEstimateResult(null)

    const trimmedName = productName.trim()
    const trimmedBrand = brand.trim()
    const trimmedCategory = category.trim()
    const priceValue = Number.parseFloat(price)

    if (!trimmedName || !trimmedBrand || !trimmedCategory) {
      setEstimateError("Please fill in product name, brand, and category.")
      return
    }
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      setEstimateError("Please enter a valid price greater than 0.")
      return
    }

    try {
      setIsEstimating(true)
      const response = await apiFetch("/gemini/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: trimmedName,
          brand: trimmedBrand,
          category: trimmedCategory,
          price: priceValue,
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        const message = errorPayload?.detail || "Failed to generate estimate."
        throw new Error(message)
      }

      const data = (await response.json()) as {
        bulk_cost: number
        selling_price: number
        margin_percent?: number
        margin_value?: number
        margin?: number
        uncertainty: string
      }

      setEstimateResult({
        bulkCost: data.bulk_cost,
        sellingPrice: data.selling_price,
        marginPercent: typeof data.margin_percent === "number" ? data.margin_percent : typeof data.margin === "number" ? data.margin : null,
        marginValue: typeof data.margin_value === "number" ? data.margin_value : null,
        uncertainty: data.uncertainty,
      })
    } catch (error) {
      setEstimateError(error instanceof Error ? error.message : "Something went wrong.")
    } finally {
      setIsEstimating(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="ml-[240px] min-h-screen p-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex justify-center animate-fade-in-up">
            <div className="bg-card rounded-full p-1 border border-border shadow-sm">
              <button
                onClick={() => setActiveTab("calculator")}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-colors",
                  activeTab === "calculator" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Calculator
              </button>
              <button
                onClick={() => setActiveTab("estimator")}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-colors",
                  activeTab === "estimator" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                AI Estimator
              </button>
            </div>
          </div>

          {activeTab === "calculator" ? (
            <Card className="border border-border shadow-sm animate-fade-in-up">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-foreground">Margin Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-price">Bulk buying cost (total)</Label>
                    <Input id="bulk-price" type="number" min="0" step="0.01" placeholder="e.g., 120"
                      value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulk-quantity">Bulk quantity (items)</Label>
                    <Input id="bulk-quantity" type="number" min="1" step="1" placeholder="e.g., 24"
                      value={bulkQuantity} onChange={(e) => setBulkQuantity(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="selling-price">Selling price (per item)</Label>
                    <Input id="selling-price" type="number" min="0" step="0.01" placeholder="e.g., 9.99"
                      value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="optional-quantity">Optional quantity (items)</Label>
                    <Input id="optional-quantity" type="number" min="1" step="1" placeholder="Leave blank for margin only"
                      value={optionalQuantity} onChange={(e) => setOptionalQuantity(e.target.value)} />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/40 p-4">
                  {"error" in calculation ? (
                    <p className="text-sm text-destructive">{calculation.error}</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-muted-foreground">Margin</p>
                      <p className="text-3xl font-bold text-foreground">{calculation.marginPercent.toFixed(2)}%</p>
                      {typeof calculation.profit === "number" && (
                        <p className="text-sm text-muted-foreground">
                          Profit for quantity: <span className="font-semibold text-foreground">${calculation.profit.toFixed(2)}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 animate-fade-in-up">
              {/* Saved products — compact list */}
              {savedProducts.length > 0 && (
                <Card className="border border-border shadow-sm">
                  <button
                    onClick={() => setShowSavedProducts((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">Saved Products</span>
                      <span className="text-xs text-muted-foreground">({savedProducts.length})</span>
                    </div>
                    {showSavedProducts ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  {showSavedProducts && (
                    <div className="border-t border-border max-h-[280px] overflow-y-auto">
                      {savedProducts.map((product) => {
                        const isSelected = selectedProductId === product.id
                        let imgUrl = product.product_image_url || ""
                        if (imgUrl.startsWith("//")) imgUrl = "https:" + imgUrl

                        return (
                          <button
                            key={product.id}
                            onClick={() => handleSelectProduct(product)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-b-0",
                              isSelected && "bg-primary/5 border-l-2 border-l-primary"
                            )}
                          >
                            {/* Tiny thumbnail */}
                            <div className="w-8 h-8 rounded bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                              {imgUrl ? (
                                <img src={imgUrl} alt="" className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                              ) : (
                                <Package className="w-3.5 h-3.5 text-muted-foreground/30" />
                              )}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{product.product_name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {product.platform === "aliexpress" ? "AliExpress" : "Amazon"}
                                {product.price != null && <> · {product.currency || "$"}{product.price.toFixed(2)}</>}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="text-[10px] text-primary font-medium shrink-0">Selected</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </Card>
              )}

              {/* Estimator form */}
              <Card className="border border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-foreground">AI Margin Estimator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    AI-generated estimates are informed guesses and may differ from real-world prices or margins.
                    Use these results as guidance only.
                    {savedProducts.length > 0 && !selectedProductId && (
                      <span className="block mt-1 text-primary font-medium">
                        Tip: Select a saved product above to auto-fill the fields.
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product-name">Product name</Label>
                      <Input id="product-name" placeholder="e.g., Anker Soundcore 2"
                        value={productName} onChange={(e) => setProductName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand / Platform</Label>
                      <Input id="brand" placeholder="Required — e.g., Anker"
                        value={brand} onChange={(e) => setBrand(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input id="category" placeholder="Required — e.g., Electronics > Speakers"
                        value={category} onChange={(e) => setCategory(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimate-price">Price</Label>
                      <Input id="estimate-price" type="number" min="0" step="0.01" placeholder="e.g., 44.99"
                        value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button onClick={handleEstimate} disabled={isEstimating}>
                      {isEstimating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                          Estimating…
                        </>
                      ) : (
                        "Generate estimate"
                      )}
                    </Button>
                    {estimateError && (
                      <span className="text-sm text-destructive">{estimateError}</span>
                    )}
                  </div>

                  {estimateResult && (
                    <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
                      {[
                        { label: "Bulk cost (unit)", value: `$${estimateResult.bulkCost.toFixed(2)}` },
                        { label: "Suggested selling price", value: `$${estimateResult.sellingPrice.toFixed(2)}` },
                        { label: "Margin estimate", value: estimateResult.marginPercent !== null ? `${estimateResult.marginPercent.toFixed(2)}%` : "—" },
                        { label: "Margin value", value: estimateResult.marginValue !== null ? `$${estimateResult.marginValue.toFixed(2)}` : "—" },
                        { label: "Uncertainty", value: estimateResult.uncertainty },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{label}</span>
                          <span className="text-sm font-semibold text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
