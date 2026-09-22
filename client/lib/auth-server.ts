import 'server-only'
import { cookies } from 'next/headers'
import { getCookie } from "cookies-next"
import type { JWTPayload } from './auth'
import { decodeToken } from './decode-token'

export const getUserDataServer = async (): Promise<JWTPayload | null> => {
    const token = await getCookie('token', { cookies })
    return decodeToken(token as string)
}