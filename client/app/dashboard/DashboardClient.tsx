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
import { useCallback, useEffect, useRef, useState } from "react";

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
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false)

    // state kamera
    const [isCameraActive, setIsCameraActive] = useState(false)
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null);


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

    // fungsi logika kamemra

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" } //priortias kamera belakang
            })
            setCameraStream(stream)
            setIsCameraActive(true)

            // pasang stream ke elemen video
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100)
        } catch (error) {
            alert("Failed accessing Camera. make sure to allow camera" + error)
        }
    }

    const stopCamera = useCallback(() => {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop())
            setCameraStream(null)
        }
        setIsCameraActive(false)
    },[cameraStream])
    // Matikan stream kamera ketika modal update ditutup
    useEffect(() => {
        if (!isUpdateOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            stopCamera();
        }
    }, [isUpdateOpen, stopCamera]);

    const capturePhoto = () => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if (blob) {
                    // Buat Objek File dari hasil tangkapan kamera
                    const capturedFile = new File([blob], `proof_camera_${Date.now()}.jpg`, {
                        type: "image/jpeg"
                    });
                    setProofFile(capturedFile);
                    setProofPreview(URL.createObjectURL(capturedFile));
                }
            }, "image/jpeg", 0.85);
        }

        // Matikan kamera setelah mengambil foto
        stopCamera();
    };

    const handleFileChange = (file: File | null) => {
        if (file) {
            setProofFile(file);
            setProofPreview(URL.createObjectURL(file));
        }
    };

    const clearSelectedProof = () => {
        setProofFile(null);
        setProofPreview(null);
    };

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
        setSelectedTicket(ticket);
        setUpdateStatus(ticket.status);
        setProofFile(null);
        setProofPreview(null);
        setIsUpdateOpen(true);
    };

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
            clearSelectedProof()
            loadTickets()
        } catch {
            alert('Failed updating ticket');
        } finally {
            setIsUpdating(false);
        }
    }

    const handleClaimTicket = async (ticketId: number) => {
        // Tampilkan konfirmasi agar tidak kepencet
        if (!confirm("Are you sure want to take this ticket??")) return;

        try {
            // Kita cukup kirim status IN_PROGRESS, backend yang akan otomatis mengisi Assignee-nya
            await api.put(`/tickets/${ticketId}`, {
                status: 'IN_PROGRESS'
            });

            // Refresh data tabel setelah berhasil
            loadTickets();
        } catch {
            alert('Failed taking the ticket');
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
                <Dialog open={isUpdateOpen} onOpenChange={(open) => {
                    setIsUpdateOpen(open);
                    if (!open) stopCamera();
                }}>
                    <DialogContent className="max-w-md">
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

                            {/* BAGIAN UPLOAD & TAKE PICTURE PROOF */}
                            <div className="space-y-2 border p-3 rounded-md bg-slate-50">
                                <label className="text-sm font-medium block">Foto Bukti Pengerjaan</label>

                                {/* 1. JIKA KAMERA AKTIF */}
                                {isCameraActive ? (
                                    <div className="space-y-2">
                                        <div className="relative overflow-hidden rounded-md bg-black h-48 flex items-center justify-center">
                                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" onClick={capturePhoto} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                                📷 Ambil Foto
                                            </Button>
                                            <Button type="button" variant="outline" onClick={stopCamera}>
                                                Batal
                                            </Button>
                                        </div>
                                    </div>
                                ) : proofPreview ? (
                                    /* 2. JIKA SUDAH ADA FOTO YANG DIPILIH / DITANGKAP */
                                    <div className="space-y-2">
                                        <div className="relative h-40 w-full overflow-hidden rounded-md border">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={proofPreview} alt="Preview Bukti" className="w-full h-full object-cover" />
                                        </div>
                                        <Button type="button" variant="destructive" size="sm" className="w-full" onClick={clearSelectedProof}>
                                            Delete / Replace Photo
                                        </Button>
                                    </div>
                                ) : (
                                    /* 3. OPSI PILIHAN UPLOAD / AMBIL FOTO */
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" className="w-full" onClick={startCamera}>
                                                📷 Open Camera
                                            </Button>
                                        </div>
                                        <div className="relative text-center text-xs text-muted-foreground uppercase after:absolute after:inset-x-0 after:top-1/2 after:-z-10 after:h-[1px] after:bg-border">
                                            <span className="bg-slate-50 px-2">or Upload File</span>
                                        </div>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    handleFileChange(e.target.files[0]);
                                                }
                                            }}
                                        />
                                    </div>
                                )}

                                {selectedTicket?.proof_image && !proofFile && !isCameraActive && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        *Foto bukti lama sudah tersimpan di server.
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
                                    <TableHead>Proof</TableHead>
                                    {(userRole === 'Admin' || userRole === 'Teknisi') && (
                                        <TableHead className="text-right">Actions</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
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
                                                        See work proof Picture
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            {(userRole === 'Admin' || userRole === 'Teknisi') && (
                                                <TableCell className="text-right space-x-2">
                                                    {ticket.status === 'OPEN' ? (
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="bg-blue-600 hover:bg-blue-700"
                                                            onClick={() => handleClaimTicket(ticket.id)}
                                                        >
                                                            Take Ticket
                                                        </Button>
                                                    ) : (
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