import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserDTO } from '@/lib/dto'

export async function GET(request: NextRequest) {
    try {
        // Get user data using the existing server-side logic
        const userDTO = await getCurrentUserDTO()

        if (!userDTO) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        return NextResponse.json(userDTO)
    } catch (error) {
        console.error('Auth me API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}