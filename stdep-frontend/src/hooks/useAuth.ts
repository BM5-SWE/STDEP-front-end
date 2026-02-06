"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { login as apiLogin, register as apiRegister, tokenManager } from "@/lib/api-client"

export function useAuth() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      setError(null)
      try {
        await apiLogin({ email, password })
        router.push("/dashboard")
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed"
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [router]
  )

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      setLoading(true)
      setError(null)
      try {
        await apiRegister({ email, username, password })
        router.push("/dashboard")
      } catch (err) {
        const message = err instanceof Error ? err.message : "Registration failed"
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [router]
  )

  const logout = useCallback(() => {
    tokenManager.clearTokens()
    router.push("/login")
  }, [router])

  const isAuthenticated = tokenManager.hasTokens()

  return {
    login,
    register,
    logout,
    loading,
    error,
    isAuthenticated,
  }
}
