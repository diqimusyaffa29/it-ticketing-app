
interface Base {
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
    created_by: string;
    updated_by?: string;
    deleted_by?: string;
}
interface Ticket extends Base{
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    unit: string;
    reporter_name: string;
    proof_image?: string;
    reporter?: { Name: string }
    assignee?: { Name: string }
}


export type { Ticket }