import { Metadata } from 'next';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';
import { getUserData } from '@/lib/auth';




export const metadata: Metadata = {
    title: 'Dashboard | IT Ticketing',
    description: 'Managing Page IT Ticketing',
};



export default async function DashboardPage() {
    const userData = getUserData()

    const role = userData?.role ?? null

    if (role !== "Admin") {
        redirect('/tickets/active-tickets')
    }

    return <DashboardClient />;
}