"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getUserRole } from "@/lib/auth";
import api from "@/lib/axios";
import { useCallback, useEffect, useState } from "react";

interface Ticket {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    unit: string;
    reporter_name: string;
    proof_image?: string;
    reporter?: { Name: string }
    assignee?: { Name: string }
}
const unitOptions = [
    { value: "Instalasi Rawat Jalan", label: "Instalasi Rawat Jalan" },
    { value: "LABORATORIUM", label: "LABORATORIUM" },
    { value: "RADIOLOGI", label: "RADIOLOGI" },
    { value: "IGD", label: "IGD" },
    { value: "DAKWAH", label: "DAKWAH" },
    { value: "PENDAFTARAN & REKAM MEDIS", label: "PENDAFTARAN & REKAM MEDIS" },
    { value: "CASEMIX", label: "CASEMIX" },
    { value: "IBS", label: "IBS" },
    { value: "MCU", label: "MCU" },
    { value: "TIMKORDIK", label: "TIMKORDIK" },
    { value: "PSRS", label: "PSRS" },
    { value: "SDI", label: "SDI" },
    { value: "KEUANGAN", label: "KEUANGAN" },
    { value: "HUMAS", label: "HUMAS" },
    { value: "PKRS", label: "PKRS" },
    { value: "FIRDAUS", label: "FIRDAUS" },
    { value: "BAITUNNISA", label: "BAITUNNISA" },
    { value: "DARUSSALAM", label: "DARUSSALAM" },
    { value: "MA'WA", label: "MA'WA" },
    { value: "ISOLASI", label: "ISOLASI" },
    { value: "PERISTI", label: "PERISTI" }
];


export default function DashboardClient() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // State untuk form dan modal
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'LOW',
        unit: '',
        reporter_name: ''
    });

    const [userRole, setUserRole] = useState<string | null>(null)
    const [isUpdateOpen, setIsUpdateOpen] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [updateStatus, setUpdateStatus] = useState('')
    const [proofFile, setProofFile] = useState<File | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)

    // Ambil role


    const loadTickets = useCallback(async () => {
        try {
            const res = await api.get('/tickets');
            setTickets(res.data.data || res.data);
        } catch {
            setError('Failed to get tickets from server');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserRole(getUserRole())
        loadTickets();
    }, [loadTickets]);

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'OPEN':
                return <Badge className="bg-amber-500 hover:bg-amber-600">OPEN</Badge>;
            case 'IN_PROGRESS':
                return <Badge className="bg-blue-500 hover:bg-blue-600">IN PROGRESS</Badge>;
            case 'RESOLVED':
                return <Badge className="bg-emerald-500 hover:bg-emerald-600">RESOLVED</Badge>;
            case 'CLOSED':
                return <Badge variant="secondary">CLOSED</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const handleCreateTicket = async (e: React.SubmitEvent) => {
        e.preventDefault()

        setIsSubmitting(true);
        try {
            await api.post('/tickets', formData)
            setIsDialogOpen(false) //jika berhasil akan tutup modal 
            setFormData({ title: '', description: '', priority: 'LOW', unit: '', reporter_name: '' }) //reset form kembali
            loadTickets()
        } catch {
            alert('Failed to make new ticket')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Function untuk membuka modal dengan data ticket yang dipilih
    const openUpdateModal = (ticket: Ticket) => {
        setSelectedTicket(ticket)
        setUpdateStatus(ticket.status)
        setProofFile(null);
        setIsUpdateOpen(true)
    }

    // Function untuk mengirim PUT ke BE
    const handleUpdateTicket = async (e: React.SubmitEvent) => {
        e.preventDefault()
        if (!selectedTicket) return;

        setIsUpdating(true)
        try {
            const updateFormData = new FormData();
            updateFormData.append('status', updateStatus);

            // Tambahkan file jika ada yang dipilih
            if (proofFile) {
                updateFormData.append('proof_image', proofFile);
            }

            await api.put(`/tickets/${selectedTicket.id}`, updateFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setIsUpdateOpen(false) //tutup dialog ketika sudah bisa hit api tanpa error
            setProofFile(null);
            loadTickets()
        } catch {
            alert('Gagal mengupdate tiket');
        } finally {
            setIsUpdating(false);
        }
    }

    const handleClaimTicket = async (ticketId: number) => {
        // Tampilkan konfirmasi agar tidak kepencet
        if (!confirm("Anda yakin ingin mengambil tiket ini?")) return;

        try {
            // Kita cukup kirim status IN_PROGRESS, backend yang akan otomatis mengisi Assignee-nya
            await api.put(`/tickets/${ticketId}`, {
                status: 'IN_PROGRESS'
            });

            // Refresh data tabel setelah berhasil
            loadTickets();
        } catch {
            alert('Gagal mengambil tiket');
        }
    };

    const getImageUrl = (path: string) => {
        if (path.startsWith('http')) return path;
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        return `${baseURL.replace(/\/$/, '')}${path}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">TICKETING SYSTEM</h1>
                    <p className="text-muted-foreground text-sm">
                        List of complaint tickets and assignment management
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>+ Create Ticket</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Ticket</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateTicket} className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Title</label>
                                <Input
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Contoh: Jaringan Lambat"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Descriptions</label>
                                <Textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Jelaskan detail kendala..."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Priority</label>
                                <select
                                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Unit</label>
                                <select
                                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                >
                                    {unitOptions.map((unit, index) => (
                                        <option key={index} value={unit.value}>{unit.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Reporter Name</label>
                                <Input
                                    required
                                    value={formData.reporter_name}
                                    onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
                                    placeholder="Masukkan nama"
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? 'Menyimpan...' : 'Kirim Tiket'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
                {/* Modal Update Status Tiket */}
                <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Ticket #{selectedTicket?.id}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateTicket} className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Ticket Title</label>
                                <Input value={selectedTicket?.title || ''} disabled className="bg-slate-100" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Ticket Status</label>
                                <select
                                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={updateStatus}
                                    onChange={(e) => setUpdateStatus(e.target.value)}
                                >
                                    <option value="OPEN">OPEN (Menunggu)</option>
                                    <option value="IN_PROGRESS">IN PROGRESS (Sedang Dikerjakan)</option>
                                    <option value="RESOLVED">RESOLVED (Selesai/Terselesaikan)</option>
                                    <option value="CLOSED">CLOSED (Ditutup)</option>
                                </select>
                            </div>
                            {/* Input File Foto Bukti */}
                            <div>
                                <label className="text-sm font-medium mb-1 block">Upload Photo Evidence of Work</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setProofFile(e.target.files[0]);
                                        }
                                    }}
                                />
                                {selectedTicket?.proof_image && !proofFile && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Photo is uploaded, pick a next file if you want to change it
                                    </p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isUpdating}>
                                {isUpdating ? 'Menyimpan...' : 'Update Tiket'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8 text-muted-foreground">Loading Tickets...</p>
                    ) : error ? (
                        <p className="text-center py-8 text-red-500">{error}</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">ID Ticket</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Reporter Account</TableHead>
                                    <TableHead>Reporter Name</TableHead>
                                    <TableHead>Technician</TableHead>
                                    {(userRole === 'Admin' || userRole === 'Teknisi') && (
                                        <TableHead>Actions</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No tickets yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tickets.map((ticket, index: number) => (
                                        <TableRow key={ticket.id || `ticket-${index}`}>
                                            <TableCell className="font-semibold">#{ticket.id}</TableCell>
                                            <TableCell className="font-medium">{ticket.title}</TableCell>
                                            <TableCell>{renderStatusBadge(ticket.status)}</TableCell>
                                            <TableCell>
                                                <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-slate-100">
                                                    {ticket.priority}
                                                </span>
                                            </TableCell>
                                            <TableCell>{ticket.unit || '-'}</TableCell>
                                            <TableCell>{ticket.reporter?.Name || '-'}</TableCell>
                                            <TableCell>{ticket.reporter_name || '-'}</TableCell>
                                            <TableCell>{ticket.assignee?.Name || 'Unassigned'}</TableCell>
                                            <TableCell>
                                                {ticket.proof_image ? (
                                                    <a
                                                        href={getImageUrl(ticket.proof_image)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 underline font-medium hover:text-blue-800"
                                                    >
                                                        See Photos
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            {/* Logika khusus Teknisi & Admin */}
                                            {(userRole === 'Admin' || userRole === 'Teknisi') && (
                                                <TableCell className="text-right space-x-2">
                                                    {ticket.status === 'OPEN' ? (
                                                        // Jika masih OPEN, munculkan tombol cepat AMBIL TIKET
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="bg-blue-600 hover:bg-blue-700"
                                                            onClick={() => handleClaimTicket(ticket.id)}
                                                        >
                                                            Take Ticket
                                                        </Button>
                                                    ) : (
                                                        // Jika sudah IN_PROGRESS / status lain, munculkan tombol UPDATE biasa
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openUpdateModal(ticket)}
                                                        >
                                                            Update
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}