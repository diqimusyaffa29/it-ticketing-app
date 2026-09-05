import { Metadata } from 'next';
import DashboardClient from './DashboardClient';
import { cookies } from 'next/headers';
import getRoleFromToken from '@/app/helper/getRoleFromToken';
import { redirect } from 'next/navigation';




export const metadata: Metadata = {
    title: 'Dashboard | IT Ticketing',
    description: 'Managing Page IT Ticketing',
};



export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const role = token ? getRoleFromToken(token) : null

    if(role !== "Admin") {
        redirect('/tickets/active-tickets')
    }

    return <DashboardClient />;
}