import { NextRequest, NextResponse } from "next/server"

function getApiBaseUrl() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || "http://localhost:8080"
    return raw.replace(/\/+$/, "")
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        if (!body.username || !body.email || !body.password || !body.phoneNumber) {
            return NextResponse.json(
                { message: "Username, email, password and phoneNumber are required." },
                { status: 400 }
            )
        }

        const API_BASE_URL = getApiBaseUrl()
        const registerUrl = `${API_BASE_URL}/api/v1/auth/register`

        console.log('Register attempt for user:', body.username)
        console.log('Register URL:', registerUrl)

        const response = await fetch(registerUrl, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
        })

        console.log('Register API response status:', response.status)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Register failed' }))
            console.log('Register API error:', errorData)
            return NextResponse.json(
                { error: errorData.message || 'Registration failed' },
                { status: response.status }
            )
        }

        const data = await response.json()
        console.log('Register API success response:', data)

        // Return success response
        return NextResponse.json({
            success: true,
            message: data.message || "Đăng ký thành công",
            data: data.data || {}
        })

    } catch (error) {
        console.error('Register API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

