import { setAuthToken } from "@/lib/auth";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)


    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError('')
        setLoading(true)

        try {
            // kirim payload login ke BE Golang
            const response = await api.post('/auth/login', {
                email,
                password
            })

            // jika berhasil maka dari hasil hit endpoint, kita akan mendapatkan sebuah Token JWT
            const { token } = response.data;

            // Ketika sudah dapat tokennya tadi, lalu kita masukkan ke dalam setAuthToken agar generate cookie 
            setAuthToken(token)

            // Jika sudah lalu kita redirect langsung dari user login ke halaman dasboard
            router.push('/dashboard')
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Failed connecting to Server. Make sure your server is running.');
            }
        } finally {
            setLoading(false);
        }
    }
}