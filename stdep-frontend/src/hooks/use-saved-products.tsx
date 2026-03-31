"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { apiFetch } from "@/lib/api"

type SavedProductsContextValue = {
  /** Check if a product is already saved */
  isSaved: (productName: string, platform: string) => boolean
  /** Mark a product as saved (call after successful POST) */
  markSaved: (productName: string, platform: string) => void
  /** Mark a product as unsaved (call after successful DELETE) */
  markUnsaved: (productName: string, platform: string) => void
  /** Whether the initial fetch has completed */
  loaded: boolean
}

const SavedProductsContext = createContext<SavedProductsContextValue>({
  isSaved: () => false,
  markSaved: () => {},
  markUnsaved: () => {},
  loaded: false,
})

function makeKey(name: string, platform: string) {
  return `${name.toLowerCase().trim()}|${platform.toLowerCase()}`
}

export function SavedProductsProvider({ children }: { children: React.ReactNode }) {
  const [keys, setKeys] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    if (!token) {
      setLoaded(true)
      return
    }

    apiFetch("/api/saved-products?limit=500")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { product_name: string; platform: string }[]) => {
        if (Array.isArray(data)) {
          setKeys(new Set(data.map((p) => makeKey(p.product_name, p.platform))))
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const isSaved = useCallback(
    (productName: string, platform: string) => keys.has(makeKey(productName, platform)),
    [keys]
  )

  const markSaved = useCallback((productName: string, platform: string) => {
    setKeys((prev) => new Set(prev).add(makeKey(productName, platform)))
  }, [])

  const markUnsaved = useCallback((productName: string, platform: string) => {
    setKeys((prev) => {
      const next = new Set(prev)
      next.delete(makeKey(productName, platform))
      return next
    })
  }, [])

  return (
    <SavedProductsContext.Provider value={{ isSaved, markSaved, markUnsaved, loaded }}>
      {children}
    </SavedProductsContext.Provider>
  )
}

export function useSavedProducts() {
  return useContext(SavedProductsContext)
}
