"use client"

import React, { useState, useEffect } from "react"
import { Menu, ShoppingCart, Search, User as UserIcon } from "lucide-react"
import { categories } from "../data/mockData"
import Image from "next/image"
import { useRouter } from "next/navigation"
import UserPopover from "./ui/user-popover"
import type { User } from "@/lib/types/user"
import { set } from "date-fns"
import { useCart } from "./cart-context"

interface NavbarProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export default function Navbar({ activeCategory, onCategoryChange }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showPopover, setShowPopover] = useState(false)
  const router = useRouter()
  const { setOpen: setCartOpen, itemsCount, refreshCart } = useCart() as any

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const res = await fetch("/api/auth/me", { credentials: "include" })
          if (!mounted) return
          if (res.ok) {
            const body = await res.json().catch(() => ({}))
            const u = body?.data ?? null
            setUser(u)
            try { await refreshCart() } catch { }
          } else {
            setUser(null)
          }
        } catch (err) {
          console.error("Failed to fetch current user", err)
          setUser(null)
        }
      })()
    return () => {
      mounted = false
    }
  }, [])

  const handleUserClick = () => {
    if (user) {
      setShowPopover((v) => !v)
      return
    }
    router.push("/auth")
  }

  const handleLogoutCleanup = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    } catch (e) {
      console.error("Logout error", e)
    }
    setUser(null)
    setShowPopover(false)
    router.push("/auth")
  }

  return (
    <>
      <nav className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <a href="/">
                <Image src="/logo-DSEV.png" alt="DV.ES logo" width={90} height={30} className="object-contain" priority />
              </a>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => onCategoryChange(category.key)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${activeCategory === category.key
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted hover:text-primary"
                      }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button className="p-2 rounded-md text-foreground hover:bg-muted hover:text-primary transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={handleUserClick}
                className="p-2 rounded-md text-foreground hover:bg-muted hover:text-primary transition-colors"
                aria-label="Đăng nhập / Hồ sơ"
              >
                <UserIcon className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-md text-foreground hover:bg-muted hover:text-primary transition-colors relative" onClick={() => setCartOpen(true)}>
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{itemsCount}</span>
              </button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-foreground hover:bg-muted hover:text-accent-foreground transition-colors">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border-t border-border">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => {
                      onCategoryChange(category.key)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${activeCategory === category.key
                      ? "bg-primary text-primary-foreground"
                      : "text-card-foreground hover:bg-muted hover:text-accent-foreground"
                      }`}
                  >
                    {category.label}
                  </button>
                ))}

                <div className="flex items-center space-x-4 px-3 py-2 border-t border-border mt-4">
                  <button className="p-2 rounded-md text-card-foreground hover:bg-muted hover:text-accent-foreground transition-colors">
                    <Search className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (user) setShowPopover(true)
                      else {
                        router.push("/auth")
                        setIsMobileMenuOpen(false)
                      }
                    }}
                    className="p-2 rounded-md text-card-foreground hover:bg-muted hover:text-accent-foreground transition-colors"
                  >
                    <UserIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 rounded-md text-card-foreground hover:bg-muted hover:text-accent-foreground transition-colors relative" onClick={() => setCartOpen(true)}>
                    <ShoppingCart className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{itemsCount}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* popover positioned relative to navbar (adjust classes if needed) */}
      {showPopover && (
        <div className="fixed right-4 top-16 z-[1000]">
          <UserPopover user={user} onClose={() => setShowPopover(false)} onLogout={handleLogoutCleanup} />
        </div>
      )}
    </>
  )
}