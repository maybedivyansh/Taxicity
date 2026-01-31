export interface ErrorContext {
    userId?: string;
    action?: string;
    inputData?: any;
    attemptedTime?: number;
    browserInfo?: string;
    affectedModule?: string;
    estimatedImpact?: string;
}

export interface ErrorLog {
    id: string;
    userId?: string;
    errorCode: string;
    errorMessage: string;
    stack?: string;
    context?: ErrorContext;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: number; // number or Date, usually number for generic use
    status: 'unresolved' | 'acknowledged' | 'resolved';
    resolutionNotes?: string;
}

export interface SupportTicket {
    id: string;
    userId: string;
    errorId?: string;
    subject: string;
    description: string;
    status: 'open' | 'pending' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignedTo?: string; // Support agent name
    createdAt: number;
    updatedAt: number;
    resolution?: string;
    comments?: TicketComment[];
}

export interface TicketComment {
    id: string;
    author: string; // 'User' or 'Support'
    message: string;
    timestamp: number;
}
