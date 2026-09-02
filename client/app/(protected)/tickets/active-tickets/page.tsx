import { Metadata } from 'next';
import ActiveTicketsClient from './ActiveTicketsClient';



export const metadata: Metadata = {
    title: 'Active Tickets | IT Ticketing',
    description: 'Managing Page IT Ticketing',
};

export default function DashboardPage() {
    return <ActiveTicketsClient />;
}