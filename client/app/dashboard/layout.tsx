'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { removeAuthToken, getUserRole } from '@/lib/auth';
import { Menu, X } from 'lucide-react';
import SidebarContent from '@/components/SidebarContent';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
            {/* Sidebar Navigasi — permanen di desktop (md ke atas) */}
            <aside className="hidden md:flex w-64 bg-slate-900 text-white p-6 flex-col justify-between">
                <SidebarContent handleLogout={handleLogout} role={role} />
            </aside>

            {/* Overlay + Drawer Sidebar — cuma muncul di mobile ketika dibuka */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    {/* Overlay gelap, klik untuk menutup */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    {/* Panel drawer */}
                    <aside className="absolute left-0 top-0 h-full w-64 bg-slate-900 text-white p-6 flex flex-col justify-between">
                        <button
                            className="absolute top-4 right-4 text-white"
                            onClick={() => setIsSidebarOpen(false)}
                            aria-label="Close menu"
                        >
                            <X size={22} />
                        </button>
                        <SidebarContent handleLogout={handleLogout} role={role} />
                    </aside>
                </div>
            )}

            {/* Area Konten Utama */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar — cuma muncul di mobile untuk tombol hamburger */}
                <header className="md:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3">
                    <span className="font-bold text-sm">IT TICKETING SYSTEM</span>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={22} />
                    </button>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}