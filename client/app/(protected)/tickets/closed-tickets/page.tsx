import { Metadata } from 'next';
import ClosedTicketsClient from './ClosedTicketsClient';



export const metadata: Metadata = {
    title: 'Closed Tickets | IT Ticketing',
    description: 'Managing Page IT Ticketing',
};

export default function DashboardPage() {
    return <ClosedTicketsClient />;
}