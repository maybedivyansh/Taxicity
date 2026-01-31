import type { NextApiRequest, NextApiResponse } from 'next';
import { supportService } from '../../../services/supportService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Parsing ticketId from query or body? 
    // NextJS API routes usually use [ticketId].ts for params, but prompt says query/body via path structure PATCH /api/support/update-ticket/:ticketId
    // Since we are using standard file structure without dynamic folder here for simplicity, we'll take ID from query or body

    if (req.method !== 'PATCH' && req.method !== 'POST') { // Providing POST fallback
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { ticketId, status, notes } = req.body;

        if (!ticketId || !status) {
            return res.status(400).json({ success: false, message: 'Missing ticketId or status' });
        }

        const updatedTicket = await supportService.updateTicketStatus(ticketId, status, notes);

        res.status(200).json({
            success: true,
            ticket: updatedTicket
        });

    } catch (error: any) {
        console.error('Update Ticket Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}
