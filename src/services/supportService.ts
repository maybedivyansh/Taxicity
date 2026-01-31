import { SupportTicket } from '../types/errors';
import { emailService } from './emailService';
import { getTickets } from '../pages/api/errors/log-error'; // Sharing mock DB for demo

class SupportService {

    // Create a new support ticket
    async createTicket(data: {
        userId: string;
        subject: string;
        description: string;
        errorId?: string;
        contactEmail: string;
        priority: 'low' | 'medium' | 'high' | 'critical';
    }): Promise<SupportTicket> {
        const ticketId = `ticket-${Math.random().toString(36).substr(2, 6)}`;
        const timestamp = Date.now();

        // In a real app, save to DB
        const newTicket: SupportTicket = {
            id: ticketId,
            userId: data.userId,
            errorId: data.errorId,
            subject: data.subject,
            description: data.description,
            status: 'open',
            priority: data.priority,
            createdAt: timestamp,
            updatedAt: timestamp,
            comments: []
        };

        // Assuming we push to the mock DB shared from log-error for hackathon persistence in memory
        const existingTickets = getTickets();
        existingTickets.unshift(newTicket);

        // Send confirmation email
        await emailService.sendEmail({
            to: data.contactEmail,
            type: 'info' as any, // Using 'info' or 'success'
            subject: `Support Ticket Created: #${ticketId}`,
            html: `
            <h1>Ticket Received</h1>
            <p>Thank you for contacting support. Your ticket <strong>#${ticketId}</strong> has been created.</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p>We will review it and get back to you shortly.</p>
        `
        });

        return newTicket;
    }

    // Update status or add details
    async updateTicketStatus(ticketId: string, status: 'open' | 'pending' | 'resolved' | 'closed', notes?: string) {
        const tickets = getTickets();
        const ticket = tickets.find(t => t.id === ticketId);

        if (!ticket) throw new Error('Ticket not found');

        ticket.status = status;
        ticket.updatedAt = Date.now();

        if (notes) {
            if (!ticket.comments) ticket.comments = [];
            ticket.comments.push({
                id: Math.random().toString(36).substr(2, 9),
                author: 'Support Team',
                message: notes,
                timestamp: Date.now()
            });
        }

        // Notify user of update
        // In real app we need to know user email. For this demo we'll assume we have it or pass it.
        // skipped for mock

        return ticket;
    }
}

export const supportService = new SupportService();
