"use client"

import { useEffect, useState } from "react"
import { message } from "antd"
import { useCart } from "./cart-context"

interface Variant {
    id: string
    color: string
    size: string
    price: number
    stockQuantity: number
}

interface BackendProduct {
    id: string
    name: string
    description: string
    brand: string
    images: string[]
    isActive: boolean
    categoryId: string
    variants: Variant[]
}

interface ProductDetailProps {
    productId: string
}

export default function ProductDetail({ productId }: ProductDetailProps) {
    const [product, setProduct] = useState<BackendProduct | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedSize, setSelectedSize] = useState<string>("")
    const [selectedColor, setSelectedColor] = useState<string>("")
    const [qty, setQty] = useState<number>(1)
    const { refreshCart } = useCart() as any

    useEffect(() => {
        let ignore = false
        const fetchProduct = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await fetch(`/api/products/${encodeURIComponent(productId)}`, { headers: { Accept: "application/json" } })
                const body = await res.json().catch(() => ({}))
                const data = body?.data ?? body
                if (!ignore) setProduct(data as BackendProduct)
            } catch (e) {
                console.error("Failed to fetch product detail:", e)
                if (!ignore) setError("Không tải được chi tiết sản phẩm")
            } finally {
                if (!ignore) setLoading(false)
            }
        }
        fetchProduct()
        return () => { ignore = true }
    }, [productId])

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">⏳</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Đang tải chi tiết sản phẩm…</h3>
                <p className="text-muted-foreground">Vui lòng đợi trong giây lát.</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Lỗi khi tải sản phẩm</h3>
                <p className="text-muted-foreground">{error}</p>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-muted-foreground">Sản phẩm có thể đã bị ẩn hoặc không tồn tại.</p>
            </div>
        )
    }

    const cover = product.images?.[0] ?? "/placeholder.svg"
    const minPrice = product.variants?.length ? Math.min(...product.variants.map((v: Variant) => Number(v.price ?? 0))) : 0
    const sizes = Array.from(new Set((product.variants ?? []).map((v: Variant) => v.size).filter(Boolean)))
    const colors = Array.from(new Set((product.variants ?? []).map((v: Variant) => v.color).filter(Boolean)))
    const currentVariant = (product.variants ?? []).find((v: Variant) => (selectedSize ? v.size === selectedSize : true) && (selectedColor ? v.color === selectedColor : true))
    const currentPrice = currentVariant ? currentVariant.price : minPrice

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left: Product gallery */}
                <div className="relative rounded-xl overflow-hidden border border-border bg-white shadow-lg">
                    <div className="aspect-square w-full bg-gray-50">
                        {cover === "/placeholder.svg" ? (
                            <div className="flex h-full w-full items-center justify-center">
                                <span className="text-6xl font-thin text-gray-300">No Image</span>
                            </div>
                        ) : (
                            <img
                                src={cover}
                                alt={product.name}
                                className="h-full w-full object-contain p-8 md:p-12 transition-transform duration-500 hover:scale-105"
                                loading="eager"
                            />
                        )}
                    </div>
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />
                </div>

                {/* Right: Content */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs bg-muted text-muted-foreground rounded-md px-2 py-1">DV.EV SPORT</span>
                        <div className="text-xs text-muted-foreground">Chia sẻ</div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                    <p className="text-sm text-muted-foreground mb-2">Thương hiệu: {product.brand || "—"}</p>
                    <p className="text-sm text-muted-foreground mb-6">{product.description}</p>

                    {/* Price */}
                    <div className="mb-6">
                        <div className="text-sm text-muted-foreground">Giá</div>
                        <div className="text-3xl font-bold text-primary">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(currentPrice)}</div>
                    </div>

                    {/* Size selector */}
                    {sizes.length > 0 && (
                        <div className="mb-4">
                            <div className="text-sm font-medium mb-2">Kích thước</div>
                            <div className="flex gap-2">
                                {sizes.map((s: string) => (
                                    <button
                                        key={s}
                                        onClick={() => setSelectedSize(s)}
                                        className={`h-9 w-9 rounded-md border ${selectedSize === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground'} transition-colors`}
                                        aria-label={`Size ${s}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color selector */}
                    {colors.length > 0 && (
                        <div className="mb-4">
                            <div className="text-sm font-medium mb-2">Màu sắc</div>
                            <div className="flex gap-2 flex-wrap">
                                {colors.map((c: string) => (
                                    <button
                                        key={c}
                                        onClick={() => setSelectedColor(c)}
                                        className={`px-3 h-9 rounded-md border ${selectedColor === c ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground'} transition-colors text-sm`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity and Buy */}
                    <div className="flex items-center gap-3 mt-4">
                        <div className="flex items-center gap-2">
                            <button aria-label="Giảm" className="h-9 w-9 border rounded-md" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                            <div className="px-3 py-2 border rounded-md min-w-12 text-center">{qty}</div>
                            <button aria-label="Tăng" className="h-9 w-9 border rounded-md" onClick={() => setQty(qty + 1)}>+</button>
                        </div>
                        {/* Wireframe-style pill button: soft vertical gray gradient */}
                        <button
                            className="px-6 py-2 rounded-xl font-semibold text-white shadow-sm border border-border bg-[linear-gradient(180deg,#9E9E9E_0%,#B3B3B3_100%)] hover:brightness-105"
                            onClick={async () => {
                                if (!currentVariant) {
                                    message.warning("Vui lòng chọn kích thước/màu trước khi thêm vào giỏ hàng")
                                    return
                                }
                                try {
                                    const token = typeof window !== "undefined" ? (localStorage.getItem("auth-token") || localStorage.getItem("access_token") || localStorage.getItem("token")) : undefined
                                    const res = await fetch("/api/me/cart/items", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json", Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                                        body: JSON.stringify({ productVariantId: currentVariant.id, quantity: qty }),
                                    })
                                    if (res.ok) {
                                        const body = await res.json().catch(() => ({}))
                                        message.success(body?.message || "Đã thêm vào giỏ hàng")
                                        await refreshCart()
                                    } else if (res.status === 401 || res.status === 403) {
                                        message.error("Bạn phải đăng nhập để thêm sản phẩm vào giỏ hàng")
                                    } else {
                                        const body = await res.json().catch(() => ({}))
                                        message.error(body?.message || "Thêm vào giỏ hàng thất bại")
                                    }
                                } catch (e) {
                                    message.error("Có lỗi xảy ra khi thêm vào giỏ hàng")
                                }
                            }}
                        >
                            Mua Ngay
                        </button>
                    </div>

                    {/* Info cards */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            {/* Text pill */}
                            <div className="flex-1">
                                <button
                                    type="button"
                                    className="w-full rounded-xl px-4 py-2 shadow-sm border border-border bg-[linear-gradient(180deg,#9E9E9E_0%,#B3B3B3_100%)] hover:brightness-105 text-white font-semibold text-sm sm:text-base"
                                    aria-label="Thử đồ bằng AR trên Web"
                                >
                                    Tải ảnh lên & xem mình mặc đẹp thế nào!
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Specs */}
            <div className="mt-12">
                <h3 className="text-xl font-semibold mb-3">Thông số</h3>
                <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-1">
                    <li>Công nghệ Dry-fit giúp mồ hôi khô nhanh</li>
                    <li>Thiết kế phù hợp nhiều thể lực, điều chỉnh linh hoạt</li>
                    <li>Vải co giãn 4 chiều</li>
                    <li>Chất liệu bền, mềm mại</li>
                </ul>
                <div className="mt-4">
                    <button className="px-4 py-2 border rounded-md">Xem thêm</button>
                </div>
            </div>
        </div>
    )
}
