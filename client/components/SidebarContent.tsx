import { Button } from "./ui/button"

interface SidebarContentProps {
    handleLogout: () => void
    role: string | null
}

const SidebarContent = ({ handleLogout, role }: SidebarContentProps) => {
    return (
        <>
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
        </>
    )
}

export default SidebarContent
