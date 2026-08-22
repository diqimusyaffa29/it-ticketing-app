import axios from "axios";
import { getCookie } from "cookies-next";

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers:{
        'Content-Type': 'application/json',
    },
});

// interceptor: sisipkan JWT Token dari Cookies ke setiap request
api.interceptors.request.use((config)=>{
    const token = getCookie('token');
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
})


export default api