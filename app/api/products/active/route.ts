import { NextRequest, NextResponse } from "next/server"

function getApiBaseUrl() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || "http://localhost:8080"
    return raw.replace(/\/+$/, "")
}

export async function GET(_req: NextRequest) {
    try {
        const base = getApiBaseUrl()
        const url = `${base}/api/v1/products/active`
        console.log('[API] GET /api/products/active ->', url)

        const res = await fetch(url, {
            headers: { Accept: "application/json" },
            cache: "no-store"
        })

        const body = await res.json()

        return NextResponse.json(body, { status: res.status })

    } catch (e) {
        console.error("Product active route error:", e)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
