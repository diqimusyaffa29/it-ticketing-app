"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getImageUrl } from "@/helper/getImageUrl";
import { renderStatusBadge } from "@/helper/renderStatusBadge";
import { getUserRole } from "@/lib/auth";
import api from "@/lib/axios";
import { Ticket } from "@/types/commonType";
import { useCallback, useEffect, useRef, useState } from "react";


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


export default function ActiveTicketsClient() {
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
        unit: unitOptions[0].value,
        reporter_name: ''
    });

    const [userRole, setUserRole] = useState<string | null>(null)
    const [isUpdateOpen, setIsUpdateOpen] = useState(false)
    const [isTakeTicketOpen, setIsTakeTicketOpen] = useState(false)
    const [isTakingTicket, setIsTakingTicket] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [updateStatus, setUpdateStatus] = useState('')
    const [proofFile, setProofFile] = useState<File | null>(null)
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const [removeExistingProof, setRemoveExistingProof] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

    // state kamera
    const [isCameraActive, setIsCameraActive] = useState(false)
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null);


    const loadTickets = useCallback(async () => {
        try {
            const res = await api.get('/tickets/active');
            const allTickets = res.data.data || res.data
            const activeTickets = allTickets.filter((t: Ticket) => t.status !== "CLOSED")
            setTickets(activeTickets);
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
    }, [cameraStream])
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
        setRemoveExistingProof(false)
        setIsUpdateOpen(true);
    };

    const openTakeTicketModal = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setIsTakeTicketOpen(true);
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

    const handleConfirmTakeTicket = async () => {
        if (!selectedTicket) return;

        setIsTakingTicket(true);
        try {
            await api.put(`/tickets/${selectedTicket.id}`, {
                status: 'IN_PROGRESS'
            });
            setIsTakeTicketOpen(false);
            loadTickets();
        } catch {
            alert('Failed taking the ticket');
        } finally {
            setIsTakingTicket(false);
        }
    };

    const handleCloseTicket = async (ticketId: string) => {
        // Tampilkan konfirmasi agar tidak langsung ke hit
        if (!confirm("Are you sure want to close this ticket?")) return;

        try {
            // Hit put lagi untuk ubah status ticket menjadi close
            await api.put(`/tickets/${ticketId}`, {
                status: 'CLOSED'
            });

            // Refresh kembali data table setelah berhasil diclose
            loadTickets()
        } catch (error) {
            alert("Failed to close ticket" + error)
        }
    }

    

    const ActionButton = ({ ticket }: { ticket: Ticket }) => (
        ticket.status === 'OPEN' ? (
            <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                onClick={() => openTakeTicketModal(ticket)}
            >
                Take Ticket
            </Button>
        ) : (
            <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => openUpdateModal(ticket)}
            >
                Update
            </Button>
        )
    );

    const CloseTicketButton = ({ ticket }: { ticket: Ticket }) => {
        const isClosed = ticket.status === "CLOSED"
        return (
            <Button
                variant="default"
                size="sm"
                className={`w-full sm:w-auto ${isClosed
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed hover:bg-slate-300'
                    : 'bg-red-600 hover:bg-red-700 cursor-pointer'
                    }`}
                onClick={() => handleCloseTicket(ticket.id)}
            >
                {isClosed ? "Closed" : "Close Ticket"}
            </Button>
        );
    }

    return (
        <div className="space-y-6 px-3 sm:px-0">
            {/* HEADER: stack vertikal di mobile, sejajar di sm ke atas */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">CURRENTLY ACTIVE TICKETS PAGE</h1>
                    <p className="text-muted-foreground text-sm">
                        List of complaint tickets and assignment management from your input
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto cursor-pointer bg-green-500 hover:bg-green-600 ">+ Create Ticket</Button>
                            </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="bg-slate-900 text-white">
                            <p>Create new Ticket</p>
                        </TooltipContent>
                    </Tooltip>
                    <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
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
                                {isSubmitting ? 'Creating...' : 'Create Ticket'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Update Status Tiket */}
                <Dialog open={isUpdateOpen} onOpenChange={(open) => {
                    setIsUpdateOpen(open);
                    if (!open) stopCamera();
                }}>
                    <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg wrap-break-word">
                                Update Ticket #{selectedTicket?.id}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateTicket} className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Ticket Title</label>
                                <Input value={selectedTicket?.title || ''} disabled className="bg-slate-100" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground block mb-1">Description</label>
                                <p className="text-sm whitespace-pre-wrap">{selectedTicket?.description || ''}</p>
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
                                <label className="text-sm font-medium block">Work Proof Picture</label>

                                {isCameraActive ? (
                                    <div className="space-y-2">
                                        <div className="relative overflow-hidden rounded-md bg-black h-56 sm:h-96 flex items-center justify-center">
                                            <video ref={videoRef} autoPlay playsInline />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Button type="button" onClick={capturePhoto} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                                📷 Take Photo
                                            </Button>
                                            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={stopCamera}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : proofPreview ? (
                                    // Kasus: sudah pilih/ambil foto BARU
                                    <div className="space-y-2">
                                        <div className="relative h-48 sm:h-40 w-full overflow-hidden rounded-md border">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={proofPreview} alt="Preview Bukti Baru"  />
                                        </div>
                                        <Button type="button" variant="destructive" size="sm" className="w-full" onClick={clearSelectedProof}>
                                            Delete / Replace Photo
                                        </Button>
                                    </div>
                                ) : selectedTicket?.proof_image && !removeExistingProof ? (
                                    // Kasus: ada foto LAMA di server, belum ditandai untuk dihapus
                                    <div className="space-y-2">
                                        <div className="relative h-56 sm:h-96 w-full overflow-hidden rounded-md border">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={getImageUrl(selectedTicket.proof_image)}
                                                alt="Foto Bukti Tersimpan"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">*Foto bukti lama sudah tersimpan di server.</p>
                                        <div className="flex flex-col gap-2">
                                            <Button type="button" variant="outline" className="w-full" onClick={startCamera}>
                                                📷 Replace with Camera
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="w-full sm:w-auto"
                                                onClick={() => setRemoveExistingProof(true)}
                                            >
                                                Delete
                                            </Button>
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
                                ) : (
                                    // Kasus: tidak ada foto sama sekali (baru / sudah dihapus)
                                    <div className="space-y-3">
                                        {removeExistingProof && (
                                            <p className="text-xs text-red-600">*Foto lama akan dihapus setelah disimpan.</p>
                                        )}
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" className="w-full" onClick={startCamera}>
                                                📷 Open Camera
                                            </Button>
                                        </div>
                                        <div className="relative text-center text-xs text-muted-foreground uppercase after:absolute after:inset-x-0 after:top-1/2 after:-z-10 after:h-px after:bg-border">
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
                            </div>

                            <Button type="submit" className="w-full" disabled={isUpdating}>
                                {isUpdating ? 'Updating...' : 'Update Ticket'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
                {/* Modal Take Ticket — detail tiket sebelum konfirmasi ambil */}
                <Dialog open={isTakeTicketOpen} onOpenChange={setIsTakeTicketOpen}>
                    <DialogContent className="w-[95vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Take Ticket</DialogTitle>
                        </DialogHeader>

                        {selectedTicket && (
                            <div className="space-y-4 mt-2">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground block mb-1">Title</label>
                                    <p className="text-sm font-semibold">{selectedTicket.title}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground block mb-1">Description</label>
                                    <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">Priority</label>
                                        <span className={`inline-block font-mono text-xs font-semibold px-2 py-1 rounded ${selectedTicket.priority === "HIGH" ? "bg-red-500 text-white" : selectedTicket.priority === "MEDIUM" ? "bg-yellow-500 text-white" : "bg-slate-100"}`}>
                                            {selectedTicket.priority}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">Unit</label>
                                        <p className="text-sm">{selectedTicket.unit}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground block mb-1">Reporter Name</label>
                                    <p className="text-sm">{selectedTicket.reporter_name || '-'}</p>
                                </div>

                                <div className="flex flex-col gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setIsTakeTicketOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        disabled={isTakingTicket}
                                        onClick={handleConfirmTakeTicket}
                                    >
                                        {isTakingTicket ? 'Taking...' : 'Confirm Take Ticket'}
                                    </Button>
                                </div>
                            </div>
                        )}
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
                    ) : tickets.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No tickets yet.</p>
                    ) : (
                        <>
                            {/* ===== TAMPILAN TABEL — hanya muncul di md ke atas ===== */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16 text-center">No. Ticket</TableHead>
                                            <TableHead className="text-center">Title</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="text-center">Priority</TableHead>
                                            <TableHead className="text-center">Unit</TableHead>
                                            <TableHead className="text-center">Reporter Account</TableHead>
                                            <TableHead className="text-center">Reporter Name</TableHead>
                                            <TableHead className="text-center">Technician</TableHead>
                                            <TableHead className="text-center">Evidence of Work</TableHead>
                                            {(userRole === 'Admin' || userRole === 'Teknisi') && (
                                                <TableHead className="text-center">Actions</TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tickets.map((ticket, index: number) => (
                                            <TableRow key={ticket.id || `ticket-${index}`} className="text-center">
                                                <TableCell className="font-semibold">#{ticket.id.slice(0, 8)}.....</TableCell>
                                                <TableCell className="font-medium">{ticket.title}</TableCell>
                                                <TableCell>{renderStatusBadge(ticket.status)}</TableCell>
                                                <TableCell>
                                                    <span className={`font-mono text-xs font-semibold px-2 py-1 rounded ${ticket.priority == "HIGH" ? "bg-red-500 text-white" : ticket.priority == "MEDIUM" ? "bg-yellow-500 text-white" : "bg-background"}`} >
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
                                                    <TableCell className="space-x-2">
                                                        {ticket.status === "RESOLVED" || ticket.status === 'CLOSED' ? (
                                                            <>
                                                                <ActionButton ticket={ticket} />
                                                                <CloseTicketButton ticket={ticket} />
                                                            </>
                                                        ) : (
                                                            <ActionButton ticket={ticket} />
                                                        )}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* ===== TAMPILAN CARD — hanya muncul di bawah md (mobile) ===== */}
                            <div className="md:hidden space-y-3">
                                {tickets.map((ticket, index: number) => (
                                    <div
                                        key={ticket.id || `ticket-card-${index}`}
                                        className="border rounded-lg p-4 space-y-2 bg-white shadow-sm"
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <p className="text-xs text-muted-foreground">#{index + 1}</p>
                                                <p className="font-semibold leading-snug">{ticket.title}</p>
                                            </div>
                                            {renderStatusBadge(ticket.status)}
                                        </div>

                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <span className={`font-mono font-semibold px-2 py-1 rounded ${ticket.priority == "HIGH" ? "bg-red-500 text-white" : ticket.priority == "MEDIUM" ? "bg-yellow-500 text-white" : "bg-slate-100"}`}>
                                                {ticket.priority}
                                            </span>
                                            <span className="px-2 py-1 rounded bg-slate-100">{ticket.unit || '-'}</span>
                                        </div>

                                        <div className="text-sm grid grid-cols-2 gap-x-2 gap-y-1 pt-1">
                                            <span className="text-muted-foreground">Reporter Account</span>
                                            <span className="text-right">{ticket.reporter?.Name || '-'}</span>

                                            <span className="text-muted-foreground">Reporter Name</span>
                                            <span className="text-right">{ticket.reporter_name || '-'}</span>

                                            <span className="text-muted-foreground">Technician</span>
                                            <span className="text-right">{ticket.assignee?.Name || 'Unassigned'}</span>
                                        </div>

                                        {ticket.proof_image ? (
                                            <a
                                                href={getImageUrl(ticket.proof_image)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 underline font-medium block"
                                            >
                                                See work proof Picture
                                            </a>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">No proof image</p>
                                        )}

                                        {(userRole === 'Admin' || userRole === 'Teknisi') && (
                                            <div className="pt-2">
                                                {ticket.status === "RESOLVED" || ticket.status === 'CLOSED' ? (
                                                    <>
                                                        <ActionButton ticket={ticket} />
                                                        <CloseTicketButton ticket={ticket} />
                                                    </>
                                                ) : (
                                                    <ActionButton ticket={ticket} />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}