import { jwtDecode } from "jwt-decode"
import { JWTPayload } from "./auth"


export const decodeToken = (token: string | undefined | null): JWTPayload | null => {
    if (!token) return null
    try {
        return jwtDecode<JWTPayload>(token)
    } catch {
        return null
    }
}