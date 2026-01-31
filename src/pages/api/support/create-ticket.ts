import type { NextApiRequest, NextApiResponse } from 'next';
import { supportService } from '../../../services/supportService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { userId, subject, description, errorId, contactEmail, priority } = req.body;

        if (!userId || !subject || !contactEmail) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const ticket = await supportService.createTicket({
            userId,
            subject,
            description,
            errorId,
            contactEmail,
            priority: priority || 'medium'
        });

        res.status(200).json({
            success: true,
            ticketId: ticket.id,
            estimatedResolutionTime: priority === 'critical' ? '1 hour' : '24 hours',
            confirmationEmail: true
        });
    } catch (error: any) {
        console.error('Create Ticket Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}
