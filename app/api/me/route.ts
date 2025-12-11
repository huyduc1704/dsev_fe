import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");

export async function GET(req: NextRequest) {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    const headers: HeadersInit = {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
        const res = await fetch(`${API_BASE}/api/v1/me`, {
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
        console.error("Me profile proxy error:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        );
    }
}

