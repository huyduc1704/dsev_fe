"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Variant {
    id?: string
    productId?: string
    color: string
    size: string
    price: number
    stockQuantity: number
}

interface Product {
    id: string
    name: string
    description: string
    brand: string
}

export default function VariantsPage() {
    const params = useParams()
    const router = useRouter()
    const productId = params.id as string

    const [product, setProduct] = useState<Product | null>(null)
    const [variants, setVariants] = useState<Variant[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editingVariant, setEditingVariant] = useState<Variant | null>(null)
    const [deletingVariant, setDeletingVariant] = useState<Variant | null>(null)
    const [formLoading, setFormLoading] = useState(false)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        color: "",
        size: "",
        price: 0,
        stockQuantity: 0,
    })

    useEffect(() => {
        if (productId) {
            fetchProduct()
            fetchVariants()
        }
    }, [productId])

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/admin/products/${productId}`, {
                headers: { Accept: "application/json" },
                cache: "no-store",
            })
            if (res.ok) {
                const data = await res.json()
                setProduct(data?.data || null)
            }
        } catch (err) {
            console.error("Fetch product error:", err)
        }
    }

    const fetchVariants = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/products/${productId}/variants`, {
                headers: { Accept: "application/json" },
                cache: "no-store",
            })

            if (res.ok) {
                const data = await res.json()
                setVariants(data?.data || [])
            } else {
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách variants",
                    variant: "destructive",
                })
            }
        } catch (err) {
            console.error("Fetch variants error:", err)
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi tải variants",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleOpenCreateDialog = () => {
        setEditingVariant(null)
        setFormData({
            color: "",
            size: "",
            price: 0,
            stockQuantity: 0,
        })
        setIsDialogOpen(true)
    }

    const handleOpenEditDialog = (variant: Variant) => {
        setEditingVariant(variant)
        setFormData({
            color: variant.color,
            size: variant.size,
            price: variant.price,
            stockQuantity: variant.stockQuantity,
        })
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)

        try {
            if (editingVariant && editingVariant.id) {
                // Update variant
                const res = await fetch(
                    `/api/admin/products/${productId}/variants/${editingVariant.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify({
                            productId,
                            color: formData.color,
                            size: formData.size,
                            price: formData.price,
                            stockQuantity: formData.stockQuantity,
                        }),
                    }
                )

                const data = await res.json()
                if (!res.ok) {
                    toast({
                        title: "Lỗi",
                        description: data?.message || "Có lỗi xảy ra",
                        variant: "destructive",
                    })
                    setFormLoading(false)
                    return
                }
            } else {
                // Create variant
                const res = await fetch(`/api/admin/products/${productId}/variants`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        productId,
                        color: formData.color,
                        size: formData.size,
                        price: formData.price,
                        stockQuantity: formData.stockQuantity,
                    }),
                })

                const data = await res.json()
                if (!res.ok) {
                    toast({
                        title: "Lỗi",
                        description: data?.message || "Có lỗi xảy ra",
                        variant: "destructive",
                    })
                    setFormLoading(false)
                    return
                }
            }

            toast({
                title: "Thành công",
                description: editingVariant
                    ? "Đã cập nhật variant thành công"
                    : "Đã tạo variant thành công",
            })
            setIsDialogOpen(false)
            fetchVariants()
        } catch (err) {
            console.error("Submit error:", err)
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi lưu variant",
                variant: "destructive",
            })
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingVariant || !deletingVariant.id) return

        try {
            const res = await fetch(
                `/api/admin/products/${productId}/variants/${deletingVariant.id}`,
                {
                    method: "DELETE",
                }
            )

            if (res.ok) {
                toast({
                    title: "Thành công",
                    description: "Đã xóa variant thành công",
                })
                setIsDeleteDialogOpen(false)
                setDeletingVariant(null)
                fetchVariants()
            } else {
                const data = await res.json()
                toast({
                    title: "Lỗi",
                    description: data?.message || "Không thể xóa variant",
                    variant: "destructive",
                })
            }
        } catch (err) {
            console.error("Delete error:", err)
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi xóa variant",
                variant: "destructive",
            })
        }
    }

    if (!productId) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Product ID không hợp lệ</p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.push("/admin/products")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Quản lý Variants</h1>
                    {product && (
                        <p className="text-muted-foreground mt-1">
                            Product: {product.name} {product.brand && `(${product.brand})`}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                    Quản lý các variants (màu sắc, kích thước) cho product này
                </p>
                <Button onClick={handleOpenCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm Variant
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : variants.length === 0 ? (
                <div className="text-center py-12 border border-border rounded-lg">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Chưa có variant nào</p>
                </div>
            ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Màu sắc</TableHead>
                                <TableHead>Kích thước</TableHead>
                                <TableHead>Giá (VND)</TableHead>
                                <TableHead>Số lượng</TableHead>
                                <TableHead className="w-32 text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {variants.map((variant) => (
                                <TableRow key={variant.id}>
                                    <TableCell>{variant.color || "-"}</TableCell>
                                    <TableCell>{variant.size || "-"}</TableCell>
                                    <TableCell>
                                        {variant.price?.toLocaleString("vi-VN") || 0} đ
                                    </TableCell>
                                    <TableCell>{variant.stockQuantity || 0}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEditDialog(variant)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setDeletingVariant(variant)
                                                    setIsDeleteDialogOpen(true)
                                                }}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingVariant ? "Chỉnh sửa Variant" : "Thêm Variant mới"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingVariant
                                ? "Cập nhật thông tin variant"
                                : "Điền thông tin để tạo variant mới"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="color">Màu sắc *</Label>
                                <Input
                                    id="color"
                                    value={formData.color}
                                    onChange={(e) =>
                                        setFormData({ ...formData, color: e.target.value })
                                    }
                                    required
                                    placeholder="Nhập màu sắc"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="size">Kích thước *</Label>
                                <Input
                                    id="size"
                                    value={formData.size}
                                    onChange={(e) =>
                                        setFormData({ ...formData, size: e.target.value })
                                    }
                                    required
                                    placeholder="Nhập kích thước (S, M, L, XL...)"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Giá (VND) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            price: Number(e.target.value),
                                        })
                                    }
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stockQuantity">Số lượng *</Label>
                                <Input
                                    id="stockQuantity"
                                    type="number"
                                    value={formData.stockQuantity}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            stockQuantity: Number(e.target.value),
                                        })
                                    }
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                disabled={formLoading}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={formLoading}>
                                {formLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : editingVariant ? (
                                    "Cập nhật"
                                ) : (
                                    "Tạo"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa variant này? Hành động này không thể hoàn
                            tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

