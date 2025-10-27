"use server"
import "server-only"
import { getUser, hasPermission } from "./dal"
import type { Address } from "./types/user"

/**
 * DTOs returned to client via /api/auth/me
 */
export interface AddressDTO {
    id?: string
    fullName?: string
    phoneNumber?: string
    city?: string
    ward?: string
    street?: string
}

export interface UserDTO {
    id: string
    username?: string
    email?: string
    phoneNumber?: string
    role?: string
    addresses?: AddressDTO[]
    canManageUsers?: boolean
    canManageOrders?: boolean
}

export async function getCurrentUserDTO(): Promise<{ data: UserDTO } | null> {
    const user = await getUser()
    if (!user) return null

    const dto: UserDTO = {
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        addresses: user.addresses?.map((a: Address) => ({
            id: a.id,
            fullName: a.fullName,
            phoneNumber: a.phoneNumber,
            city: a.city,
            ward: a.ward,
            street: a.street,
        })),
        canManageUsers: await hasPermission(user, "users:manage"),
        canManageOrders: await hasPermission(user, "orders:manage"),
    }

    return { data: dto }
}