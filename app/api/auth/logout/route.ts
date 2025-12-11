import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(_req: NextRequest) {
    try {
        const cookieStore = cookies()
        
        // Xóa tất cả các cookie liên quan đến auth
        cookieStore.delete("auth-token")
        cookieStore.delete("access_token")
        cookieStore.delete("token")

        return NextResponse.json({ success: true, message: "Đã đăng xuất thành công" })
    } catch (e) {
        console.error("Logout error:", e)
        return NextResponse.json(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        )
    }
}

