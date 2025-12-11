import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

function getApiBaseUrl() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || "http://localhost:8080"
    return raw.replace(/\/+$/, "")
}

// GET /api/admin/products/[id]/variants/[variantId] - Lấy chi tiết variant
export async function GET(req: NextRequest, { params }: { params: { id: string; variantId: string } }) {
    try {
        const cookieStore = cookies()
        const token = cookieStore.get("auth-token")?.value

        const headers: HeadersInit = {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }

        const base = getApiBaseUrl()
        const url = `${base}/api/v1/products/${params.id}/variants/${params.variantId}`

        const res = await fetch(url, {
            headers,
            cache: "no-store",
        })

        const data = await res.json().catch(() => ({}))
        return NextResponse.json(data, { status: res.status })
    } catch (e) {
        console.error("Variant GET error:", e)
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        )
    }
}

// PUT /api/admin/products/[id]/variants/[variantId] - Cập nhật variant
export async function PUT(req: NextRequest, { params }: { params: { id: string; variantId: string } }) {
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
        const url = `${base}/api/v1/products/${params.id}/variants/${params.variantId}`

        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ...body, productId: params.id }),
            cache: "no-store",
        })

        const data = await res.json().catch(() => ({}))
        return NextResponse.json(data, { status: res.status })
    } catch (e) {
        console.error("Variant PUT error:", e)
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        )
    }
}

// DELETE /api/admin/products/[id]/variants/[variantId] - Xóa variant
export async function DELETE(req: NextRequest, { params }: { params: { id: string; variantId: string } }) {
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
        const url = `${base}/api/v1/products/${params.id}/variants/${params.variantId}`

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
                { success: true, message: "Đã xóa variant thành công" },
                { status: 200 }
            )
        }

        const data = await res.json().catch(() => ({}))
        return NextResponse.json(data, { status: res.status })
    } catch (e) {
        console.error("Variant DELETE error:", e)
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        )
    }
}

