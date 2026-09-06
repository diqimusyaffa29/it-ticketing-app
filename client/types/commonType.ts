interface Ticket {
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