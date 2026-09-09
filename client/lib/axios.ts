import axios from "axios";
import { getCookie } from "cookies-next";
import { removeAuthToken } from "./auth";

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
        // Cek apakah request berasal dari endpoint login
        const isLoginEndpoint = error.config?.url?.includes('/auth/login');

        // HANYA jalankan redirect token expired jika 401 dan BUKAN dari form login
        if (error.response?.status === 401 && !isLoginEndpoint) {
            removeAuthToken();
            if (typeof window !== 'undefined') {
                // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                window.location.href = '/login'; // Gunakan window.location.href, jangan redirect() dari Next.js
            }
        }
        return Promise.reject(error)
    }
)


export default api