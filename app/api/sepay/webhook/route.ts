import { NextRequest, NextResponse } from "next/server";

function getApiBaseUrl() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || "http://localhost:8080"
    return raw.replace(/\/+$/, "")
}

export async function POST(req: NextRequest) {
    try {
        const base = getApiBaseUrl()
        const url = `${base}/api/v1/sepay/webhook`
        const body = await req.json()

        // Webhook từ SePay không cần auth token
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(body),
            cache: "no-store",
        })

        const json = await res.json().catch(async () => {
            const txt = await res.text().catch(() => "")
            try { return JSON.parse(txt) } catch { return { raw: txt } }
        })
        
        return NextResponse.json(json, { status: res.status })
    } catch (e) {
        console.error("SePay webhook error:", e)
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        )
    }
}

