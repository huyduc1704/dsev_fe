"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/types/user"
import Image from "next/image"
import { Settings, ShoppingBag, MapPin, LogOut, LayoutDashboard } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export default function UserPopover({
    user,
    onClose,
    onLogout,
}: {
    user: User | null
    onClose: () => void
    onLogout: () => void
}) {
    const router = useRouter()
    const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR"

    if (!user) return null

    const handleMenuItemClick = (href?: string) => {
        if (href) {
            router.push(href)
        }
        onClose()
    }

    return (
        <div className="w-72 bg-popover text-popover-foreground rounded-lg shadow-lg border border-border overflow-hidden">
            {/* User Info Header */}
            <div className="p-4 flex items-center gap-3 border-b border-border">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    <Image
                        src="/logo-DSEV.png"
                        alt="avatar"
                        width={40}
                        height={40}
                        className="object-contain"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">
                        {user.username || "User"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                        {user.email || ""}
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
                <button
                    onClick={() => handleMenuItemClick()}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm text-foreground transition-colors flex items-center gap-2"
                >
                    <Settings className="h-4 w-4" />
                    Hồ sơ của bạn
                </button>
                <button
                    onClick={() => handleMenuItemClick()}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm text-foreground transition-colors flex items-center gap-2"
                >
                    <ShoppingBag className="h-4 w-4" />
                    Đơn hàng
                </button>
                <button
                    onClick={() => handleMenuItemClick()}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm text-foreground transition-colors flex items-center gap-2"
                >
                    <MapPin className="h-4 w-4" />
                    Địa chỉ
                </button>

                {/* Admin/Moderator Menu Item */}
                {isAdmin && (
                    <>
                        <Separator className="my-2" />
                        <button
                            onClick={() => handleMenuItemClick("/admin")}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm text-foreground transition-colors flex items-center gap-2 font-medium"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Quản lý
                        </button>
                    </>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-3 border-t border-border flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="flex-1"
                >
                    Đóng
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={onLogout}
                    className="flex-1"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                </Button>
            </div>
        </div>
    )
}