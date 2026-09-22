import { deleteCookie, getCookie, setCookie } from "cookies-next"
import { decodeToken } from "./decode-token"

export interface JWTPayload {
    user_id: string
    username: string
    role: string
    exp: number
}

// Simpan token ke dalam cookies dengan masa berlaku (1 Hari)
export const setAuthToken = (token: string) => {
    setCookie('token', token, {
        maxAge: 60 * 60 * 24, //1 hari 
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    })
}

export const removeAuthToken = () => {
    deleteCookie('token')
}

// Ambil role user dari cookie
export const getUserData = (): JWTPayload | null => {
    const token = getCookie('token');

    return decodeToken(token as string)
}