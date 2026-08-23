import { deleteCookie, getCookie, setCookie } from "cookies-next"
import { jwtDecode } from "jwt-decode"

interface JWTPayload {
    user_id: number
    role: string
    exp: number
}

// Simpan token ke dalam cookies dengan masa berlaku (1 Hari)
export const setAuthToken = (token: string) => {
    setCookie('token', token,{
        maxAge: 60 * 60 * 24, //1 hari 
        path:'/',
        secure:process.env.NODE_ENV ==='production',
        sameSite: 'lax',
    })
}

export const removeAuthToken = () =>{
    deleteCookie('token')
}

// Ambil role user dari cookie
export const getUserRole = (): string | null =>{
    const token = getCookie('token');
    if(!token) return null

    try {
        const decoded = jwtDecode<JWTPayload>(token as string);
        return decoded.role
    } catch {
        return null
    }
}