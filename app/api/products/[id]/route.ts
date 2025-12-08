import { NextRequest, NextResponse } from "next/server"

function getApiBaseUrl() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || "http://localhost:8080"
    return raw.replace(/\/+$/, "")
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params?.id
        if (!id) return NextResponse.json({ error: "Missing product id" }, { status: 400 })
        const base = getApiBaseUrl()
        const url = `${base}/api/v1/products/${encodeURIComponent(id)}`
        console.log('[API] GET /api/products/[id] ->', url)
        const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" })
        const body = await res.json().catch(() => ({}))
        return NextResponse.json(body, { status: res.status })
    } catch (e) {
        console.error("Product [id] route error:", e)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
