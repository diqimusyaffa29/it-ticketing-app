"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/axios";
import { useEffect, useState } from "react";

interface Ticket {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    reporter?: { Name: string }
    assignee?: { Name: string }
}


export default function DashboardClient() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false

        const loadTickets = async () => {
            try {
                const res = await api.get('/tickets')
                console.log(res);
                if (!cancelled) {
                    setTickets(res.data.data || res.data)
                }
            } catch {
                if (!cancelled) {
                    setError('Failed to get tickets from server')
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        void loadTickets()

        return () => {
            cancelled = true
        }
    }, [])

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">TICKETING SYSTEM</h1>
                    <p className="text-muted-foreground text-sm">
                        List of complaint tickets and assignment management 
                    </p>
                </div>
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
                                    <TableHead>Reporter</TableHead>
                                    <TableHead>Technician</TableHead>
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
                                            <TableCell>{ticket.reporter?.Name || '-'}</TableCell>
                                            <TableCell>{ticket.assignee?.Name || 'Unassigned'}</TableCell>
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