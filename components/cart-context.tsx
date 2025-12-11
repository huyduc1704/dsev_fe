"use client"

import { createContext, useContext, useMemo, useState, useCallback, ReactNode } from "react"

export type CartItem = {
    id: string
    name: string
    price: number
    imageUrl?: string
    qty: number
}

type CartContextType = {
    open: boolean
    setOpen: (open: boolean) => void
    items: CartItem[]
    setItemsFromServer: (items: CartItem[]) => void
    refreshCart: () => Promise<void>
    addItem: (item: CartItem) => void
    updateQty: (id: string, qty: number) => void
    removeItem: (id: string) => void
    clear: () => void
    itemsCount: number
    subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false)
    const [items, setItems] = useState<CartItem[]>([])

    const setItemsFromServer = (newItems: CartItem[]) => setItems(newItems)

    const refreshCart = useCallback(async () => {
        try {
            const res = await fetch("/api/me/cart", { headers: { Accept: "application/json" }, cache: "no-store" })
            const data = await res.json().catch(async () => {
                const txt = await res.text().catch(() => "")
                try { return JSON.parse(txt) } catch { return {} }
            })
            
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
            
            setItems(items)
        } catch {
            // ignore
        }
    }, [])

    const addItem = (item: CartItem) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === item.id)
            if (existing) {
                return prev.map((i) =>
                    i.id === item.id ? { ...i, qty: i.qty + item.qty } : i
                )
            }
            return [...prev, item]
        })
    }

    const updateQty = (id: string, qty: number) => {
        if (qty < 1) return
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)))
    }

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id))
    }

    const clear = () => setItems([])

    const itemsCount = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])
    const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items])

    const value: CartContextType = {
        open,
        setOpen,
        items,
        setItemsFromServer,
        refreshCart,
        addItem,
        updateQty,
        removeItem,
        clear,
        itemsCount,
        subtotal,
    }

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = (): CartContextType => {
    const context = useContext(CartContext)
    if (!context) throw new Error("useCart must be used within CartProvider")
    return context
}