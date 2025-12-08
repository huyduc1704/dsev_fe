import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

function getApiBaseUrl() {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || "http://localhost:8080";
    return raw.replace(/\/+$/, ""); // trim all trailing slashes to avoid double-slash in path
}

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json()

        if (!username || !password) {
            return NextResponse.json(
                { message: "Username and password are required." },
                { status: 400 }
            )
        }

        const API_BASE_URL = getApiBaseUrl()
        const loginUrl = `${API_BASE_URL}/api/v1/auth/login`

        console.log('Login attempt for user:', username)
        console.log('API_BASE_URL:', API_BASE_URL)
        console.log('LOCKNLOCK_API_URL env var:', process.env.LOCKNLOCK_API_URL)
        console.log('All env vars starting with LOCKNLOCK:', Object.keys(process.env).filter(key => key.startsWith('LOCKNLOCK')))
        console.log('NODE_ENV:', process.env.NODE_ENV)

        console.log('Login URL (normalized):', loginUrl)
        const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })

        console.log('DSEV API response status:', response.status)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Login failed' }))
            console.log('DSEV API error:', errorData)
            return NextResponse.json(
                { error: errorData.message || 'Invalid credentials' },
                { status: response.status }
            )
        }
        const data = await response.json()
        console.log('DSEV API success response:', data)

        // Extract access token from response
        const userData = data.data || data
        const accessToken = userData.accessToken || data.accessToken

        if (!accessToken) {
            console.error('No access token in response:', data)
            return NextResponse.json(
                { error: 'Authentication failed - no token received' },
                { status: 401 }
            )
        }

        // Set HTTP-only cookie with the token
        const cookieStore = await cookies()
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        cookieStore.set('auth-token', accessToken, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        })

        console.log('Cookie set successfully')

        // Return success response
        return NextResponse.json({
            success: true,
            data: userData
        })

    } catch (error) {
        console.error('Login API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
