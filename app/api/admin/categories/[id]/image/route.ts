import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

function getApiBaseUrl() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || "http://localhost:8080"
    return raw.replace(/\/+$/, "")
}

// POST /api/admin/categories/[id]/image - Upload image cho category
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const cookieStore = cookies()
        const token = cookieStore.get("auth-token")?.value

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        const formData = await req.formData()
        const base = getApiBaseUrl()
        const url = `${base}/api/v1/categories/${params.id}/image`

        const res = await fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: formData,
            cache: "no-store",
        })

        const data = await res.json().catch(() => ({}))
        return NextResponse.json(data, { status: res.status })
    } catch (e) {
        console.error("Category image POST error:", e)
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        )
    }
}

