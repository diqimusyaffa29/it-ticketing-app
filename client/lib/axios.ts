import axios from "axios";
import { getCookie } from "cookies-next";
import { removeAuthToken } from "./auth";
import { redirect } from "next/navigation";

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// interceptor: sisipkan JWT Token dari Cookies ke setiap request
api.interceptors.request.use((config) => {
    const token = getCookie('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
})

// interceptop untuk tangani token invalid/expired secara global 
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            removeAuthToken()
            if (typeof window !== 'undefined') {
                redirect('/login')
            }
        }
        return Promise.reject(error)
    }
)


export default api