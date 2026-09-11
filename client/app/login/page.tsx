'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setAuthToken } from "@/lib/auth";
import api from "@/lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const searchParams = useSearchParams()
    const isRegistered = searchParams.get('registered') === 'true'


    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError('')
        setLoading(true)

        try {
            // kirim payload login ke BE Golang
            const response = await api.post('/auth/login', {
                username,
                password
            })

            // jika berhasil maka dari hasil hit endpoint, kita akan mendapatkan sebuah Token JWT
            const { token } = response.data;

            // Ketika sudah dapat tokennya tadi, lalu kita masukkan ke dalam setAuthToken agar generate cookie 
            setAuthToken(token)

            // Jika sudah lalu kita redirect langsung dari user login ke halaman dasboard
            router.replace('/dashboard')
        } catch (error: any) {
            if (error.response) {
                setError(error.response.data.error);
            } else {
                setError('Failed connecting to Server. Make sure your server is running.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
        {isRegistered && (
            <div className="p-3 text-sm text-green-600 bg-green-100 rounded-sm border border-green-200">
                Registration success, please login with your new account
            </div>
        )}
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        IT Ticketing System
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your username and password to login
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md border border-red-200">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="insert your username here"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="insert your password here"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 mt-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Checking Credentials' : 'Login'}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            Doesn&apos;t have account? {' '}
                            <a href="/register" className="text-primary underline">
                                Register here
                            </a>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
        </>
    )
}