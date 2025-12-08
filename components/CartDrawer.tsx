"use client"

import { Drawer, Button, InputNumber, message } from "antd"
import Image from "next/image"
import { useCart } from "./cart-context"
import { useEffect, useRef } from "react"

// Helper: lấy token từ localStorage
const getToken = () => {
    if (typeof window === "undefined") return null
    return (
        localStorage.getItem("auth-token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token")
    )
}

export default function CartDrawer() {
    const { open, setOpen, items, setItemsFromServer, updateQty, removeItem, subtotal } = useCart()
    const fetchedOnceRef = useRef(false)

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

                // 🔥 SỬA ĐÚNG CHUẨN
                if (token) headers["Authorization"] = `Bearer ${token}`

                const res = await fetch("/api/me/cart", {
                    headers,
                    cache: "no-store",
                })

                if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                        message.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại")
                        setOpen(false)
                    } else {
                        message.error("Không thể tải giỏ hàng")
                    }
                    return
                }

                const data = await res.json()

                const serverItems = (data?.data?.items || []).map((it: any) => ({
                    id: it.id,
                    name: it.productName,
                    price: it.unitPrice,
                    imageUrl: it.imageUrl || it.thumbnail || undefined,
                    qty: it.quantity,
                }))

                setItemsFromServer(serverItems)
            } catch (err) {
                console.error("Lỗi tải giỏ hàng:", err)
                message.error("Có lỗi xảy ra khi tải giỏ hàng")
            }
        }

        fetchCart()
    }, [open, setItemsFromServer, setOpen])

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
                message.success("Cập nhật số lượng thành công")
            } else {
                const error = await res.json().catch(() => ({}))
                message.error(error.message || "Cập nhật thất bại")
            }
        } catch (err) {
            message.error("Lỗi kết nối server")
        }
    }

    return (
        <Drawer
            title="Giỏ hàng của bạn"
            placement="right"
            open={open}
            onClose={() => setOpen(false)}
            width={420}
            className="ant-drawer-cart"
        >
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                    {items.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            Giỏ hàng trống
                        </div>
                    ) : (
                        items.map((it) => (
                            <div key={it.id} className="flex gap-3 border rounded-lg p-3">
                                <div className="w-20 h-20 shrink-0 relative rounded overflow-hidden bg-muted">
                                    {it.imageUrl ? (
                                        <Image
                                            src={it.imageUrl}
                                            alt={it.name}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-xs text-gray-400">
                                            No image
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">{it.name}</h4>
                                    <p className="text-sm font-semibold text-primary mt-1">
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(it.price)}
                                    </p>

                                    <div className="flex items-center gap-2 mt-2">
                                        <InputNumber
                                            min={1}
                                            value={it.qty}
                                            onChange={(v) => v && handleUpdateQty(it.id, Number(v))}
                                            size="small"
                                            className="w-20"
                                        />
                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            onClick={() => removeItem(it.id)}
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold mb-4">
                        <span>Tạm tính</span>
                        <span>
                            {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                            }).format(subtotal)}
                        </span>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        block
                        onClick={() => {
                            setOpen(false)
                            window.location.href = "/checkout"
                        }}
                    >
                        Tiến hành đặt hàng
                    </Button>
                </div>
            </div>
        </Drawer>
    )
}
