import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");

export async function POST(req: NextRequest) {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
        const body = await req.json();

        const res = await fetch(`${API_BASE}/api/v1/me/cart/items`, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
            cache: "no-store"
        });

        let data: any = null;
        try {
            data = await res.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "BE trả về body rỗng (POST)" },
                { status: res.status }
            );
        }

        return NextResponse.json(data, { status: res.status });

    } catch (error) {
        console.error("Cart POST error:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        );
    }
}
