"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, Loader2, Tag as TagIcon } from "lucide-react"
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

interface Tag {
    id: string
    name: string
    displayName: string
}

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editingTag, setEditingTag] = useState<Tag | null>(null)
    const [deletingTag, setDeletingTag] = useState<Tag | null>(null)
    const [formLoading, setFormLoading] = useState(false)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        name: "",
        displayName: "",
    })

    useEffect(() => {
        fetchTags()
    }, [])

    const fetchTags = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/tags", {
                headers: { Accept: "application/json" },
                cache: "no-store",
            })

            const data = await res.json().catch(() => ({}))
            
            if (res.ok) {
                // BE có thể trả về success: false nhưng vẫn có data
                if (data?.data && Array.isArray(data.data)) {
                    setTags(data.data)
                } else if (Array.isArray(data)) {
                    // Trường hợp BE trả về array trực tiếp
                    setTags(data)
                } else {
                    console.warn("Unexpected response format:", data)
                    setTags([])
                    toast({
                        title: "Cảnh báo",
                        description: data?.message || "Không có dữ liệu tags",
                        variant: "destructive",
                    })
                }
            } else {
                toast({
                    title: "Lỗi",
                    description: data?.message || "Không thể tải danh sách tags",
                    variant: "destructive",
                })
            }
        } catch (err) {
            console.error("Fetch tags error:", err)
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi tải tags",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleOpenCreateDialog = () => {
        setEditingTag(null)
        setFormData({ name: "", displayName: "" })
        setIsDialogOpen(true)
    }

    const handleOpenEditDialog = (tag: Tag) => {
        setEditingTag(tag)
        setFormData({
            name: tag.name,
            displayName: tag.displayName || "",
        })
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)

        try {
            if (editingTag) {
                // Update
                const updateRes = await fetch(`/api/tags/${editingTag.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        displayName: formData.displayName,
                    }),
                })

                if (!updateRes.ok) {
                    const updateData = await updateRes.json().catch(() => ({}))
                    toast({
                        title: "Lỗi",
                        description: updateData?.message || "Có lỗi xảy ra khi cập nhật tag",
                        variant: "destructive",
                    })
                    setFormLoading(false)
                    return
                }
            } else {
                // Create
                const createRes = await fetch("/api/tags", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        displayName: formData.displayName,
                    }),
                })

                if (!createRes.ok) {
                    const createData = await createRes.json().catch(() => ({}))
                    toast({
                        title: "Lỗi",
                        description: createData?.message || "Có lỗi xảy ra khi tạo tag",
                        variant: "destructive",
                    })
                    setFormLoading(false)
                    return
                }
            }

            toast({
                title: "Thành công",
                description: editingTag
                    ? "Đã cập nhật tag thành công"
                    : "Đã tạo tag thành công",
            })
            setIsDialogOpen(false)
            fetchTags()
        } catch (err) {
            console.error("Submit error:", err)
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi lưu tag",
                variant: "destructive",
            })
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingTag) return

        try {
            const res = await fetch(`/api/tags/${deletingTag.id}`, {
                method: "DELETE",
            })

            if (res.ok) {
                toast({
                    title: "Thành công",
                    description: "Đã xóa tag thành công",
                })
                setIsDeleteDialogOpen(false)
                setDeletingTag(null)
                fetchTags()
            } else {
                const data = await res.json().catch(() => ({}))
                toast({
                    title: "Lỗi",
                    description: data?.message || "Không thể xóa tag",
                    variant: "destructive",
                })
            }
        } catch (err) {
            console.error("Delete error:", err)
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi xóa tag",
                variant: "destructive",
            })
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Quản lý Tags</h1>
                <Button onClick={handleOpenCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm Tag
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : tags.length === 0 ? (
                <div className="text-center py-12 border border-border rounded-lg">
                    <TagIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Chưa có tag nào</p>
                </div>
            ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tên (name)</TableHead>
                                <TableHead>Tên hiển thị (displayName)</TableHead>
                                <TableHead className="w-32 text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tags.map((tag) => (
                                <TableRow key={tag.id}>
                                    <TableCell className="font-medium">{tag.name}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {tag.displayName || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEditDialog(tag)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setDeletingTag(tag)
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
                            {editingTag ? "Chỉnh sửa Tag" : "Thêm Tag mới"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingTag
                                ? "Cập nhật thông tin tag"
                                : "Điền thông tin để tạo tag mới"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên Tag (name) *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                                placeholder="vd: men, women, sports"
                            />
                            <p className="text-xs text-muted-foreground">
                                Tên tag dùng để filter và query (không dấu, lowercase)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="displayName">Tên hiển thị (displayName) *</Label>
                            <Input
                                id="displayName"
                                value={formData.displayName}
                                onChange={(e) =>
                                    setFormData({ ...formData, displayName: e.target.value })
                                }
                                required
                                placeholder="vd: Nam, Nữ, Thể thao"
                            />
                            <p className="text-xs text-muted-foreground">
                                Tên hiển thị trên Navbar cho người dùng
                            </p>
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
                                ) : editingTag ? (
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
                            Bạn có chắc chắn muốn xóa tag "{deletingTag?.displayName || deletingTag?.name}"? Hành động
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

