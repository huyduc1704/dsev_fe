import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");

// GET /api/admin/products/[id]/images - Lấy danh sách images của product
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const res = await fetch(`${API_BASE}/api/v1/products/${params.id}/images`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
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
        console.error("Product images GET error:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        );
    }
}

// POST /api/admin/products/[id]/images - Upload images cho product
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { success: false, message: "Không có file nào được upload" },
                { status: 400 }
            );
        }

        // Tạo FormData để gửi lên BE
        const uploadFormData = new FormData();
        files.forEach((file) => {
            uploadFormData.append("files", file);
        });

        const res = await fetch(`${API_BASE}/api/v1/products/${params.id}/images`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                // Không set Content-Type, browser sẽ tự động set với boundary cho multipart/form-data
            },
            body: uploadFormData,
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
        console.error("Product images POST error:", error);
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        );
    }
}

