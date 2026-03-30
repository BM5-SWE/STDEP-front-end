"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

type PasswordRule = {
  label: string
  test: (pw: string) => boolean
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 8 characters",          test: (pw) => pw.length >= 8 },
  { label: "One uppercase letter (A–Z)",      test: (pw) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter (a–z)",      test: (pw) => /[a-z]/.test(pw) },
  { label: "One number (0–9)",                test: (pw) => /[0-9]/.test(pw) },
]

function PasswordStrengthIndicator({ password }: { password: string }) {
  if (!password) return null
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length
  const strength = passed === 4 ? "Strong" : passed >= 2 ? "Fair" : "Weak"
  const color = passed === 4 ? "bg-emerald-500" : passed >= 2 ? "bg-yellow-400" : "bg-red-500"

  return (
    <div className="space-y-2 mt-1">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all",
              i <= passed ? color : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className={cn(
        "text-[11px] font-medium",
        passed === 4 ? "text-emerald-600" : passed >= 2 ? "text-yellow-600" : "text-red-500"
      )}>
        {strength}
      </p>
      {/* Rule checklist */}
      <ul className="space-y-0.5">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password)
          return (
            <li key={rule.label} className={cn("flex items-center gap-1.5 text-[11px]", ok ? "text-emerald-600" : "text-muted-foreground")}>
              {ok ? <Check className="w-3 h-3 shrink-0" /> : <X className="w-3 h-3 shrink-0" />}
              {rule.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPasswordRules, setShowPasswordRules] = useState(false)

  const passwordValid = PASSWORD_RULES.every((r) => r.test(password))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email.trim() || !username.trim() || !password.trim()) {
      setError("Email, username, and password are required.")
      return
    }
    if (!passwordValid) {
      setError("Password does not meet the requirements below.")
      setShowPasswordRules(true)
      return
    }
    setLoading(true)
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, username, password, access_code: accessCode }),
      })
      if (!res.ok) {
        let data: Record<string, unknown> = {}
        try { data = await res.json() } catch {}
        const detail = data?.detail
        if (typeof detail === "string") {
          setError(detail)
        } else if (Array.isArray(detail)) {
          setError(detail.map((d: { msg?: string }) => d.msg ?? "").filter(Boolean).join(". ") || "Registration failed")
        } else {
          setError("Registration failed")
        }
      } else {
        const data = await res.json()
        localStorage.setItem("access_token", data.access_token)
        localStorage.setItem("refresh_token", data.refresh_token)
        router.push("/dashboard")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="flex gap-4 h-[calc(100vh-2rem)]">
        {/* Left Side - Register Form */}
        <aside className="w-[30%] min-w-[340px] max-w-[440px] flex flex-col">
          <div className="bg-card rounded-2xl flex flex-col h-full p-6 shadow-sm border border-border animate-slide-in-left">
            {/* Logo */}
            <div className="mb-8 animate-start-hidden animate-fade-in-up animation-delay-100">
              <Link href="/">
                <h1 className="text-3xl font-bold text-primary tracking-tight hover:opacity-80 transition-opacity">
                  SmartTrend
                </h1>
              </Link>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-[0.2em]">
                BY BM5
              </p>
            </div>

            {/* Register Card */}
            <Card className="border border-border shadow-none flex-1 flex flex-col animate-start-hidden animate-fade-in-up animation-delay-200">
              <CardHeader className="text-left pb-3">
                <CardTitle className="text-xl font-bold text-primary">Register</CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Create your account to get started with SmartTrend analytics.
                </p>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col">
                <form className="border-t border-border pt-4 flex-1 flex flex-col" onSubmit={handleRegister}>
                  <div className="space-y-4 flex-1">
                    <div className="space-y-2 text-left">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        type="text" 
                        placeholder="Choose a username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        required
                        minLength={3}
                        maxLength={50}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="access-code">Access Code</Label>
                      <Input
                        id="access-code"
                        type="text"
                        placeholder="Access code"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        disabled={loading}
                        required
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Create a password" 
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (!showPasswordRules && e.target.value.length > 0) setShowPasswordRules(true)
                        }}
                        disabled={loading}
                        required
                        minLength={8}
                        className="rounded-lg"
                      />
                      {showPasswordRules && <PasswordStrengthIndicator password={password} />}
                    </div>
                    {error && (
                      <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                        {error}
                      </div>
                    )}
                  </div>
                  <div className="mt-auto pt-6">
                    <Button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-5"
                    >
                      {loading ? "Registering..." : "Register"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      {"Already have an account? "}
                      <Link href="/login" className="underline hover:text-foreground">
                        Log in here
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="mt-auto pt-6 text-left animate-start-hidden animate-fade-in-up animation-delay-300">
              <p className="text-xs text-muted-foreground">
                * Your data is private and secured. Do not share your information.
              </p>
            </div>
          </div>
        </aside>

        {/* Right Side - Welcome Message */}
        <section className="flex-1">
          <div className="bg-card rounded-2xl h-full p-8 shadow-sm border border-border flex flex-col items-center justify-center text-center animate-slide-in-right">
            <p className="text-sm text-muted-foreground uppercase tracking-[0.3em] mb-4">
              GET STARTED WITH
            </p>
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              SmartTrend Analytics
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed text-balance">
              Join thousands of businesses using SmartTrend to identify emerging market trends, analyze competitor strategies, and drive growth with data-driven insights.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
