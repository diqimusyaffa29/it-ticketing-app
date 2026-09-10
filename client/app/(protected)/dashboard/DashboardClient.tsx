'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/axios';


interface Ticket {
  id: number;
  created_at: string;
  status: string;
}

const DashboardClient = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/tickets');
        setTickets(response.data.data || []);
      } catch (error) {
        console.error('Failed to load tickets', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Filter tiket yang dibuat pada bulan dan tahun berjalan saat ini
  const now = new Date();
  const currentMonthTickets = tickets.filter((ticket) => {
    const ticketDate = new Date(ticket.created_at);
    return (
      ticketDate.getMonth() === now.getMonth() &&
      ticketDate.getFullYear() === now.getFullYear()
    );
  });

  // Nama bulan saat ini (contoh: "September 2026")
  const currentMonthName = now.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Ticket for this month</CardDescription>
          <CardTitle className="text-3xl font-bold">
            {loading ? '...' : currentMonthTickets.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Periode: {currentMonthName}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardClient;