"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, Loader2, Package } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tag as TagIcon, X } from "lucide-react"

interface Category {
    id: string
    name: string
    description: string
    imageUrl: string
}

interface Variant {
    id?: string
    productId?: string
    color: string
    size: string
    price: number
    stockQuantity: number
}

interface Tag {
    id: string
    name: string
    displayName: string
}

interface Product {
    id: string
    name: string
    description: string
    brand: string
    images: string[]
    isActive: boolean
    categoryId: string
    variants: Variant[]
    tags?: Tag[]
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [allTags, setAllTags] = useState<Tag[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
    const [taggingProduct, setTaggingProduct] = useState<Product | null>(null)
    const [formLoading, setFormLoading] = useState(false)
    const [tagLoading, setTagLoading] = useState(false)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        brand: "",
        isActive: true,
        categoryId: "",
    })
    const [variants, setVariants] = useState<Variant[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([]) // Tag IDs được chọn trong form create/edit
    const [tagsToAdd, setTagsToAdd] = useState<string[]>([]) // Tag IDs để thêm trong tag dialog

    useEffect(() => {
        fetchProducts()
        fetchCategories()
        fetchTags()
    }, [])

    const fetchTags = async () => {
        try {
            const res = await fetch("/api/tags", {
                headers: { Accept: "application/json" },
                cache: "no-store",
            })
            if (res.ok) {
                const data = await res.json()
                const tagsData = data?.data || []
                if (Array.isArray(tagsData)) {
                    setAllTags(tagsData)
                }
            }
        } catch (err) {
            console.error("Fetch tags error:", err)
        }
    }

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/admin/products", {
                headers: { Accept: "application/json" },
                cache: "no-store",
            })

            if (res.ok) {
                const data = await res.json()
                setProducts(data?.data || [])
            } else {
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách products",
                    variant: "destructive",
                })
            }
        } catch (err) {
            console.error("Fetch products error:", err)
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi tải products",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/admin/categories", {
                headers: { Accept: "application/json" },
                cache: "no-store",
            })

            if (res.ok) {
                const data = await res.json()
                setCategories(data?.data || [])
            }
        } catch (err) {
            console.error("Fetch categories error:", err)
        }
    }

    const handleOpenCreateDialog = () => {
        setEditingProduct(null)
        setFormData({
            name: "",
            description: "",
            brand: "",
            isActive: true,
            categoryId: "",
        })
        setVariants([])
        setSelectedTags([])
        setIsDialogOpen(true)
    }

    const handleOpenEditDialog = async (product: Product) => {
        try {
            // Fetch full product details với variants
            const res = await fetch(`/api/admin/products/${product.id}`)
            if (res.ok) {
                const data = await res.json()
                const fullProduct = data?.data || product
                setEditingProduct(fullProduct)
                setFormData({
                    name: fullProduct.name,
                    description: fullProduct.description || "",
                    brand: fullProduct.brand || "",
                    isActive: fullProduct.isActive ?? true,
                    categoryId: fullProduct.categoryId || "",
                })
                setVariants(fullProduct.variants || [])
                // Set selected tags từ product tags
                setSelectedTags((fullProduct.tags || []).map((t: Tag) => t.id))
                setIsDialogOpen(true)
            } else {
                // Fallback to product data we have
                setEditingProduct(product)
                setFormData({
                    name: product.name,
                    description: product.description || "",
                    brand: product.brand || "",
                    isActive: product.isActive ?? true,
                    categoryId: product.categoryId || "",
                })
                setVariants(product.variants || [])
                // Set selected tags từ product tags
                setSelectedTags((product.tags || []).map((t: Tag) => t.id))
                setIsDialogOpen(true)
            }
        } catch (err) {
            console.error("Fetch product detail error:", err)
            toast({
                title: "Lỗi",
                description: "Không thể tải chi tiết product",
                variant: "destructive",
            })
        }
    }

    const handleAddVariant = () => {
        setVariants([
            ...variants,
            {
                color: "",
                size: "",
                price: 0,
                stockQuantity: 0,
            },
        ])
    }

    const handleUpdateVariant = (index: number, field: keyof Variant, value: any) => {
        const updated = [...variants]
        updated[index] = { ...updated[index], [field]: value }
        setVariants(updated)
    }

    const handleRemoveVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)

        try {
            let productId: string

            if (editingProduct) {
                // Update product
                const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(formData),
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
                productId = editingProduct.id
            } else {
                // Create product
                const res = await fetch("/api/admin/products", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(formData),
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
                productId = data?.data?.id
            }

            // Save tags sau khi create/update product
            if (productId) {
                try {
                    if (editingProduct) {
                        // Update: Sync tags (xóa tags cũ không còn trong selectedTags, thêm tags mới)
                        const currentTagIds = (editingProduct.tags || []).map((t: Tag) => t.id)
                        
                        // Xóa tags không còn trong selectedTags
                        const tagsToRemove = currentTagIds.filter((id: string) => !selectedTags.includes(id))
                        for (const tagId of tagsToRemove) {
                            try {
                                const deleteRes = await fetch(`/api/admin/products/${productId}/tags/${tagId}`, {
                                    method: "DELETE",
                                })
                                if (!deleteRes.ok) {
                                    console.error(`Failed to remove tag ${tagId}`)
                                }
                            } catch (err) {
                                console.error(`Error removing tag ${tagId}:`, err)
                            }
                        }
                        
                        // Thêm tags mới
                        const tagsToAdd = selectedTags.filter((id: string) => !currentTagIds.includes(id))
                        if (tagsToAdd.length > 0) {
                            try {
                                const addRes = await fetch(`/api/admin/products/${productId}/tags`, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Accept: "application/json",
                                    },
                                    body: JSON.stringify(tagsToAdd),
                                })
                                if (!addRes.ok) {
                                    console.error("Failed to add tags")
                                }
                            } catch (err) {
                                console.error("Error adding tags:", err)
                            }
                        }
                    } else {
                        // Create: Chỉ thêm tags nếu có
                        if (selectedTags.length > 0) {
                            try {
                                const addRes = await fetch(`/api/admin/products/${productId}/tags`, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Accept: "application/json",
                                    },
                                    body: JSON.stringify(selectedTags),
                                })
                                if (!addRes.ok) {
                                    console.error("Failed to add tags to new product")
                                }
                            } catch (err) {
                                console.error("Error adding tags to new product:", err)
                            }
                        }
                    }
                } catch (err) {
                    console.error("Save tags error:", err)
                    // Không throw error để không block việc save product
                }
            }

            // Save variants
            if (productId && variants.length > 0) {
                // Fetch existing variants để so sánh
                const existingRes = await fetch(`/api/admin/products/${productId}/variants`)
                const existingData = await existingRes.json().catch(() => ({ data: [] }))
                const existingVariants = existingData?.data || []

                // Xóa variants không còn trong danh sách mới
                for (const existing of existingVariants) {
                    if (!variants.find((v) => v.id === existing.id)) {
                        await fetch(
                            `/api/admin/products/${productId}/variants/${existing.id}`,
                            { method: "DELETE" }
                        )
                    }
                }

                // Tạo/cập nhật variants
                for (const variant of variants) {
                    if (variant.id) {
                        // Update existing variant
                        await fetch(
                            `/api/admin/products/${productId}/variants/${variant.id}`,
                            {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                    Accept: "application/json",
                                },
                                body: JSON.stringify({
                                    productId,
                                    color: variant.color,
                                    size: variant.size,
                                    price: variant.price,
                                    stockQuantity: variant.stockQuantity,
                                }),
                            }
                        )
                    } else {
                        // Create new variant
                        await fetch(`/api/admin/products/${productId}/variants`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "application/json",
                            },
                            body: JSON.stringify({
                                productId,
                                color: variant.color,
                                size: variant.size,
                                price: variant.price,
                                stockQuantity: variant.stockQuantity,
                            }),
                        })
                    }
                }
            }

            toast({
                title: "Thành công",
                description: editingProduct
                    ? "Đã cập nhật product thành công"
                    : "Đã tạo product thành công",
            })
            setIsDialogOpen(false)
            // Reset form
            setSelectedTags([])
            setVariants([])
            // Refresh products để hiển thị tags mới nhất
            await fetchProducts()
        } catch (err) {
            console.error("Submit error:", err)
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi lưu product",
                variant: "destructive",
            })
        } finally {
            setFormLoading(false)
        }
    }

    const handleOpenTagDialog = async (product: Product) => {
        // Fetch full product details để có tags mới nhất
        try {
            const res = await fetch(`/api/admin/products/${product.id}`)
            if (res.ok) {
                const data = await res.json()
                const fullProduct = data?.data || product
                setTaggingProduct(fullProduct)
                setTagsToAdd([])
                setIsTagDialogOpen(true)
            } else {
                setTaggingProduct(product)
                setTagsToAdd([])
                setIsTagDialogOpen(true)
            }
        } catch (err) {
            console.error("Fetch product for tags error:", err)
            setTaggingProduct(product)
            setTagsToAdd([])
            setIsTagDialogOpen(true)
        }
    }

    const handleAddTagsToProduct = async () => {
        if (!taggingProduct || tagsToAdd.length === 0) return

        setTagLoading(true)
        try {
            const res = await fetch(`/api/admin/products/${taggingProduct.id}/tags`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(tagsToAdd),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                toast({
                    title: "Lỗi",
                    description: data?.message || "Không thể thêm tags",
                    variant: "destructive",
                })
                setTagLoading(false)
                return
            }

            toast({
                title: "Thành công",
                description: "Đã thêm tags thành công",
            })
            setIsTagDialogOpen(false)
            setTaggingProduct(null)
            setTagsToAdd([])
            // Refresh products để hiển thị tags mới nhất
            await fetchProducts()
        } catch (err) {
            console.error("Add tags error:", err)
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi thêm tags",
                variant: "destructive",
            })
        } finally {
            setTagLoading(false)
        }
    }

    const handleRemoveTagFromProduct = async (tagId: string) => {
        if (!taggingProduct) return

        setTagLoading(true)
        try {
            const res = await fetch(`/api/admin/products/${taggingProduct.id}/tags/${tagId}`, {
                method: "DELETE",
            })

            if (res.ok) {
                toast({
                    title: "Thành công",
                    description: "Đã xóa tag khỏi product",
                })
                // Fetch lại product details để có tags mới nhất từ BE
                try {
                    const productRes = await fetch(`/api/admin/products/${taggingProduct.id}`)
                    if (productRes.ok) {
                        const productData = await productRes.json()
                        const updatedProduct = productData?.data || taggingProduct
                        setTaggingProduct({
                            ...updatedProduct,
                            tags: (updatedProduct.tags || []).filter((t: Tag) => t.id !== tagId),
                        })
                    }
                } catch (err) {
                    console.error("Fetch updated product error:", err)
                    // Fallback: update local state
                    setTaggingProduct({
                        ...taggingProduct,
                        tags: (taggingProduct.tags || []).filter((t: Tag) => t.id !== tagId),
                    })
                }
                // Refresh products list
                await fetchProducts()
            } else {
                const data = await res.json().catch(() => ({}))
                toast({
                    title: "Lỗi",
                    description: data?.message || "Không thể xóa tag",
                    variant: "destructive",
                })
            }
        } catch (err) {
            console.error("Remove tag error:", err)
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi xóa tag",
                variant: "destructive",
            })
        } finally {
            setTagLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingProduct) return

        try {
            const res = await fetch(`/api/admin/products/${deletingProduct.id}`, {
                method: "DELETE",
            })

            if (res.ok) {
                toast({
                    title: "Thành công",
                    description: "Đã xóa product thành công",
                })
                setIsDeleteDialogOpen(false)
                setDeletingProduct(null)
                fetchProducts()
            } else {
                const data = await res.json()
                toast({
                    title: "Lỗi",
                    description: data?.message || "Không thể xóa product",
                    variant: "destructive",
                })
            }
        } catch (err) {
            console.error("Delete error:", err)
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi xóa product",
                variant: "destructive",
            })
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Quản lý Products</h1>
                <Button onClick={handleOpenCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm Product
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-12 border border-border rounded-lg">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Chưa có product nào</p>
                </div>
            ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20">Ảnh</TableHead>
                                <TableHead>Tên</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead>Variants</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="w-40 text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => {
                                const category = categories.find((c) => c.id === product.categoryId)
                                return (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            {product.images?.[0] ? (
                                                <div className="relative w-16 h-16 rounded overflow-hidden bg-muted">
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{product.name}</div>
                                            <div className="text-xs text-muted-foreground line-clamp-1">
                                                {product.description}
                                            </div>
                                        </TableCell>
                                        <TableCell>{product.brand || "-"}</TableCell>
                                        <TableCell>{category?.name || "-"}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {product.tags && product.tags.length > 0 ? (
                                                    product.tags.map((tag) => (
                                                        <Badge key={tag.id} variant="secondary" className="text-xs">
                                                            {tag.displayName || tag.name}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {product.variants?.length || 0} variants
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={product.isActive ? "default" : "secondary"}
                                            >
                                                {product.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenTagDialog(product)}
                                                    title="Quản lý tags"
                                                >
                                                    <TagIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenEditDialog(product)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setDeletingProduct(product)
                                                        setIsDeleteDialogOpen(true)
                                                    }}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProduct ? "Chỉnh sửa Product" : "Thêm Product mới"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingProduct
                                ? "Cập nhật thông tin product và variants"
                                : "Điền thông tin để tạo product mới"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Tên Product *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    required
                                    placeholder="Nhập tên product"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand</Label>
                                <Input
                                    id="brand"
                                    value={formData.brand}
                                    onChange={(e) =>
                                        setFormData({ ...formData, brand: e.target.value })
                                    }
                                    placeholder="Nhập brand"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Nhập mô tả product"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="categoryId">Category *</Label>
                                <Select
                                    value={formData.categoryId}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, categoryId: value })
                                    }
                                    required
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 flex items-end">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) =>
                                            setFormData({
                                                ...formData,
                                                isActive: checked === true,
                                            })
                                        }
                                    />
                                    <Label htmlFor="isActive" className="cursor-pointer">
                                        Active
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Tags Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Tags</Label>
                            </div>
                            <div className="space-y-2">
                                <Label>Chọn tags cho product</Label>
                                <div className="flex flex-wrap gap-2 p-3 border border-border rounded-md min-h-[60px]">
                                    {selectedTags.length > 0 ? (
                                        selectedTags.map((tagId) => {
                                            const tag = allTags.find((t) => t.id === tagId)
                                            return tag ? (
                                                <Badge key={tagId} variant="secondary" className="flex items-center gap-1">
                                                    {tag.displayName || tag.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedTags(selectedTags.filter((id) => id !== tagId))
                                                        }}
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ) : null
                                        })
                                    ) : (
                                        <span className="text-sm text-muted-foreground">Chưa chọn tag nào</span>
                                    )}
                                </div>
                                <Select
                                    value=""
                                    onValueChange={(value) => {
                                        if (value && !selectedTags.includes(value) && allTags.some((t) => t.id === value)) {
                                            setSelectedTags([...selectedTags, value])
                                        }
                                    }}
                                    disabled={allTags.length === 0}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn tag để thêm" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allTags
                                            .filter((tag) => !selectedTags.includes(tag.id))
                                            .map((tag) => (
                                                <SelectItem key={tag.id} value={tag.id}>
                                                    {tag.displayName || tag.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator />

                        {/* Variants Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Variants</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddVariant}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm Variant
                                </Button>
                            </div>

                            {variants.length === 0 ? (
                                <div className="text-center py-8 border border-dashed border-border rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        Chưa có variant nào. Nhấn "Thêm Variant" để thêm.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {variants.map((variant, index) => (
                                        <div
                                            key={index}
                                            className="p-4 border border-border rounded-lg space-y-3"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">
                                                    Variant {index + 1}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveVariant(index)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-4 gap-3">
                                                <div className="space-y-2">
                                                    <Label>Color *</Label>
                                                    <Input
                                                        value={variant.color}
                                                        onChange={(e) =>
                                                            handleUpdateVariant(
                                                                index,
                                                                "color",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Màu sắc"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Size *</Label>
                                                    <Input
                                                        value={variant.size}
                                                        onChange={(e) =>
                                                            handleUpdateVariant(
                                                                index,
                                                                "size",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Kích thước"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Giá (VND) *</Label>
                                                    <Input
                                                        type="number"
                                                        value={variant.price}
                                                        onChange={(e) =>
                                                            handleUpdateVariant(
                                                                index,
                                                                "price",
                                                                Number(e.target.value)
                                                            )
                                                        }
                                                        placeholder="0"
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Số lượng *</Label>
                                                    <Input
                                                        type="number"
                                                        value={variant.stockQuantity}
                                                        onChange={(e) =>
                                                            handleUpdateVariant(
                                                                index,
                                                                "stockQuantity",
                                                                Number(e.target.value)
                                                            )
                                                        }
                                                        placeholder="0"
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                        Đang lưu...
                                    </>
                                ) : editingProduct ? (
                                    "Cập nhật"
                                ) : (
                                    "Tạo mới"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            {/* Tag Management Dialog */}
            <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Quản lý Tags - {taggingProduct?.name}</DialogTitle>
                        <DialogDescription>
                            Thêm hoặc xóa tags cho product này
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Tags hiện tại */}
                        <div className="space-y-2">
                            <Label>Tags hiện tại</Label>
                            <div className="flex flex-wrap gap-2 p-3 border border-border rounded-md min-h-[60px]">
                                {taggingProduct?.tags && taggingProduct.tags.length > 0 ? (
                                    taggingProduct.tags.map((tag) => (
                                        <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                                            {tag.displayName || tag.name}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTagFromProduct(tag.id)}
                                                disabled={tagLoading}
                                                className="ml-1 hover:text-destructive disabled:opacity-50"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">Chưa có tag nào</span>
                                )}
                            </div>
                        </div>

                        {/* Chọn tag để thêm */}
                        <div className="space-y-2">
                            <Label>Thêm tag mới</Label>
                            <Select
                                value=""
                                onValueChange={(value) => {
                                    if (value && !tagsToAdd.includes(value) && allTags.some((t) => t.id === value)) {
                                        const currentTagIds = (taggingProduct?.tags || []).map((t: Tag) => t.id)
                                        if (!currentTagIds.includes(value)) {
                                            setTagsToAdd([...tagsToAdd, value])
                                        }
                                    }
                                }}
                                disabled={tagLoading || allTags.length === 0}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn tag để thêm" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allTags
                                        .filter((tag) => {
                                            const currentTagIds = (taggingProduct?.tags || []).map((t: Tag) => t.id)
                                            return !currentTagIds.includes(tag.id) && !tagsToAdd.includes(tag.id)
                                        })
                                        .map((tag) => (
                                            <SelectItem key={tag.id} value={tag.id}>
                                                {tag.displayName || tag.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Selected tags để thêm */}
                        {tagsToAdd.length > 0 && (
                            <div className="space-y-2">
                                <Label>Tags sẽ được thêm</Label>
                                <div className="flex flex-wrap gap-2 p-3 border border-border rounded-md bg-muted/50">
                                    {tagsToAdd.map((tagId) => {
                                        const tag = allTags.find((t) => t.id === tagId)
                                        return tag ? (
                                            <Badge key={tagId} variant="default" className="flex items-center gap-1">
                                                {tag.displayName || tag.name}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setTagsToAdd(tagsToAdd.filter((id) => id !== tagId))
                                                    }}
                                                    className="ml-1 hover:text-destructive"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ) : null
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsTagDialogOpen(false)
                                setTaggingProduct(null)
                                setTagsToAdd([])
                            }}
                            disabled={tagLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAddTagsToProduct}
                            disabled={tagLoading || tagsToAdd.length === 0}
                        >
                            {tagLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Thêm Tags"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa product "{deletingProduct?.name}"? Hành động
                            này không thể hoàn tác.
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

