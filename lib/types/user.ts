export interface Address {
    id?: string
    fullName?: string
    phoneNumber?: string
    city?: string
    ward?: string
    street?: string
}

export interface User {
    id: string
    username?: string
    email?: string
    phoneNumber?: string
    role?: "CUSTOMER" | "ADMIN" | "STAFF" | "MODERATOR" | string
    addresses?: Address[]
    token?: string
}