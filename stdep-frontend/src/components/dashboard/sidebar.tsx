"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Search,
  History,
  Bookmark,
  Calculator,
  Settings,
  HelpCircle,
  LogOut,
  User,
} from "lucide-react"

const menuItems = [
  { name: "Analytics", href: "/dashboard", icon: BarChart3 },
  // { name: "Query / Search", href: "/dashboard/search", icon: Search }, // Removed, now in dashboard
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "Saved", href: "/dashboard/saved", icon: Bookmark },
  { name: "Margin Calculator", href: "/dashboard/calculator", icon: Calculator },
]

const generalItems = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Policies, FAQ, About", href: "/dashboard/info", icon: HelpCircle },
]

export function DashboardSidebar() {
  const pathname = usePathname()

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
              <p className="text-sm font-medium text-foreground">John Doe</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Link>
        </div>
      </div>
    </aside>
  )
}
