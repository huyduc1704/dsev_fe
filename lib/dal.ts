"use server"

import { cache } from "react"
import { cookies } from "next/headers"
import type { User as UserType } from "./types/user"

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL ||
    "http://localhost:8080"

async function backendFetch(path: string, opts: RequestInit = {}) {
    const url = path.startsWith("http") ? path : `${API_BASE.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`
    const headers: Record<string, string> = { Accept: "application/json", ...(opts.headers as Record<string, string> || {}) }
    const res = await fetch(url, { ...opts, headers, cache: "no-store" })
    const text = await res.text().catch(() => "")
    let body: any = {}
    try { body = text ? JSON.parse(text) : {} } catch { body = { raw: text } }
    return { ok: res.ok, status: res.status, body, res }
}

export async function createSession(token: string) {
    const cookieStore = cookies()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    cookieStore.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires,
    })
}

export async function deleteSession() {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value
    try {
        if (token) {
            await backendFetch("/api/v1/auth/logout", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            })
        }
    } catch (e) {
        console.error("Backend logout failed:", e)
    }
    cookieStore.delete("auth-token")
}

export const verifySession = cache(async (): Promise<{ user: UserType; expires: string } | null> => {
    try {
        const cookieStore = cookies()
        const token = cookieStore.get("auth-token")?.value
        if (!token) return null

        const { ok, body } = await backendFetch("/api/v1/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        })

        if (!ok) {
            console.warn("verifySession: backend returned not-ok", body)
            return null
        }

        const userData = body?.data ?? body
        if (!userData) return null

        const user: UserType = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            role: userData.role,
            addresses: userData.addresses,
            token,
        }

        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        return { user, expires }
    } catch (error) {
        console.error("verifySession error:", error)
        return null
    }
})

export const getUser = cache(async (): Promise<UserType | null> => {
    const session = await verifySession()
    return session ? session.user : null
})

export const getUserById = cache(async (userId: string): Promise<UserType | null> => {
    const current = await getUser()
    if (!current) return null
    if (current.id === userId) return current
    return null
})

export async function hasPermission(user: UserType | null, permission: string): Promise<boolean> {
    if (!user) return false
    if (user.role === "ADMIN") return true
    if (user.role === "MODERATOR" && permission.startsWith("moderate:")) return true
    if (user.role === "STAFF" && permission.startsWith("staff:")) return true
    return false
}