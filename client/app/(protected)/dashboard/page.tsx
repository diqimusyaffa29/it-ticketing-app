import { Metadata } from 'next';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';
import { getUserDataServer } from '@/lib/auth-server';




export const metadata: Metadata = {
    title: 'Dashboard | IT Ticketing',
    description: 'Managing Page IT Ticketing',
};



export default async function DashboardPage() {
    const userData = await getUserDataServer()

    const role = userData?.role ?? null

    if (role !== "Admin") {
        redirect('/tickets/active-tickets')
    }

    return <DashboardClient />;
}