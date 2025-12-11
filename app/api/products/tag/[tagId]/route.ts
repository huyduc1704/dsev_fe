import { NextRequest, NextResponse } from "next/server"

function getApiBaseUrl() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || "http://localhost:8080"
    return raw.replace(/\/+$/, "")
}

// GET /api/products/tag/[tagId] - Lấy products theo tag
// TODO: Khi BE có API này, cập nhật endpoint BE
export async function GET(_req: NextRequest, { params }: { params: { tagId: string } }) {
    try {
        const base = getApiBaseUrl()
        // TODO: Thay đổi endpoint này khi BE có API filter products theo tag
        // Ví dụ: `${base}/api/v1/products?tagId=${params.tagId}`
        // Hoặc: `${base}/api/v1/tags/${params.tagId}/products`
        const url = `${base}/api/v1/products/active`
        console.log('[API] GET /api/products/tag/[tagId] ->', url, 'tagId:', params.tagId)

        const res = await fetch(url, {
            headers: { Accept: "application/json" },
            cache: "no-store"
        })

        const body = await res.json().catch(() => ({}))

        // Tạm thời: Filter ở FE nếu BE chưa có API
        // TODO: Xóa phần filter này khi BE có API filter theo tag
        let products = body?.data || []
        if (Array.isArray(products)) {
            products = products.filter((p: any) => {
                // Filter logic tương tự như trong ProductList
                if (Array.isArray(p.tags)) {
                    return p.tags.some((tag: any) =>
                        (typeof tag === 'string' ? tag : tag.id) === params.tagId
                    )
                }
                if (Array.isArray(p.tagIds)) {
                    return p.tagIds.includes(params.tagId)
                }
                if (p.tagId === params.tagId) {
                    return true
                }
                return false
            })
        }

        return NextResponse.json({ ...body, data: products }, { status: res.status })

    } catch (e) {
        console.error("Product tag route error:", e)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

