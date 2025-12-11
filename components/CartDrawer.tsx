"use client"

import Image from "next/image"
import { useCart } from "./cart-context"
import { useEffect, useRef, useState } from "react"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
    DrawerDescription,
} from "./ui/drawer"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Minus, Plus, Trash2, ShoppingBag, X } from "lucide-react"
import { Input } from "./ui/input"

// Helper: lấy token từ localStorage
const getToken = () => {
    if (typeof window === "undefined") return null
    return (
        localStorage.getItem("auth-token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token")
    )
}

// Component InputNumber đơn giản
function QuantityInput({
    value,
    onChange,
    min = 1,
}: {
    value: number
    onChange: (value: number) => void
    min?: number
}) {
    const [localValue, setLocalValue] = useState(value.toString())

    useEffect(() => {
        setLocalValue(value.toString())
    }, [value])

    const handleChange = (newValue: string) => {
        const num = parseInt(newValue) || min
        const clamped = Math.max(min, num)
        setLocalValue(clamped.toString())
        onChange(clamped)
    }

    const handleBlur = () => {
        const num = parseInt(localValue) || min
        const clamped = Math.max(min, num)
        setLocalValue(clamped.toString())
        onChange(clamped)
    }

    const increment = () => {
        onChange(value + 1)
    }

    const decrement = () => {
        if (value > min) {
            onChange(value - 1)
        }
    }

    return (
        <div className="flex items-center gap-1 border border-input rounded-md bg-background overflow-hidden">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none hover:bg-muted"
                onClick={decrement}
                disabled={value <= min}
            >
                <Minus className="h-3 w-3" />
            </Button>
            <Input
                type="number"
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
                className="h-8 w-12 border-0 text-center p-0 focus-visible:ring-0"
                min={min}
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none hover:bg-muted"
                onClick={increment}
            >
                <Plus className="h-3 w-3" />
            </Button>
        </div>
    )
}

export default function CartDrawer() {
    const { open, setOpen, items, setItemsFromServer, updateQty, removeItem, subtotal } = useCart()
    const fetchedOnceRef = useRef(false)
    const { toast } = useToast()

    useEffect(() => {
        if (!open) {
            fetchedOnceRef.current = false
            return
        }
        if (fetchedOnceRef.current) return
        fetchedOnceRef.current = true

        const fetchCart = async () => {
            try {
                const token = getToken()

                const headers: HeadersInit = {
                    Accept: "application/json",
                }

                if (token) headers["Authorization"] = `Bearer ${token}`

                const res = await fetch("/api/me/cart", {
                    headers,
                    cache: "no-store",
                })

                if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                        toast({
                            title: "Phiên đăng nhập hết hạn",
                            description: "Vui lòng đăng nhập lại",
                            variant: "destructive",
                        })
                        setOpen(false)
                    } else {
                        toast({
                            title: "Lỗi",
                            description: "Không thể tải giỏ hàng",
                            variant: "destructive",
                        })
                    }
                    return
                }

                const data = await res.json()

                // Nếu không có imageUrl, cần fetch từ product detail
                // Fetch product list để match productVariantId với variants
                let productsMap: Map<string, any> = new Map()
                const cartItems = data?.data?.items || []

                if (cartItems.length > 0) {
                    try {
                        // Fetch product list để lấy thông tin products và variants
                        const productsRes = await fetch("/api/products/active", {
                            headers: { Accept: "application/json" },
                            cache: "no-store",
                        })
                        if (productsRes.ok) {
                            const productsData = await productsRes.json().catch(() => ({}))
                            const products = productsData?.data || productsData || []

                            // Tạo map: variantId -> product (để lấy images)
                            products.forEach((product: any) => {
                                if (product.variants && Array.isArray(product.variants)) {
                                    product.variants.forEach((variant: any) => {
                                        if (variant.id) {
                                            productsMap.set(variant.id, product)
                                        }
                                    })
                                }
                            })
                        }
                    } catch (err) {
                        console.error("Error fetching products for images:", err)
                    }
                }

                // Map items với imageUrl từ product
                const items = cartItems.map((it: any) => {
                    let imageUrl = it.imageUrl || it.thumbnail || it.productImageUrl || it.image

                    // Nếu không có imageUrl, lấy từ product qua productVariantId
                    if (!imageUrl && it.productVariantId) {
                        const product = productsMap.get(it.productVariantId)
                        if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
                            imageUrl = product.images[0]
                        }
                    }

                    return {
                        id: it.id,
                        name: it.productName,
                        price: it.unitPrice,
                        imageUrl: imageUrl || undefined,
                        qty: it.quantity,
                    }
                })

                setItemsFromServer(items)
            } catch (err) {
                console.error("Lỗi tải giỏ hàng:", err)
                toast({
                    title: "Lỗi",
                    description: "Có lỗi xảy ra khi tải giỏ hàng",
                    variant: "destructive",
                })
            }
        }

        fetchCart()
    }, [open, setItemsFromServer, setOpen, toast])

    // ----------------------
    // Update số lượng
    // ----------------------
    const handleUpdateQty = async (id: string, qty: number) => {
        try {
            const token = getToken()

            const headers: HeadersInit = {
                "Content-Type": "application/json",
                Accept: "application/json",
            }

            if (token) headers["Authorization"] = `Bearer ${token}`

            const res = await fetch(`/api/me/cart/items/${id}`, {
                method: "PATCH",
                headers,
                body: JSON.stringify({ quantity: qty }),
            })

            if (res.ok) {
                updateQty(id, qty)
                toast({
                    title: "Thành công",
                    description: "Cập nhật số lượng thành công",
                })
            } else {
                const error = await res.json().catch(() => ({}))
                toast({
                    title: "Lỗi",
                    description: error.message || "Cập nhật thất bại",
                    variant: "destructive",
                })
            }
        } catch (err) {
            toast({
                title: "Lỗi",
                description: "Lỗi kết nối server",
                variant: "destructive",
            })
        }
    }

    const handleRemoveItem = async (id: string) => {
        try {
            const token = getToken()
            const headers: HeadersInit = {
                Accept: "application/json",
            }
            if (token) headers["Authorization"] = `Bearer ${token}`

            const res = await fetch(`/api/me/cart/items/${id}`, {
                method: "DELETE",
                headers,
            })

            if (res.ok) {
                removeItem(id)
                toast({
                    title: "Đã xóa",
                    description: "Sản phẩm đã được xóa khỏi giỏ hàng",
                })
            } else {
                toast({
                    title: "Lỗi",
                    description: "Không thể xóa sản phẩm",
                    variant: "destructive",
                })
            }
        } catch (err) {
            removeItem(id) // Fallback: xóa ở client nếu API fail
            toast({
                title: "Đã xóa",
                description: "Sản phẩm đã được xóa khỏi giỏ hàng",
            })
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    return (
        <Drawer open={open} onOpenChange={setOpen} direction="right">
            <DrawerContent className="h-full w-full sm:max-w-md">
                <DrawerHeader className="border-b border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <DrawerTitle className="text-xl font-semibold">Giỏ hàng của bạn</DrawerTitle>
                            <DrawerDescription className="mt-1">
                                {items.length > 0 ? `${items.length} sản phẩm` : "Giỏ hàng trống"}
                            </DrawerDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpen(false)}
                            className="rounded-full"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DrawerHeader>

                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                                <p className="text-lg font-medium text-foreground mb-2">
                                    Giỏ hàng trống
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
                                </p>
                            </div>
                        ) : (
                            items.map((it) => (
                                <div
                                    key={it.id}
                                    className="flex gap-3 p-4 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                    <div className="w-20 h-20 shrink-0 relative rounded-lg overflow-hidden bg-muted border border-border">
                                        {it.imageUrl ? (
                                            <Image
                                                src={it.imageUrl}
                                                alt={it.name}
                                                fill
                                                sizes="80px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                                                <ShoppingBag className="h-6 w-6" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                                        <div>
                                            <h4 className="font-semibold text-sm text-card-foreground line-clamp-2">
                                                {it.name}
                                            </h4>
                                            <p className="text-base font-bold text-primary mt-1">
                                                {formatPrice(it.price)}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 mt-auto">
                                            <QuantityInput
                                                value={it.qty}
                                                onChange={(qty) => handleUpdateQty(it.id, qty)}
                                                min={1}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveItem(it.id)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {items.length > 0 && (
                        <>
                            <Separator />
                            <DrawerFooter className="border-t border-border bg-background">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-lg">
                                        <span className="font-medium text-foreground">Tạm tính</span>
                                        <span className="font-bold text-primary text-xl">
                                            {formatPrice(subtotal)}
                                        </span>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="w-full h-11 text-base font-semibold"
                                        onClick={() => {
                                            setOpen(false)
                                            window.location.href = "/checkout"
                                        }}
                                    >
                                        <ShoppingBag className="h-4 w-4 mr-2" />
                                        Tiến hành đặt hàng
                                    </Button>
                                </div>
                            </DrawerFooter>
                        </>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    )
}
