import { Badge } from "@/components/ui/badge";

const renderStatusBadge = (status: string) => {
    switch (status) {
        case 'OPEN':
            return <Badge className="bg-amber-500 hover:bg-amber-600" > OPEN </Badge>;
        case 'IN_PROGRESS':
            return <Badge className="bg-blue-500 hover:bg-blue-600" > IN PROGRESS </Badge>;
        case 'RESOLVED':
            return <Badge className="bg-emerald-500 hover:bg-emerald-600" > RESOLVED </Badge>;
        case 'CLOSED':
            return <Badge variant="secondary" > CLOSED </Badge>;
        default:
            return <Badge>{status} </Badge>;
    }
};

export { renderStatusBadge }