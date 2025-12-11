import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");

export async function PATCH(req: NextRequest, { params }: { params: { cartItemId: string } }) {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
        const body = await req.json();

        const res = await fetch(`${API_BASE}/api/v1/me/cart/items/${params.cartItemId}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(body),
            cache: "no-store"
        });

        let data: any = null;
        try {
            data = await res.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "BE trả về body rỗng (PATCH)" },
                { status: res.status }
            );
        }

        return NextResponse.json(data, { status: res.status });

    } catch (error) {
        console.error("Cart PATCH error:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { cartItemId: string } }) {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    const headers: HeadersInit = {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
        const res = await fetch(`${API_BASE}/api/v1/me/cart/items/${params.cartItemId}`, {
            method: "DELETE",
            headers,
            cache: "no-store"
        });

        // 204 No Content không có body, chỉ cần trả về status thành công
        if (res.status === 204) {
            return NextResponse.json(
                { success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng" },
                { status: 200 }
            );
        }

        // Với các status khác, thử parse JSON
        let data: any = null;
        try {
            const text = await res.text();
            if (text) {
                data = JSON.parse(text);
            }
        } catch {
            // Nếu không parse được JSON, trả về response với status từ backend
            return NextResponse.json(
                { success: res.ok, message: res.ok ? "Đã xóa thành công" : "Lỗi xóa sản phẩm" },
                { status: res.status }
            );
        }

        return NextResponse.json(data || { success: res.ok }, { status: res.status });

    } catch (error) {
        console.error("Cart DELETE error:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        );
    }
}