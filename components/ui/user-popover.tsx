"use client"

import React, { useEffect, useRef } from "react"
import type { User } from "@/lib/types/user"
import Image from "next/image"

export default function UserPopover({
    user,
    onClose,
    onLogout,
    className = "",
}: {
    user: User | null
    onClose: () => void
    onLogout: () => void
    className?: string
}) {
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!ref.current) return
            if (ref.current.contains(e.target as Node)) return
            onClose()
        }

        document.addEventListener("click", onDocClick)
        return () => document.removeEventListener("click", onDocClick)
    }, [onClose])

    if (!user) return null

    return (
        <div ref={ref} className={`w-72 bg-white rounded-lg shadow-lg border overflow-hidden ${className}`}>
            <div className="p-4 flex items-center gap-3 border-b">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    <Image src="/logo-DSEV.png" alt="avatar" width={40} height={40} />
                </div>
                <div className="flex-1">
                    <div className="font-medium text-sm">{user.username}</div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                </div>
            </div>

            <div className="p-2">
                <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 text-sm">Hồ sơ của bạn</button>
                <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 text-sm">Đơn hàng</button>
                <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 text-sm">Địa chỉ</button>
            </div>

            <div className="p-3 border-t flex gap-2">
                <button onClick={onClose} className="flex-1 px-3 py-2 rounded text-sm hover:bg-gray-50">Đóng</button>
                <button onClick={onLogout} className="flex-1 px-3 py-2 rounded text-sm bg-red-600 text-white hover:opacity-95">Đăng xuất</button>
            </div>
        </div>
    )
}