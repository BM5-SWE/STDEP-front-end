"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

const topProducts = [
  { name: "Product A", category: "Category", score: 95 },
  { name: "Product B", category: "Category", score: 92 },
  { name: "Product C", category: "Category", score: 89 },
  { name: "Product D", category: "Category", score: 88 },
  { name: "Product E", category: "Category", score: 85 },
]

const topCategories = [
  { name: "Category A", score: 95 },
  { name: "Category B", score: 92 },
  { name: "Category C", score: 89 },
  { name: "Category D", score: 88 },
  { name: "Category E", score: 85 },
]

const marketGrowthData = [
  { month: "Jan", value: 4000 },
  { month: "Feb", value: 8000 },
  { month: "Mar", value: 12000 },
  { month: "Apr", value: 25000 },
  { month: "May", value: 55000 },
  { month: "Jun", value: 48000 },
  { month: "Jul", value: 62000 },
  { month: "Aug", value: 85000 },
]


export function DashboardContent() {
  const [activeTab, setActiveTab] = useState<"amazon" | "aliexpress">("amazon")
  const [query, setQuery] = useState("")

  return (
    <div className="ml-[240px] min-h-screen p-4 pl-0">
      <div className="flex flex-col gap-4">
        {/* Query/Search Bar */}
        <div className="flex justify-center mb-4 animate-fade-in-up">
          <Input
            type="text"
            placeholder="Search for products, categories, or clusters..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="max-w-xl border border-border shadow-sm"
          />
        </div>
        {/* Top Tabs */}
        <div className="flex justify-center animate-fade-in-up">
          <div className="bg-card rounded-full p-1 border border-border shadow-sm">
            <button
              onClick={() => setActiveTab("amazon")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-colors",
                activeTab === "amazon"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Amazon
            </button>
            <button
              onClick={() => setActiveTab("aliexpress")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-colors",
                activeTab === "aliexpress"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              AliExpress
            </button>
          </div>
        </div>

        {/* First Row (content can be customized per tab) */}
        <div className="grid grid-cols-3 gap-4">
          {/* Cluster Visual Placeholder */}
          <Card className="border border-border shadow-sm animate-slide-in-right" style={{ animationDelay: "100ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-foreground">
                {activeTab === "amazon" ? "Amazon Clusters" : "AliExpress Clusters"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Placeholder cluster visual - replace with real data later */}
              <div className="flex flex-col items-center justify-center h-48">
                <div className="flex gap-6 mb-2">
                  <div className="w-16 h-16 rounded-full bg-blue-300 flex items-center justify-center text-lg font-bold text-white">A</div>
                  <div className="w-16 h-16 rounded-full bg-green-300 flex items-center justify-center text-lg font-bold text-white">B</div>
                  <div className="w-16 h-16 rounded-full bg-yellow-300 flex items-center justify-center text-lg font-bold text-white">C</div>
                </div>
                <div className="flex gap-6">
                  <span className="text-xs text-muted-foreground">Cluster 1</span>
                  <span className="text-xs text-muted-foreground">Cluster 2</span>
                  <span className="text-xs text-muted-foreground">Cluster 3</span>
                </div>
                <div className="mt-4 text-xs text-muted-foreground italic">(Placeholder: real cluster data will appear here)</div>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="border border-border shadow-sm animate-slide-in-right" style={{ animationDelay: "200ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-foreground">Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {topProducts.map((product) => (
                  <div key={product.name} className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-muted rounded" />
                    <span className="text-sm text-foreground flex-1">{product.name}</span>
                    <span className="text-xs text-muted-foreground">{product.category}</span>
                    <span className="text-xs font-medium bg-foreground text-background px-2 py-0.5 rounded">
                      {product.score}
                    </span>
                    <span className="text-xs text-muted-foreground underline cursor-pointer hover:text-foreground">
                      View
                    </span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
                Expand
              </Button>
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card className="border border-border shadow-sm animate-slide-in-right" style={{ animationDelay: "300ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-foreground">Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {topCategories.map((category) => (
                  <div key={category.name} className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-muted rounded" />
                    <span className="text-sm text-foreground flex-1">{category.name}</span>
                    <span className="text-xs font-medium bg-foreground text-background px-2 py-0.5 rounded">
                      {category.score}
                    </span>
                    <span className="text-xs text-muted-foreground underline cursor-pointer hover:text-foreground">
                      View
                    </span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
                Expand
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Placeholder Card */}
          <Card className="border border-border shadow-sm animate-slide-in-right" style={{ animationDelay: "400ms" }}>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-xl text-muted-foreground">Dashboard Item TBD</p>
            </CardContent>
          </Card>

          {/* Market Growth Chart */}
          <Card className="border border-border shadow-sm animate-slide-in-right" style={{ animationDelay: "500ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-foreground">Market Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={marketGrowthData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.65 0.12 185)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.65 0.12 185)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "oklch(0.5 0.02 250)" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "oklch(0.5 0.02 250)" }}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(1 0 0)",
                        border: "1px solid oklch(0.9 0.005 250)",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="oklch(0.65 0.12 185)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="border border-border shadow-sm animate-slide-in-right"
              style={{ animationDelay: `${500 + i * 100}ms` }}
            >
              <CardContent className="h-[150px] flex items-center justify-center">
                <p className="text-lg text-muted-foreground">Dashboard Item TBD</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
