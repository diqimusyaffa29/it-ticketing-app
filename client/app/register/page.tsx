'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegsisterPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('Pelapor')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)


    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Kirim request registrasi ke BE
            await api.post('/auth/register/', {
                name,
                email,
                password,
                role
            })

            // Kalau sudah berhasil mendaftarkan akun, maka akan langsung diredirect ke halaman login
            router.push('/login?registered=true')
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Failed to register. Make sure your server is running.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Register New Account
                    </CardTitle>
                    <CardDescription className="text-center">
                        Fill this form below to make IT Ticketing Account
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
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="........."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={role} onValueChange={(value) => setRole(value)}>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Choose Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pelapor">Pelapor</SelectItem>
                                    <SelectItem value="Teknisi">Teknisi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Processing...' : 'Register Now'}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            Already have an Account??{' '}
                            <a href="/login" className="text-primary underline">
                                Login Here
                            </a>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )

}