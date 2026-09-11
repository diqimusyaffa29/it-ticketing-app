'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/axios';
import { Ticket } from '@/types/commonType';

interface StatCardProps {
    label: string;
    value: number;
    loading: boolean;
    periodLabel: string;
}

const StatCard = ({ label, value, loading, periodLabel }: StatCardProps) => (
    <Card>
        <CardHeader className="pb-2">
            <CardDescription>{label}</CardDescription>
            <CardTitle className="text-3xl font-bold">
                {loading ? '...' : value}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-xs text-muted-foreground">Periode: {periodLabel}</p>
        </CardContent>
    </Card>
);

const DashboardClient = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchAllTickets = async () => {
            try {
                const response = await api.get('/tickets');
                setTickets(response.data.data || []);
            } catch (err) {
                console.error('Failed to load tickets', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchAllTickets();
    }, []);

    const now = new Date();
    const currentMonthName = now.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    // Derive semua angka dari SATU sumber data (tickets), bukan 3 fetch terpisah
    const currentMonthTickets = tickets.filter((ticket) => {
        const ticketDate = new Date(ticket.created_at);
        return (
            ticketDate.getMonth() === now.getMonth() &&
            ticketDate.getFullYear() === now.getFullYear()
        );
    });

    const currentMonthClosedTickets = currentMonthTickets.filter(
        (t) => t.status === 'CLOSED'
    );
    const currentMonthActiveTickets = currentMonthTickets.filter(
        (t) => t.status !== 'CLOSED'
    );

    if (error) {
        return <p className="text-center py-8 text-red-500">{error}</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <StatCard
                label="Total Ticket for this month"
                value={currentMonthTickets.length}
                loading={loading}
                periodLabel={currentMonthName}
            />
            <StatCard
                label="Total Closed Ticket for this month"
                value={currentMonthClosedTickets.length}
                loading={loading}
                periodLabel={currentMonthName}
            />
            <StatCard
                label="Total Active Ticket for this month"
                value={currentMonthActiveTickets.length}
                loading={loading}
                periodLabel={currentMonthName}
            />
        </div>
    );
};

export default DashboardClient;