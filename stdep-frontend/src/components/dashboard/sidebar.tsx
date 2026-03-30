"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { apiFetch } from "@/lib/api"
import {
  BarChart3,
  History,
  Calculator,
  Settings,
  HelpCircle,
  LogOut,
  User,
  Search,
  Star,
  Layers,
  Moon,
  Sun,
} from "lucide-react"

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Search", href: "/dashboard/search", icon: Search },
  { name: "Favourites", href: "/dashboard/favourites", icon: Star },
  { name: "Categories", href: "/dashboard/categories", icon: Layers },
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "Margin Calculator", href: "/dashboard/calculator", icon: Calculator },
]

const generalItems = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Info & FAQ", href: "/dashboard/info", icon: HelpCircle },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    apiFetch("/auth/me").then(async (res) => {
      if (res.ok) {
        const data = await res.json()
        setUserName(data.name || data.username || "User")
        setUserRole(data.role ?? "user")
      }
    })
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    router.replace("/login")
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] flex flex-col p-4">
      <div className="bg-card rounded-2xl flex flex-col h-full p-5 shadow-sm border border-border animate-slide-in-left">
        {/* Logo */}
        <Link href="/" className="mb-6 animate-start-hidden animate-fade-in-up animation-delay-100">
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            SmartTrend
          </h1>
        </Link>

        {/* Menu Section */}
        <div className="mb-6 animate-start-hidden animate-fade-in-up animation-delay-200">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Menu
          </p>
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* General Section */}
        <div className="mb-6 animate-start-hidden animate-fade-in-up animation-delay-300">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            General
          </p>
          <nav className="flex flex-col gap-1">
            {generalItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
            {/* Dark mode toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
            )}
          </nav>
        </div>

        {/* User Section */}
        <div className="mt-auto animate-start-hidden animate-fade-in-up animation-delay-400">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            User
          </p>
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{userName || "..."}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole || "..."}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
