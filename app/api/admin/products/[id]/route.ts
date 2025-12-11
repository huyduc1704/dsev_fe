import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

function getApiBaseUrl() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || "http://localhost:8080"
    return raw.replace(/\/+$/, "")
}

// GET /api/admin/products/[id] - Lấy chi tiết product
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies()
        const token = cookieStore.get("auth-token")?.value

        const headers: HeadersInit = {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }

        const base = getApiBaseUrl()
        const url = `${base}/api/v1/products/${params.id}`

        const res = await fetch(url, {
            headers,
            cache: "no-store",
        })

        const data = await res.json().catch(() => ({}))
        return NextResponse.json(data, { status: res.status })
    } catch (e) {
        console.error("Product GET error:", e)
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        )
    }
}

// PUT /api/admin/products/[id] - Cập nhật product
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
        const url = `${base}/api/v1/products/${params.id}`

        const res = await fetch(url, {
            method: "PUT",
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
        console.error("Product PUT error:", e)
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        )
    }
}

// DELETE /api/admin/products/[id] - Xóa product
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies()
        const token = cookieStore.get("auth-token")?.value

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        const base = getApiBaseUrl()
        const url = `${base}/api/v1/products/${params.id}`

        const res = await fetch(url, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        })

        // 204 No Content không có body
        if (res.status === 204) {
            return NextResponse.json(
                { success: true, message: "Đã xóa product thành công" },
                { status: 200 }
            )
        }

        const data = await res.json().catch(() => ({}))
        return NextResponse.json(data, { status: res.status })
    } catch (e) {
        console.error("Product DELETE error:", e)
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        )
    }
}

