'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { removeAuthToken, getUserRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        Promise.resolve().then(() => {
            setRole(getUserRole());
        });
    }, []);

    const handleLogout = () => {
        removeAuthToken();
        router.push('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar Navigasi */}
            <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col justify-between">
                <div>
                    <h2 className="text-l font-bold mb-8 text-primary-foreground">
                        IT TICKETING SYSTEM
                    </h2>
                    <nav className="space-y-2">
                        <a
                            href="/dashboard"
                            className="block py-2.5 px-4 rounded bg-slate-800 text-white font-medium hover:bg-slate-700 transition"
                        >
                            Dashboard Tiket
                        </a>
                    </nav>
                </div>

                {/* Profil Singkat & Logout */}
                <div className="pt-6 border-t border-slate-800 space-y-3">
                    <div className="text-xs text-slate-400">
                        Login as:{' '}
                        <span className="font-semibold text-white uppercase">{role || 'USER'}</span>
                    </div>
                    <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Area Konten Utama */}
            <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        </div>
    );
}