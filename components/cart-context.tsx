"use client"

import { createContext, useContext, useMemo, useState, ReactNode } from "react"

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

    const refreshCart = async () => {
        try {
            const res = await fetch("/api/me/cart", { headers: { Accept: "application/json" }, cache: "no-store" })
            const data = await res.json().catch(async () => {
                const txt = await res.text().catch(() => "")
                try { return JSON.parse(txt) } catch { return {} }
            })
            const items = (data?.data?.items || []).map((it: any) => ({
                id: it.id,
                name: it.productName,
                price: it.unitPrice,
                imageUrl: undefined,
                qty: it.quantity,
            }))
            setItems(items)
        } catch {
            // ignore
        }
    }

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