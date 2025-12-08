import { NextRequest, NextResponse } from "next/server"

function getApiBaseUrl() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || "http://localhost:8080"
    return raw.replace(/\/+$/, "")
}

export async function GET(_req: NextRequest, { params }: { params: { categoryId: string } }) {
    try {
        const categoryId = params?.categoryId
        if (!categoryId) return NextResponse.json({ error: "Missing categoryId" }, { status: 400 })
        const base = getApiBaseUrl()
        const url = `${base}/api/v1/products/category/${encodeURIComponent(categoryId)}`
        console.log('[API] GET /api/products/category/[categoryId] ->', url)
        const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" })
        const body = await res.json().catch(() => ({}))
        return NextResponse.json(body, { status: res.status })
    } catch (e) {
        console.error("Product by category route error:", e)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
