import { Metadata } from 'next';
import DashboardClient from './DahboardCient';


export const metadata: Metadata = {
    title: 'Dashboard | IT Ticketing',
    description: 'Managing Page IT Ticketing',
};

export default function DashboardPage() {
    return <DashboardClient />;
}