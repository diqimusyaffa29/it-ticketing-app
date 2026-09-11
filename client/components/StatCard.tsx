import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
    title: string;
    label: string;
    value: number;
    loading: boolean;
    periodLabel: string;
}

const StatCard = ({ title, label, value, loading, periodLabel }: StatCardProps) => (
    <Card>
        <CardHeader className="pb-2">
            <CardTitle>{title}</CardTitle>
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


export default StatCard