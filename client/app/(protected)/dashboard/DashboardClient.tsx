'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Ticket } from '@/types/commonType';
import StatCard from '@/components/StatCard';


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
    <>
      <h1 className='font-bold text-5xl text-center mb-10'>DASHBOARD</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <StatCard
          title='Total Tickets'
          label="Total Ticket for this month"
          value={currentMonthTickets.length}
          loading={loading}
          periodLabel={currentMonthName}
        />
        <StatCard
          title='Total Closed Tickets'
          label="Total Closed Ticket for this month"
          value={currentMonthClosedTickets.length}
          loading={loading}
          periodLabel={currentMonthName}
        />
        <StatCard
          title='Total Active Tickets'
          label="As time goes by, it will keep decreasing"
          value={currentMonthActiveTickets.length}
          loading={loading}
          periodLabel={currentMonthName}
        />
      </div>
    </>
  );
};

export default DashboardClient;