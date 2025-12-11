import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");

// DELETE /api/admin/products/[id]/tags/[tagId] - Xóa tag khỏi product
export async function DELETE(req: NextRequest, { params }: { params: { id: string; tagId: string } }) {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const res = await fetch(`${API_BASE}/api/v1/products/${params.id}/tags/${params.tagId}`, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        // 204 No Content không có body
        if (res.status === 204) {
            return NextResponse.json(
                { success: true, message: "Đã xóa tag khỏi product thành công" },
                { status: 200 }
            );
        }

        let data = null;
        try {
            data = await res.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "BE trả về body rỗng" },
                { status: res.status }
            );
        }

        return NextResponse.json(data, { status: res.status });

    } catch (error) {
        console.error("Product tag DELETE error:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        );
    }
}

