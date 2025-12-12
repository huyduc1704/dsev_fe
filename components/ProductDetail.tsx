"use client"

import { useEffect, useState, useMemo } from "react"
import { useCart } from "./cart-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Minus, Plus, ShoppingCart, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

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
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
    const { refreshCart } = useCart() as any
    const { toast } = useToast()

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

    // Reset selections khi product thay đổi
    useEffect(() => {
        setSelectedSize("")
        setSelectedColor("")
        setQty(1)
        setSelectedImageIndex(0)
    }, [product?.id])

    // Tính toán các options có sẵn dựa trên selection
    const availableVariants = useMemo(() => {
        if (!product?.variants) return []
        return product.variants.filter((v) => {
            if (selectedSize && selectedColor) {
                return v.size === selectedSize && v.color === selectedColor
            }
            if (selectedSize) {
                return v.size === selectedSize
            }
            if (selectedColor) {
                return v.color === selectedColor
            }
            return true
        })
    }, [product, selectedSize, selectedColor])

    // Lấy các size có sẵn
    // Logic: Luôn hiển thị tất cả size có stock > 0, không filter theo color đã chọn
    // Chỉ filter theo color khi cả size và color đều đã được chọn (để validate)
    const availableSizes = useMemo(() => {
        if (!product?.variants) return []
        // Luôn hiển thị tất cả size có stock > 0, để user có thể đổi size bất cứ lúc nào
        const allSizes = Array.from(
            new Set(
                product.variants
                    .filter((v) => v.stockQuantity > 0)
                    .map((v) => v.size)
                    .filter(Boolean)
            )
        )
        return allSizes
    }, [product])

    // Lấy các color có sẵn (filter theo size nếu đã chọn)
    const availableColors = useMemo(() => {
        if (!product?.variants) return []
        // Nếu đã chọn size, chỉ hiển thị color có variant với size đó
        // Nếu chưa chọn size, hiển thị tất cả color có stock > 0
        const variants = selectedSize
            ? product.variants.filter((v) => v.size === selectedSize && v.stockQuantity > 0)
            : product.variants.filter((v) => v.stockQuantity > 0)
        return Array.from(new Set(variants.map((v) => v.color).filter(Boolean)))
    }, [product, selectedSize])

    // Tìm variant hiện tại (chỉ khi cả size và color đã được chọn)
    const currentVariant = useMemo(() => {
        if (!selectedSize || !selectedColor || !product?.variants) return null
        return product.variants.find(
            (v) => v.size === selectedSize && v.color === selectedColor
        ) || null
    }, [product, selectedSize, selectedColor])

    // Tính giá hiện tại
    const currentPrice = useMemo(() => {
        if (currentVariant) return currentVariant.price
        if (product?.variants?.length) {
            return Math.min(...product.variants.map((v) => Number(v.price ?? 0)))
        }
        return 0
    }, [currentVariant, product])

    // Khi chọn size, reset color nếu color không có sẵn với size đó
    const handleSizeChange = (size: string) => {
        setSelectedSize(size)
        if (selectedColor) {
            const hasColorWithSize = product?.variants.some(
                (v) => v.size === size && v.color === selectedColor && v.stockQuantity > 0
            )
            if (!hasColorWithSize) {
                setSelectedColor("")
            }
        }
    }

    // Khi chọn color, reset size nếu size không có sẵn với color đó
    const handleColorChange = (color: string) => {
        setSelectedColor(color)
        if (selectedSize) {
            const hasSizeWithColor = product?.variants.some(
                (v) => v.size === selectedSize && v.color === color && v.stockQuantity > 0
            )
            if (!hasSizeWithColor) {
                setSelectedSize("")
            }
        }
    }

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

    const images = product.images && product.images.length > 0 ? product.images : ["/placeholder.svg"]
    const currentImage = images[selectedImageIndex] || images[0] || "/placeholder.svg"
    
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
    }

    const handlePreviousImage = () => {
        setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    }

    const handleNextImage = () => {
        setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    }

    const handleAddToCart = async () => {
        if (!currentVariant) {
            toast({
                title: "Vui lòng chọn variant",
                description: "Bạn cần chọn cả kích thước và màu sắc trước khi thêm vào giỏ hàng",
                variant: "destructive",
            })
            return
        }

        if (currentVariant.stockQuantity < qty) {
            toast({
                title: "Không đủ hàng",
                description: `Chỉ còn ${currentVariant.stockQuantity} sản phẩm trong kho`,
                variant: "destructive",
            })
            return
        }

        try {
            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem("auth-token") ||
                      localStorage.getItem("access_token") ||
                      localStorage.getItem("token")
                    : undefined

            const res = await fetch("/api/me/cart/items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ productVariantId: currentVariant.id, quantity: qty }),
            })

            if (res.ok) {
                const body = await res.json().catch(() => ({}))
                toast({
                    title: "Thành công",
                    description: body?.message || "Đã thêm vào giỏ hàng",
                })
                await refreshCart()
            } else if (res.status === 401 || res.status === 403) {
                toast({
                    title: "Cần đăng nhập",
                    description: "Bạn phải đăng nhập để thêm sản phẩm vào giỏ hàng",
                    variant: "destructive",
                })
            } else {
                const body = await res.json().catch(() => ({}))
                toast({
                    title: "Lỗi",
                    description: body?.message || "Thêm vào giỏ hàng thất bại",
                    variant: "destructive",
                })
            }
        } catch (e) {
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi thêm vào giỏ hàng",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left: Product gallery */}
                <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative rounded-xl overflow-hidden border border-border bg-card shadow-lg">
                        <div className="aspect-square w-full bg-muted relative">
                            {currentImage === "/placeholder.svg" ? (
                                <div className="flex h-full w-full items-center justify-center">
                                    <span className="text-6xl font-thin text-muted-foreground/30">No Image</span>
                                </div>
                            ) : (
                                <>
                                    <Image
                                        src={currentImage}
                                        alt={`${product.name} - Ảnh ${selectedImageIndex + 1}`}
                                        fill
                                        className="object-contain p-8 md:p-12 transition-opacity duration-300"
                                        loading="eager"
                                        priority={selectedImageIndex === 0}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    {/* Navigation buttons (only show if more than 1 image) */}
                                    {images.length > 1 && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 h-10 w-10 rounded-full shadow-md"
                                                onClick={handlePreviousImage}
                                                aria-label="Ảnh trước"
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 h-10 w-10 rounded-full shadow-md"
                                                onClick={handleNextImage}
                                                aria-label="Ảnh sau"
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </Button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Thumbnail Gallery (only show if more than 1 image) */}
                    {images.length > 1 && (
                        <div className="relative">
                            <div 
                                className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory"
                                style={{
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: 'hsl(var(--border)) transparent',
                                }}
                            >
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                            selectedImageIndex === index
                                                ? "border-primary ring-2 ring-primary ring-offset-2"
                                                : "border-border hover:border-primary/50"
                                        }`}
                                        aria-label={`Xem ảnh ${index + 1}`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`${product.name} thumbnail ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="80px"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Content */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                            {product.brand || "DV.EV SPORT"}
                        </Badge>
                    </div>

                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                        <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                    </div>

                    {/* Price */}
                    <div className="border-b border-border pb-6">
                        <div className="text-sm text-muted-foreground mb-1">Giá</div>
                        <div className="text-3xl font-bold text-primary">{formatPrice(currentPrice)}</div>
                        {currentVariant && currentVariant.stockQuantity > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                                Còn {currentVariant.stockQuantity} sản phẩm
                            </div>
                        )}
                    </div>

                    {/* Size selector */}
                    {availableSizes.length > 0 && (
                        <div>
                            <div className="text-sm font-medium mb-3 flex items-center gap-2">
                                Kích thước
                                {selectedSize && (
                                    <Badge variant="outline" className="text-xs">
                                        {selectedSize}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {availableSizes.map((s: string) => {
                                    const isSelected = selectedSize === s
                                    return (
                                        <Button
                                            key={s}
                                            variant={isSelected ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleSizeChange(s)}
                                            className="h-10 w-10 p-0"
                                            aria-label={`Size ${s}`}
                                        >
                                            {s}
                                        </Button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Color selector */}
                    {availableColors.length > 0 && (
                        <div>
                            <div className="text-sm font-medium mb-3 flex items-center gap-2">
                                Màu sắc
                                {selectedColor && (
                                    <Badge variant="outline" className="text-xs">
                                        {selectedColor}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {availableColors.map((c: string) => {
                                    const isSelected = selectedColor === c
                                    return (
                                        <Button
                                            key={c}
                                            variant={isSelected ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleColorChange(c)}
                                            className="h-9 px-4"
                                        >
                                            {c}
                                        </Button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Warning khi chưa chọn variant */}
                    {(!selectedSize || !selectedColor) && (
                        <div className="flex items-start gap-2 p-3 bg-muted/50 border border-border rounded-lg">
                            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-sm text-muted-foreground">
                                {!selectedSize && !selectedColor
                                    ? "Vui lòng chọn kích thước và màu sắc"
                                    : !selectedSize
                                    ? "Vui lòng chọn kích thước"
                                    : "Vui lòng chọn màu sắc"}
                            </p>
                        </div>
                    )}

                    {/* Quantity and Buy */}
                    <div className="space-y-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-4">
                            <div className="text-sm font-medium">Số lượng</div>
                            <div className="flex items-center gap-2 border border-input rounded-md">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-none"
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    disabled={qty <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <div className="px-4 py-2 min-w-12 text-center font-medium">{qty}</div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-none"
                                    onClick={() => {
                                        const maxQty = currentVariant?.stockQuantity || 999
                                        setQty(Math.min(maxQty, qty + 1))
                                    }}
                                    disabled={currentVariant ? qty >= currentVariant.stockQuantity : false}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="w-full h-12 text-base font-semibold"
                            onClick={handleAddToCart}
                            disabled={!currentVariant || (currentVariant?.stockQuantity || 0) < qty}
                        >
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            Thêm vào giỏ hàng
                        </Button>
                    </div>

                    {/* Info cards */}
                    <div className="mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12"
                            aria-label="Thử đồ bằng AR trên Web"
                        >
                            Tải ảnh lên & xem mình mặc đẹp thế nào!
                        </Button>
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
            </div>
        </div>
    )
}
