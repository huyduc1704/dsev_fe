"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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
        fullName?: string
        city?: string
        ward?: string
        street?: string
        addresses?: Address[]
        canManageUsers?: boolean
        canManageOrders?: boolean
    }
}

type Province = {
    name: string
    code: number
    division_type: string
    codename: string
    phone_code: number
}

type Ward = {
    name: string
    code: number
    division_type: string
    codename: string
    province_code: number
}

export default function CheckoutPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<MeResponse["data"] | null>(null)
    
    // Form fields - có thể chỉnh sửa
    const [fullName, setFullName] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [city, setCity] = useState("")
    const [ward, setWard] = useState("")
    const [street, setStreet] = useState("")
    const [note, setNote] = useState("")
    
    // Province và Ward data
    const [provinces, setProvinces] = useState<Province[]>([])
    const [wards, setWards] = useState<Ward[]>([])
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null)
    const [loadingProvinces, setLoadingProvinces] = useState(false)
    const [loadingWards, setLoadingWards] = useState(false)
    
    const [submitting, setSubmitting] = useState(false)
    const [qrUrl, setQrUrl] = useState<string | null>(null)
    const [orderId, setOrderId] = useState<string | null>(null)
    const [orderNumber, setOrderNumber] = useState<string | null>(null)
    const [paymentStatus, setPaymentStatus] = useState<"PENDING" | "SUCCESS" | null>(null)
    const [checkingPayment, setCheckingPayment] = useState(false)

    // Load provinces
    useEffect(() => {
        let ignore = false
        const loadProvinces = async () => {
            try {
                setLoadingProvinces(true)
                const res = await fetch("https://provinces.open-api.vn/api/v2/p/?search=", {
                    headers: { Accept: "application/json" },
                })
                if (res.ok) {
                    const data = await res.json().catch(() => [])
                    if (!ignore) setProvinces(Array.isArray(data) ? data : [])
                }
            } catch (e) {
                console.error("Failed to load provinces:", e)
            } finally {
                if (!ignore) setLoadingProvinces(false)
            }
        }
        loadProvinces()
        return () => { ignore = true }
    }, [])

    // Store ward name from user profile để match sau khi wards load
    const [wardNameFromProfile, setWardNameFromProfile] = useState<string>("")

    // Poll payment status sau khi có orderId
    useEffect(() => {
        if (!orderId || paymentStatus === "SUCCESS") return

        let intervalId: NodeJS.Timeout | null = null
        let ignore = false

        const checkPaymentStatus = async () => {
            try {
                const res = await fetch(`/api/payment/status?orderId=${orderId}`, {
                    headers: { Accept: "application/json" },
                    cache: "no-store",
                })
                if (res.ok) {
                    const data = await res.json().catch(() => ({}))
                    const status = data?.data?.paymentStatus
                    if (!ignore && status) {
                        setPaymentStatus(status)
                        if (status === "SUCCESS") {
                            // Redirect to success page sau 1 giây
                            setTimeout(() => {
                                window.location.href = "/checkout/success"
                            }, 1000)
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to check payment status:", e)
            }
        }

        // Check ngay lập tức
        checkPaymentStatus()

        // Poll mỗi 3 giây
        intervalId = setInterval(() => {
            if (!ignore) {
                checkPaymentStatus()
            }
        }, 3000)

        return () => {
            ignore = true
            if (intervalId) clearInterval(intervalId)
        }
    }, [orderId, paymentStatus])

    // Load wards when province is selected
    useEffect(() => {
        if (!selectedProvinceCode) {
            setWards([])
            setWard("")
            return
        }
        let ignore = false
        const loadWards = async () => {
            try {
                setLoadingWards(true)
                const res = await fetch(`https://provinces.open-api.vn/api/v2/w/?province=${selectedProvinceCode}&search=`, {
                    headers: { Accept: "application/json" },
                })
                if (res.ok) {
                    const data = await res.json().catch(() => [])
                    if (!ignore) {
                        const wardsData = Array.isArray(data) ? data : []
                        setWards(wardsData)
                        
                        // Nếu có ward name từ profile, tìm và set
                        if (wardNameFromProfile && wardsData.length > 0) {
                            const matchedWard = wardsData.find((w) => w.name === wardNameFromProfile)
                            if (matchedWard) {
                                setWard(matchedWard.name)
                            } else {
                                setWard("")
                            }
                        } else {
                            // Reset ward khi đổi province
                            setWard("")
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to load wards:", e)
            } finally {
                if (!ignore) setLoadingWards(false)
            }
        }
        loadWards()
        return () => { ignore = true }
    }, [selectedProvinceCode, wardNameFromProfile])

    // Load user profile và pre-fill form
    useEffect(() => {
        let ignore = false
        const loadMe = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await fetch("/api/me", { headers: { Accept: "application/json" }, cache: "no-store" })
                if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                        toast({
                            title: "Lỗi",
                            description: "Bạn phải đăng nhập để tiếp tục đặt hàng",
                            variant: "destructive",
                        })
                    }
                    setError("Không thể tải thông tin người dùng")
                    return
                }
                const body = await res.json().catch(async () => {
                    const txt = await res.text().catch(() => "")
                    try { return JSON.parse(txt) } catch { return {} }
                })
                const data = body?.data ?? null
                if (!ignore) {
                    setUser(data)
                    // Pre-fill form từ user profile hoặc address đầu tiên
                    const firstAddress: Address | undefined = (data?.addresses && data.addresses[0]) || undefined
                    const cityName = firstAddress?.city || data?.city || ""
                    const wardName = firstAddress?.ward || data?.ward || ""
                    
                    if (firstAddress) {
                        setFullName(firstAddress.fullName || data?.fullName || "")
                        setPhoneNumber(firstAddress.phoneNumber || data?.phoneNumber || "")
                        setCity(cityName)
                        setWardNameFromProfile(wardName) // Lưu ward name để match sau khi wards load
                        setStreet(firstAddress.street || data?.street || "")
                    } else if (data) {
                        // Nếu không có address, pre-fill từ user profile
                        setFullName(data.fullName || "")
                        setPhoneNumber(data.phoneNumber || "")
                        setCity(cityName)
                        setWardNameFromProfile(wardName) // Lưu ward name để match sau khi wards load
                        setStreet(data.street || "")
                    }

                    // Tìm và set province code từ city name
                    if (cityName && provinces.length > 0) {
                        const matchedProvince = provinces.find((p) => p.name === cityName)
                        if (matchedProvince) {
                            setSelectedProvinceCode(matchedProvince.code)
                        }
                    }
                }
            } catch (e) {
                console.error("Checkout: failed to load me", e)
                if (!ignore) setError("Có lỗi xảy ra khi tải thông tin")
            } finally {
                if (!ignore) setLoading(false)
            }
        }
        // Chờ provinces load xong mới load user để có thể match province code
        if (provinces.length > 0 || loadingProvinces === false) {
            loadMe()
        }
        return () => { ignore = true }
    }, [toast, provinces, loadingProvinces])

    return (
        <div className="min-h-screen bg-background">
            <Navbar activeCategory="all" onCategoryChange={() => { }} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold mb-6">Thanh toán đơn hàng (SePay)</h1>

                {loading ? (
                    <div className="py-8 text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tải thông tin…
                    </div>
                ) : error ? (
                    <div className="py-8 text-destructive">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left column: Form thông tin người nhận */}
                        <section className="lg:col-span-2 border border-border rounded-lg p-6 bg-card">
                            <h2 className="text-xl font-semibold mb-6">Thông tin người nhận</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Họ và tên *</Label>
                                    <Input
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Nhập họ và tên"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Số điện thoại *</Label>
                                    <Input
                                        id="phoneNumber"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="Nhập số điện thoại"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">Tỉnh/Thành phố *</Label>
                                        <Select
                                            value={selectedProvinceCode?.toString() || ""}
                                            onValueChange={(value) => {
                                                const code = parseInt(value)
                                                const selectedProvince = provinces.find((p) => p.code === code)
                                                if (selectedProvince) {
                                                    setSelectedProvinceCode(code)
                                                    setCity(selectedProvince.name)
                                                    setWard("") // Reset ward khi đổi province
                                                    setWardNameFromProfile("") // Reset ward name from profile
                                                }
                                            }}
                                            disabled={loadingProvinces}
                                        >
                                            <SelectTrigger id="city" className="w-full">
                                                <SelectValue placeholder={loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {provinces.map((province) => (
                                                    <SelectItem key={province.code} value={province.code.toString()}>
                                                        {province.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ward">Phường/Xã *</Label>
                                        <Select
                                            value={wards.find((w) => w.name === ward)?.code?.toString() || ""}
                                            onValueChange={(value) => {
                                                const code = parseInt(value)
                                                const selectedWard = wards.find((w) => w.code === code)
                                                if (selectedWard) {
                                                    setWard(selectedWard.name)
                                                }
                                            }}
                                            disabled={!selectedProvinceCode || loadingWards}
                                        >
                                            <SelectTrigger id="ward" className="w-full">
                                                <SelectValue 
                                                    placeholder={
                                                        !selectedProvinceCode 
                                                            ? "Chọn tỉnh/thành phố trước" 
                                                            : loadingWards 
                                                            ? "Đang tải..." 
                                                            : "Chọn phường/xã"
                                                    } 
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {wards.map((w) => (
                                                    <SelectItem key={w.code} value={w.code.toString()}>
                                                        {w.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="street">Đường/Số nhà *</Label>
                                    <Input
                                        id="street"
                                        value={street}
                                        onChange={(e) => setStreet(e.target.value)}
                                        placeholder="Nhập đường/số nhà"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="note">Ghi chú (không bắt buộc)</Label>
                                    <Textarea
                                        id="note"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Ghi chú cho đơn hàng"
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Right column: Tóm tắt & Action */}
                        <section className="border border-border rounded-lg p-6 bg-card">
                            <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>
                            <div className="space-y-4">
                                <div className="text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tên người nhận:</span>
                                        <span className="font-medium">{fullName || "—"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Số điện thoại:</span>
                                        <span className="font-medium">{phoneNumber || "—"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Địa chỉ:</span>
                                        <span className="font-medium text-right">{street ? `${street}, ${ward}, ${city}` : "—"}</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-border">
                                    <Button
                                        disabled={submitting || !fullName || !phoneNumber || !city || !ward || !street || !!qrUrl}
                                        onClick={async () => {
                                            if (!fullName || !phoneNumber || !city || !ward || !street) {
                                                toast({
                                                    title: "Lỗi",
                                                    description: "Vui lòng điền đầy đủ thông tin",
                                                    variant: "destructive",
                                                })
                                                return
                                            }
                                            try {
                                                setSubmitting(true)
                                                const orderRes = await fetch("/api/orders", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                                                    body: JSON.stringify({
                                                        fullName,
                                                        phoneNumber,
                                                        city,
                                                        ward,
                                                        street,
                                                        note: note || undefined,
                                                        // addressId có thể để undefined nếu không dùng
                                                        addressId: user?.addresses?.[0]?.id || undefined,
                                                    }),
                                                })
                                                if (!orderRes.ok) {
                                                    const err = await orderRes.json().catch(() => ({}))
                                                    toast({
                                                        title: "Lỗi",
                                                        description: err?.message || "Tạo đơn hàng thất bại",
                                                        variant: "destructive",
                                                    })
                                                    return
                                                }
                                                const order = await orderRes.json().catch(() => ({}))
                                                const oid = order?.data?.id
                                                const onum = order?.data?.orderNumber || null
                                                if (!oid) {
                                                    toast({
                                                        title: "Lỗi",
                                                        description: "Không lấy được mã đơn hàng",
                                                        variant: "destructive",
                                                    })
                                                    return
                                                }
                                                setOrderId(oid)
                                                setOrderNumber(onum)

                                                const qrRes = await fetch("/api/sepay", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                                                    body: JSON.stringify({ orderId: oid }),
                                                })
                                                if (!qrRes.ok) {
                                                    const err = await qrRes.json().catch(() => ({}))
                                                    toast({
                                                        title: "Lỗi",
                                                        description: err?.message || "Tạo QR thanh toán thất bại",
                                                        variant: "destructive",
                                                    })
                                                    return
                                                }
                                                const qr = await qrRes.json().catch(() => ({}))
                                                const url = qr?.data?.qrUrl
                                                if (!url) {
                                                    toast({
                                                        title: "Lỗi",
                                                        description: "Không nhận được QR",
                                                        variant: "destructive",
                                                    })
                                                    return
                                                }
                                                setQrUrl(url)
                                                setPaymentStatus("PENDING")
                                                toast({
                                                    title: "Thành công",
                                                    description: "Đã tạo đơn hàng và QR thanh toán. Vui lòng quét mã để thanh toán.",
                                                })
                                            } catch (e) {
                                                console.error(e)
                                                toast({
                                                    title: "Lỗi",
                                                    description: "Có lỗi khi xử lý đặt hàng",
                                                    variant: "destructive",
                                                })
                                            } finally {
                                                setSubmitting(false)
                                            }
                                        }}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Đang xử lý…
                                            </>
                                        ) : (
                                            "Xác nhận đặt hàng"
                                        )}
                                    </Button>
                                </div>
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
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Trạng thái thanh toán:</span>
                                    <span className={`font-medium ${
                                        paymentStatus === "SUCCESS" 
                                            ? "text-green-600" 
                                            : paymentStatus === "PENDING" 
                                            ? "text-yellow-600" 
                                            : "text-muted-foreground"
                                    }`}>
                                        {paymentStatus === "SUCCESS" 
                                            ? "Đã thanh toán" 
                                            : paymentStatus === "PENDING" 
                                            ? "Đang chờ thanh toán" 
                                            : "—"}
                                    </span>
                                    {paymentStatus === "PENDING" && (
                                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                    )}
                                </div>
                                {paymentStatus === "PENDING" && (
                                    <div className="text-muted-foreground text-xs mt-2">
                                        Hệ thống đang tự động kiểm tra trạng thái thanh toán. Sau khi thanh toán thành công, bạn sẽ được chuyển hướng tự động.
                                    </div>
                                )}
                                {paymentStatus === "SUCCESS" && (
                                    <div className="text-green-600 text-xs mt-2">
                                        Thanh toán thành công! Đang chuyển hướng...
                                    </div>
                                )}
                            </div>
                            {paymentStatus === "PENDING" && (
                                <div className="mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={async () => {
                                            if (!orderId) return
                                            try {
                                                setCheckingPayment(true)
                                                const res = await fetch(`/api/payment/status?orderId=${orderId}`, {
                                                    headers: { Accept: "application/json" },
                                                    cache: "no-store",
                                                })
                                                if (res.ok) {
                                                    const data = await res.json().catch(() => ({}))
                                                    const status = data?.data?.paymentStatus
                                                    if (status) {
                                                        setPaymentStatus(status)
                                                        if (status === "SUCCESS") {
                                                            toast({
                                                                title: "Thành công",
                                                                description: "Thanh toán thành công!",
                                                            })
                                                            setTimeout(() => {
                                                                window.location.href = "/checkout/success"
                                                            }, 1000)
                                                        } else {
                                                            toast({
                                                                title: "Thông báo",
                                                                description: "Đơn hàng vẫn đang chờ thanh toán",
                                                            })
                                                        }
                                                    }
                                                }
                                            } catch (e) {
                                                console.error("Failed to check payment status:", e)
                                                toast({
                                                    title: "Lỗi",
                                                    description: "Không thể kiểm tra trạng thái thanh toán",
                                                    variant: "destructive",
                                                })
                                            } finally {
                                                setCheckingPayment(false)
                                            }
                                        }}
                                        disabled={checkingPayment}
                                    >
                                        {checkingPayment ? (
                                            <>
                                                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                                Đang kiểm tra...
                                            </>
                                        ) : (
                                            "Kiểm tra trạng thái thanh toán"
                                        )}
                                    </Button>
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    )
}
