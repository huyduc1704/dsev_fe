"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { LayoutDashboard, Package, ShoppingBag, Tag, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/me", { credentials: "include" })
                if (res.ok) {
                    const data = await res.json()
                    setUser(data?.data || data)
                } else {
                    router.push("/auth")
                }
            } catch (err) {
                console.error("Auth check error:", err)
                router.push("/auth")
            }
        }
        checkAuth()
    }, [router])

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
        } catch (e) {
            console.error("Logout error", e)
        }
        router.push("/auth")
    }

    const menuItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/categories", label: "Categories", icon: Package },
        { href: "/admin/products", label: "Products", icon: ShoppingBag },
        { href: "/admin/tags", label: "Tags", icon: Tag },
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background">
                <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                        <Link href="/admin" className="text-xl font-bold text-foreground">
                            Admin Panel
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:inline">
                            {user?.username || user?.email || "Admin"}
                        </span>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card pt-16 transition-transform md:translate-x-0 ${
                        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <nav className="p-4 space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>

            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    )
}

