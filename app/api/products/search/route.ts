import { NextRequest, NextResponse } from "next/server"

function getApiBaseUrl() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || "http://localhost:8080"
    return raw.replace(/\/+$/, "")
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const name = searchParams.get("name")
        if (!name) return NextResponse.json({ error: "Missing 'name' query" }, { status: 400 })
        const base = getApiBaseUrl()
        const url = `${base}/api/v1/products/search?name=${encodeURIComponent(name)}`
        console.log('[API] GET /api/products/search ->', url)
        const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" })
        const body = await res.json().catch(() => ({}))
        return NextResponse.json(body, { status: res.status })
    } catch (e) {
        console.error("Product search route error:", e)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
