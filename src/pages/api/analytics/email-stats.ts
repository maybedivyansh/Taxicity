import type { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '../../../services/emailService';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // Using emailService history as source of truth
    const logs = emailService.getHistory(); // Assuming we expose this or use db in real app

    const total = logs.length;
    const statusCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    logs.forEach(log => {
        statusCounts[log.status] = (statusCounts[log.status] || 0) + 1;
        typeCounts[log.type] = (typeCounts[log.type] || 0) + 1;
    });

    const sent = statusCounts['sent'] || 0;
    const failed = statusCounts['failed'] || 0;

    res.status(200).json({
        totalEmailsSent: sent,
        deliveryRate: total ? ((sent / total) * 100).toFixed(1) + '%' : '0%',
        openRate: '45%', // Mock for analytics demo
        clickThroughRate: '12%', // Mock
        byEmailType: typeCounts,
        failedEmailsCount: failed,
        retrySuccessRate: '90%' // Mock
    });
}
