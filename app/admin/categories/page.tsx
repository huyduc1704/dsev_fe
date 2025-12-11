"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, Image as ImageIcon, Loader2 } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface Category {
    id: string
    name: string
    description: string
    imageUrl: string
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
    const [formLoading, setFormLoading] = useState(false)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        imageUrl: "",
    })
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>("")

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/admin/categories", {
                headers: { Accept: "application/json" },
                cache: "no-store",
            })

            if (res.ok) {
                const data = await res.json()
                setCategories(data?.data || [])
            } else {
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách categories",
                    variant: "destructive",
                })
            }
        } catch (err) {
            console.error("Fetch categories error:", err)
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi tải categories",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleOpenCreateDialog = () => {
        setEditingCategory(null)
        setFormData({ name: "", description: "", imageUrl: "" })
        setImageFile(null)
        setImagePreview("")
        setIsDialogOpen(true)
    }

    const handleOpenEditDialog = (category: Category) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            description: category.description || "",
            imageUrl: category.imageUrl || "",
        })
        setImageFile(null)
        setImagePreview(category.imageUrl || "")
        setIsDialogOpen(true)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)

        try {
            let categoryId: string
            let imageUrl: string | null = null

            // Nếu có imageFile, upload image trước
            if (imageFile) {
                if (editingCategory) {
                    // Update: Upload image với category ID hiện có
                    const imageFormData = new FormData()
                    imageFormData.append("image", imageFile)

                    const imageRes = await fetch(`/api/admin/categories/${editingCategory.id}/image`, {
                        method: "POST",
                        body: imageFormData,
                    })

                    if (!imageRes.ok) {
                        const imageData = await imageRes.json().catch(() => ({}))
                        toast({
                            title: "Lỗi",
                            description: imageData?.message || "Không thể upload ảnh",
                            variant: "destructive",
                        })
                        setFormLoading(false)
                        return
                    }

                    const imageData = await imageRes.json().catch(() => ({}))
                    imageUrl = imageData?.data?.imageUrl || null
                    categoryId = editingCategory.id
                } else {
                    // Create: Tạo category trước (không có imageUrl), sau đó upload image
                    const createRes = await fetch("/api/admin/categories", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify({
                            name: formData.name,
                            description: formData.description,
                        }),
                    })

                    if (!createRes.ok) {
                        const createData = await createRes.json().catch(() => ({}))
                        toast({
                            title: "Lỗi",
                            description: createData?.message || "Không thể tạo category",
                            variant: "destructive",
                        })
                        setFormLoading(false)
                        return
                    }

                    const createData = await createRes.json().catch(() => ({}))
                    categoryId = createData?.data?.id

                    if (!categoryId) {
                        toast({
                            title: "Lỗi",
                            description: "Không nhận được ID category sau khi tạo",
                            variant: "destructive",
                        })
                        setFormLoading(false)
                        return
                    }

                    // Upload image với category ID vừa tạo
                    const imageFormData = new FormData()
                    imageFormData.append("image", imageFile)

                    const imageRes = await fetch(`/api/admin/categories/${categoryId}/image`, {
                        method: "POST",
                        body: imageFormData,
                    })

                    if (!imageRes.ok) {
                        const imageData = await imageRes.json().catch(() => ({}))
                        toast({
                            title: "Lỗi",
                            description: imageData?.message || "Không thể upload ảnh",
                            variant: "destructive",
                        })
                        setFormLoading(false)
                        return
                    }

                    const imageData = await imageRes.json().catch(() => ({}))
                    imageUrl = imageData?.data?.imageUrl || null
                }
            } else {
                // Không có imageFile, chỉ create/update category
                if (editingCategory) {
                    // Update
                    const updateRes = await fetch(`/api/admin/categories/${editingCategory.id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify({
                            name: formData.name,
                            description: formData.description,
                        }),
                    })

                    if (!updateRes.ok) {
                        const updateData = await updateRes.json().catch(() => ({}))
                        toast({
                            title: "Lỗi",
                            description: updateData?.message || "Có lỗi xảy ra",
                            variant: "destructive",
                        })
                        setFormLoading(false)
                        return
                    }
                } else {
                    // Create
                    const createRes = await fetch("/api/admin/categories", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify({
                            name: formData.name,
                            description: formData.description,
                        }),
                    })

                    if (!createRes.ok) {
                        const createData = await createRes.json().catch(() => ({}))
                        toast({
                            title: "Lỗi",
                            description: createData?.message || "Có lỗi xảy ra",
                            variant: "destructive",
                        })
                        setFormLoading(false)
                        return
                    }
                }
            }

            toast({
                title: "Thành công",
                description: editingCategory
                    ? "Đã cập nhật category thành công"
                    : "Đã tạo category thành công",
            })
            setIsDialogOpen(false)
            fetchCategories()
        } catch (err) {
            console.error("Submit error:", err)
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi lưu category",
                variant: "destructive",
            })
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingCategory) return

        try {
            const res = await fetch(`/api/admin/categories/${deletingCategory.id}`, {
                method: "DELETE",
            })

            if (res.ok) {
                toast({
                    title: "Thành công",
                    description: "Đã xóa category thành công",
                })
                setIsDeleteDialogOpen(false)
                setDeletingCategory(null)
                fetchCategories()
            } else {
                const data = await res.json()
                toast({
                    title: "Lỗi",
                    description: data?.message || "Không thể xóa category",
                    variant: "destructive",
                })
            }
        } catch (err) {
            console.error("Delete error:", err)
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi xóa category",
                variant: "destructive",
            })
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Quản lý Categories</h1>
                <Button onClick={handleOpenCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm Category
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-12 border border-border rounded-lg">
                    <p className="text-muted-foreground">Chưa có category nào</p>
                </div>
            ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20">Ảnh</TableHead>
                                <TableHead>Tên</TableHead>
                                <TableHead>Mô tả</TableHead>
                                <TableHead className="w-32 text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        {category.imageUrl ? (
                                            <div className="relative w-16 h-16 rounded overflow-hidden bg-muted">
                                                <Image
                                                    src={category.imageUrl}
                                                    alt={category.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="64px"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {category.description || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEditDialog(category)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setDeletingCategory(category)
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? "Chỉnh sửa Category" : "Thêm Category mới"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory
                                ? "Cập nhật thông tin category"
                                : "Điền thông tin để tạo category mới"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên Category *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                                placeholder="Nhập tên category"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Nhập mô tả category"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">URL ảnh</Label>
                            <Input
                                id="imageUrl"
                                value={formData.imageUrl}
                                onChange={(e) =>
                                    setFormData({ ...formData, imageUrl: e.target.value })
                                }
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Hoặc upload ảnh</Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {imagePreview && (
                                <div className="relative w-32 h-32 rounded overflow-hidden bg-muted border border-border">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                        sizes="128px"
                                    />
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
                                ) : editingCategory ? (
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
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa category "{deletingCategory?.name}"? Hành động
                            này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

