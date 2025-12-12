"use client"

import React, { useState, useEffect } from "react"
import { Menu, ShoppingCart, Search, User as UserIcon, Home } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import UserPopover from "./ui/user-popover"
import type { User } from "@/lib/types/user"
import { useCart } from "./cart-context"

type Tag = {
  id: string
  name: string
  displayName: string
}

interface NavbarProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export default function Navbar({ activeCategory, onCategoryChange }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showPopover, setShowPopover] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [loadingTags, setLoadingTags] = useState(false)
  const router = useRouter()
  const { setOpen: setCartOpen, itemsCount, refreshCart } = useCart() as any

  // Load tags từ API
  useEffect(() => {
    let mounted = true
    const loadTags = async () => {
      try {
        setLoadingTags(true)
        const res = await fetch("/api/tags", { headers: { Accept: "application/json" }, cache: "no-store" })
        if (!mounted) return
        if (res.ok) {
          const body = await res.json().catch(() => ({}))
          const tagsData = body?.data || []
          if (Array.isArray(tagsData)) {
            setTags(tagsData)
          }
        }
      } catch (err) {
        console.error("Failed to fetch tags", err)
      } finally {
        if (mounted) setLoadingTags(false)
      }
    }
    loadTags()
    return () => {
      mounted = false
    }
  }, [])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Chỉ chạy 1 lần khi mount, không cần refreshCart trong deps

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
      <nav
        className="sticky top-0 z-50 shadow-sm glass-effect"
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <a href="/">
                <Image src="/logo-DSEV.png" alt="DV.ES logo" width={90} height={30} className="object-contain" priority />
              </a>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-center gap-2">
                {/* Trang chủ */}
                <button
                  onClick={() => {
                    router.push("/")
                    onCategoryChange("home")
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 h-9 ${activeCategory === "home" || activeCategory === "new"
                    ? "glass-button-active"
                    : "glass-button text-foreground hover:text-primary"
                    }`}
                >
                  <Home className="h-4 w-4" />
                  Trang chủ
                </button>
                {/* Tags từ API */}
                {loadingTags ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground h-9 flex items-center">Đang tải...</div>
                ) : (
                  tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => onCategoryChange(tag.id)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 h-9 flex items-center ${activeCategory === tag.id
                        ? "glass-button-active"
                        : "glass-button text-foreground hover:text-primary"
                        }`}
                    >
                      {tag.displayName || tag.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button className="p-2 rounded-md glass-button text-foreground hover:text-primary transition-all">
                <Search className="h-5 w-5" />
              </button>
              <div className="relative">
                <button
                  onClick={handleUserClick}
                  className="p-2 rounded-md glass-button text-foreground hover:text-primary transition-all"
                  aria-label="Đăng nhập / Hồ sơ"
                >
                  <UserIcon className="h-5 w-5" />
                </button>
                {showPopover && (
                  <div className="absolute right-0 top-full mt-2 z-[1000]">
                    <UserPopover
                      user={user}
                      onClose={() => setShowPopover(false)}
                      onLogout={handleLogoutCleanup}
                    />
                  </div>
                )}
              </div>
              <button className="p-2 rounded-md glass-button text-foreground hover:text-primary transition-all relative" onClick={() => setCartOpen(true)}>
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{itemsCount}</span>
              </button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md glass-button text-foreground hover:text-accent-foreground transition-all">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3 glass-effect border-t border-border">
                {/* Trang chủ */}
                <button
                  onClick={() => {
                    router.push("/")
                    onCategoryChange("home")
                    setIsMobileMenuOpen(false)
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center gap-2 h-10 ${activeCategory === "home" || activeCategory === "new"
                    ? "glass-button-active"
                    : "glass-button text-card-foreground hover:text-accent-foreground"
                    }`}
                >
                  <Home className="h-4 w-4" />
                  Trang chủ
                </button>
                {/* Tags từ API */}
                {loadingTags ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground h-10 flex items-center">Đang tải...</div>
                ) : (
                  tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        onCategoryChange(tag.id)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-all duration-200 h-10 flex items-center ${activeCategory === tag.id
                        ? "glass-button-active"
                        : "glass-button text-card-foreground hover:text-accent-foreground"
                        }`}
                    >
                      {tag.displayName || tag.name}
                    </button>
                  ))
                )}

                <div className="flex items-center space-x-4 px-3 py-2 border-t border-border mt-4">
                  <button className="p-2 rounded-md glass-button text-card-foreground hover:text-accent-foreground transition-all">
                    <Search className="h-5 w-5" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => {
                        if (user) setShowPopover(true)
                        else {
                          router.push("/auth")
                          setIsMobileMenuOpen(false)
                        }
                      }}
                      className="p-2 rounded-md glass-button text-card-foreground hover:text-accent-foreground transition-all"
                    >
                      <UserIcon className="h-5 w-5" />
                    </button>
                    {showPopover && (
                      <div className="absolute right-0 top-full mt-2 z-[1000]">
                        <UserPopover
                          user={user}
                          onClose={() => setShowPopover(false)}
                          onLogout={handleLogoutCleanup}
                        />
                      </div>
                    )}
                  </div>
                  <button className="p-2 rounded-md glass-button text-card-foreground hover:text-accent-foreground transition-all relative" onClick={() => setCartOpen(true)}>
                    <ShoppingCart className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{itemsCount}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}