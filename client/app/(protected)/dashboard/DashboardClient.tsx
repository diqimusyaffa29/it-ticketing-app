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
  const [closedTickets, setClosedTickets] = useState<Ticket[]>([]);
  const [activeTickets, setActiveTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllTickets = async () => {
      try {
        const response = await api.get('/tickets');
        setTickets(response.data.data || []);
      } catch (error) {
        console.error('Failed to load tickets', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchClosedTickets = async() =>{
      try {
        const response = await api.get('/tickets/closed')
        setClosedTickets(response.data.data || [])
      } catch (error) {
        console.error('Failed to load Closed Tickets', error)
      } finally{
        setLoading(false)
      }
    }
    const fetchActiveTickets = async() =>{
      try {
        const response = await api.get('/tickets/active')
        setActiveTickets(response.data.data || [])
      } catch (error) {
        console.error('Failed to load Active Tickets', error)
      } finally{
        setLoading(false)
      }
    }

    fetchAllTickets();
    fetchClosedTickets();
    fetchActiveTickets();
  }, []);

  // Filter tiket yang dibuat pada bulan dan tahun berjalan saat ini
  const now = new Date();
  const currentMonthAllTickets = tickets.filter((ticket) => {
    const ticketDate = new Date(ticket.created_at);
    return (
      ticketDate.getMonth() === now.getMonth() &&
      ticketDate.getFullYear() === now.getFullYear()
    );
  });
  const currentMonthClosedTickets = closedTickets.filter((ticket) => {
    const ticketDate = new Date(ticket.created_at);
    return (
      ticketDate.getMonth() === now.getMonth() &&
      ticketDate.getFullYear() === now.getFullYear()
    );
  });
  const currentMonthActiveTickets = activeTickets.filter((ticket) => {
    const ticketDate = new Date(ticket.created_at);
    return (
      ticketDate.getMonth() === now.getMonth() &&
      ticketDate.getFullYear() === now.getFullYear()
    );
  });

  // Nama bulan saat ini (contoh: "September 2026")
  const currentMonthName = now.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Ticket for this month</CardDescription>
          <CardTitle className="text-3xl font-bold">
            {loading ? '...' : currentMonthAllTickets.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Periode: {currentMonthName}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Closed Ticket for this month</CardDescription>
          <CardTitle className="text-3xl font-bold">
            {loading ? '...' : currentMonthClosedTickets.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Periode: {currentMonthName}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Closed Ticket for this month</CardDescription>
          <CardTitle className="text-3xl font-bold">
            {loading ? '...' : currentMonthActiveTickets.length}
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