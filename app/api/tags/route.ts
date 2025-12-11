import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");

// GET /api/tags - Lấy danh sách tags (all roles)
export async function GET(req: NextRequest) {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    const headers: HeadersInit = {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
        const url = `${API_BASE}/api/v1/tags`;
        console.log("[API Tags] Fetching from:", url);
        
        const res = await fetch(url, {
            method: "GET",
            headers,
            cache: "no-store"
        });

        console.log("[API Tags] Response status:", res.status);

        // Đọc text trước để có thể debug và parse lại
        const text = await res.text();
        console.log("[API Tags] Response text length:", text.length);
        console.log("[API Tags] Response text:", text);

        let data = null;
        if (text && text.trim()) {
            try {
                data = JSON.parse(text);
                console.log("[API Tags] Parsed successfully");
            } catch (parseError) {
                console.error("[API Tags] Parse error:", parseError);
                return NextResponse.json(
                    { success: false, message: "Không thể parse response từ BE", raw: text.substring(0, 500) },
                    { status: res.status }
                );
            }
        } else {
            console.warn("[API Tags] Response body is empty");
            return NextResponse.json(
                { success: false, message: "BE trả về body rỗng" },
                { status: res.status }
            );
        }

        return NextResponse.json(data, { status: res.status });

    } catch (error) {
        console.error("[API Tags] Fetch error:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi server", error: String(error) },
            { status: 500 }
        );
    }
}

// POST /api/tags - Tạo tag mới (chỉ ADMIN và MODERATOR)
export async function POST(req: NextRequest) {
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

        const res = await fetch(`${API_BASE}/api/v1/tags`, {
            method: "POST",
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
        console.error("Tags POST error:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        );
    }
}

