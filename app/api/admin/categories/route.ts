import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

function getApiBaseUrl() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || "http://localhost:8080"
    return raw.replace(/\/+$/, "")
}

// GET /api/admin/categories - Lấy danh sách categories
export async function GET(_req: NextRequest) {
    try {
        const cookieStore = cookies()
        const token = cookieStore.get("auth-token")?.value

        const headers: HeadersInit = {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }

        const base = getApiBaseUrl()
        const url = `${base}/api/v1/categories`

        const res = await fetch(url, {
            headers,
            cache: "no-store",
        })

        const data = await res.json().catch(() => ({}))
        return NextResponse.json(data, { status: res.status })
    } catch (e) {
        console.error("Categories GET error:", e)
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        )
    }
}

// POST /api/admin/categories - Tạo category mới
export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies()
        const token = cookieStore.get("auth-token")?.value

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await req.json()
        const base = getApiBaseUrl()
        const url = `${base}/api/v1/categories`

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: body.name,
                description: body.description,
            }),
            cache: "no-store",
        })

        const data = await res.json().catch(() => ({}))
        return NextResponse.json(data, { status: res.status })
    } catch (e) {
        console.error("Categories POST error:", e)
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        )
    }
}

