"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { message } from "antd"
import Image from "next/image"

type Address = {
    id: string
    fullName: string
    phoneNumber: string
    city: string
    ward: string
    street: string
}

type MeResponse = {
    data?: {
        id: string
        username: string
        email: string
        role?: string
        phoneNumber?: string
        addresses?: Address[]
        canManageUsers?: boolean
        canManageOrders?: boolean
    }
}

export default function CheckoutPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<MeResponse["data"] | null>(null)
    const [note, setNote] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [qrUrl, setQrUrl] = useState<string | null>(null)
    const [orderId, setOrderId] = useState<string | null>(null)
    const [orderNumber, setOrderNumber] = useState<string | null>(null)

    useEffect(() => {
        let ignore = false
        const loadMe = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await fetch("/api/auth/me", { headers: { Accept: "application/json" }, cache: "no-store" })
                if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                        message.error("Bạn phải đăng nhập để tiếp tục đặt hàng")
                    }
                    setError("Không thể tải thông tin người dùng")
                    return
                }
                const body = await res.json().catch(async () => {
                    const txt = await res.text().catch(() => "")
                    try { return JSON.parse(txt) } catch { return {} }
                })
                const data = body?.data ?? null
                if (!ignore) setUser(data)
            } catch (e) {
                console.error("Checkout: failed to load me", e)
                if (!ignore) setError("Có lỗi xảy ra khi tải thông tin")
            } finally {
                if (!ignore) setLoading(false)
            }
        }
        loadMe()
        return () => { ignore = true }
    }, [])

    const firstAddress: Address | undefined = (user?.addresses && user.addresses[0]) || undefined

    return (
        <div className="min-h-screen bg-background">
            <Navbar activeCategory="all" onCategoryChange={() => { }} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold mb-6">Thanh toán đơn hàng (SePay)</h1>

                {loading ? (
                    <div className="py-8 text-muted-foreground">Đang tải thông tin…</div>
                ) : error ? (
                    <div className="py-8 text-red-600">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left column: Receiver & Address */}
                        <section className="lg:col-span-2 border border-border rounded-lg p-4 bg-card">
                            <h2 className="text-lg font-semibold mb-3">Người nhận</h2>
                            <div className="space-y-2 text-sm">
                                <div><span className="text-muted-foreground">Tên đăng nhập:</span> <span className="font-medium">{user?.username || "—"}</span></div>
                            </div>
                            <div className="mt-6" />
                            <h2 className="text-lg font-semibold mb-3">Địa chỉ giao hàng</h2>
                            {firstAddress ? (
                                <div className="space-y-2 text-sm">
                                    <div><span className="text-muted-foreground">Họ và tên:</span> <span className="font-medium">{firstAddress.fullName}</span></div>
                                    <div><span className="text-muted-foreground">Số điện thoại:</span> <span className="font-medium">{firstAddress.phoneNumber || "—"}</span></div>
                                    <div><span className="text-muted-foreground">Thành phố:</span> <span className="font-medium">{firstAddress.city}</span></div>
                                    <div><span className="text-muted-foreground">Phường/Xã:</span> <span className="font-medium">{firstAddress.ward}</span></div>
                                    <div><span className="text-muted-foreground">Đường:</span> <span className="font-medium">{firstAddress.street}</span></div>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">Bạn chưa có địa chỉ. Vui lòng thêm địa chỉ trong hồ sơ.</div>
                            )}
                        </section>

                        {/* Right column: Notes & Action */}
                        <section className="border border-border rounded-lg p-4 bg-card">
                            <h2 className="text-lg font-semibold mb-3">Ghi chú</h2>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full border rounded-md p-2 bg-background"
                                rows={4}
                                placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                            />
                            <div className="mt-6">
                                <button
                                    disabled={submitting || !firstAddress || !!qrUrl}
                                    onClick={async () => {
                                        if (!firstAddress) { message.error("Bạn chưa có địa chỉ để đặt hàng"); return }
                                        try {
                                            setSubmitting(true)
                                            const orderRes = await fetch("/api/orders", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json", Accept: "application/json" },
                                                body: JSON.stringify({ addressId: firstAddress.id, note: note || undefined }),
                                            })
                                            if (!orderRes.ok) {
                                                const err = await orderRes.json().catch(() => ({}))
                                                message.error(err?.message || "Tạo đơn hàng thất bại")
                                                return
                                            }
                                            const order = await orderRes.json().catch(() => ({}))
                                            const oid = order?.data?.id
                                            const onum = order?.data?.orderNumber || null
                                            if (!oid) { message.error("Không lấy được mã đơn hàng"); return }
                                            setOrderId(oid)
                                            setOrderNumber(onum)

                                            const qrRes = await fetch("/api/sepay", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json", Accept: "application/json" },
                                                body: JSON.stringify({ orderId: oid }),
                                            })
                                            if (!qrRes.ok) {
                                                const err = await qrRes.json().catch(() => ({}))
                                                message.error(err?.message || "Tạo QR thanh toán thất bại")
                                                return
                                            }
                                            const qr = await qrRes.json().catch(() => ({}))
                                            const url = qr?.data?.qrUrl
                                            if (!url) { message.error("Không nhận được QR"); return }
                                            setQrUrl(url)
                                            message.success("Đã tạo đơn hàng và QR thanh toán")
                                        } catch (e) {
                                            console.error(e)
                                            message.error("Có lỗi khi xử lý đặt hàng")
                                        } finally {
                                            setSubmitting(false)
                                        }
                                    }}
                                    className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
                                >
                                    {submitting ? "Đang xử lý…" : "Xác nhận đặt hàng"}
                                </button>
                            </div>
                        </section>
                    </div>
                )}

                {qrUrl && (
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <section className="lg:col-span-2 border border-border rounded-lg p-4 bg-card">
                            <h3 className="text-lg font-semibold mb-2">Quét mã để thanh toán</h3>
                            <p className="text-sm text-muted-foreground mb-4">Hệ thống sẽ nhận webhook từ SePay sau khi bạn thanh toán thành công.</p>
                            <div className="flex flex-col items-center gap-4">
                                <Image src={qrUrl} alt="QR thanh toán" width={300} height={300} />
                                <a className="text-primary underline" href={qrUrl} target="_blank" rel="noreferrer">Mở QR trong tab mới</a>
                            </div>
                        </section>
                        <section className="border border-border rounded-lg p-4 bg-card">
                            <h3 className="text-lg font-semibold mb-2">Thông tin đơn hàng</h3>
                            <div className="text-sm space-y-2">
                                <div><span className="text-muted-foreground">Mã đơn hàng:</span> <span className="font-medium">{orderNumber || orderId || "—"}</span></div>
                                <div className="text-muted-foreground">Trạng thái hiện tại: <span className="font-medium">PENDING</span></div>
                                <div className="text-muted-foreground">Sau thanh toán thành công, trạng thái sẽ được cập nhật tự động.</div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <a href="/checkout/success" className="flex-1 px-4 py-2 rounded-md bg-green-600 text-white text-center">Đã thanh toán</a>
                                <a href="/checkout/failure" className="flex-1 px-4 py-2 rounded-md bg-red-600 text-white text-center">Hủy/Thất bại</a>
                            </div>
                        </section>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    )
}
