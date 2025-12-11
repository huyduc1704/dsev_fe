import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");

// GET /api/tags/[id] - Lấy chi tiết tag (all roles)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    const headers: HeadersInit = {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
        const res = await fetch(`${API_BASE}/api/v1/tags/${params.id}`, {
            method: "GET",
            headers,
            cache: "no-store"
        });

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
        console.error("Tag GET error:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        );
    }
}

// PUT /api/tags/[id] - Cập nhật tag (chỉ ADMIN và MODERATOR)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();

        const res = await fetch(`${API_BASE}/api/v1/tags/${params.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });

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
        console.error("Tag PUT error:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        );
    }
}

// DELETE /api/tags/[id] - Xóa tag (chỉ ADMIN và MODERATOR)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const res = await fetch(`${API_BASE}/api/v1/tags/${params.id}`, {
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
                { success: true, message: "Đã xóa tag thành công" },
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
        console.error("Tag DELETE error:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        );
    }
}

