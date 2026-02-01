import type { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '../../../services/emailService';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { to, type, data } = req.body;

        if (!to || !type) {
            return res.status(400).json({ message: 'Missing required fields: to, type' });
        }

        // Determine subject based on type or use provided
        let subject = data.title || 'Notification from Taxicity';
        if (type === 'opportunity') subject = `💰 Tax Saving Opportunity: Save ₹${data.savings}`;
        else if (type === 'deadline') subject = `⚠️ Tax Filing Deadline: ${data.daysRemaining} Days Left`;
        else if (type === 'error') subject = "⚠️ Error in Taxicity";

        const result = await emailService.sendEmail({
            to,
            type,
            subject,
            templateName: type,
            data: { ...data, userName: data.userName || 'User' } // Ensure userName fallback
        });

        if (result.success) {
            res.status(200).json({
                success: true,
                emailId: result.messageId,
                status: 'sent'
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error,
                status: 'failed'
            });
        }

    } catch (error: any) {
        console.error('API Email Error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
