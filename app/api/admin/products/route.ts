import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

function getApiBaseUrl() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || "http://localhost:8080"
    return raw.replace(/\/+$/, "")
}

// GET /api/admin/products - Lấy danh sách products (có thể có query params như search)
export async function GET(req: NextRequest) {
    try {
        const cookieStore = cookies()
        const token = cookieStore.get("auth-token")?.value

        const headers: HeadersInit = {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }

        const { searchParams } = new URL(req.url)
        const name = searchParams.get("name")
        const categoryId = searchParams.get("categoryId")

        const base = getApiBaseUrl()
        let url = `${base}/api/v1/products`

        // Nếu có name param, sử dụng search endpoint
        if (name) {
            url = `${base}/api/v1/products/search?name=${encodeURIComponent(name)}`
        } else if (categoryId) {
            url = `${base}/api/v1/products/category/${categoryId}`
        } else {
            url = `${base}/api/v1/products/active`
        }

        const res = await fetch(url, {
            headers,
            cache: "no-store",
        })

        const data = await res.json().catch(() => ({}))
        return NextResponse.json(data, { status: res.status })
    } catch (e) {
        console.error("Products GET error:", e)
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        )
    }
}

// POST /api/admin/products - Tạo product mới
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
        const url = `${base}/api/v1/products`

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
            cache: "no-store",
        })

        const data = await res.json().catch(() => ({}))
        return NextResponse.json(data, { status: res.status })
    } catch (e) {
        console.error("Products POST error:", e)
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        )
    }
}

