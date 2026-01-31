import type { NextApiRequest, NextApiResponse } from 'next';
import { getLogs } from '../errors/log-error';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // In a real app with Prisma:
    // const errors = await prisma.errorLog.findMany({...})

    // For Hackathon/Demo using mock memory DB:
    const errors = getLogs();

    // Basic aggregates
    const total = errors.length;
    const byModule: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const errorCounts: Record<string, number> = {};

    errors.forEach(err => {
        // Module
        const mod = (err.context as any)?.affectedModule || 'Unknown';
        byModule[mod] = (byModule[mod] || 0) + 1;

        // Severity
        bySeverity[err.severity] = (bySeverity[err.severity] || 0) + 1;

        // Common errors
        const key = `${err.errorCode}: ${err.errorMessage}`;
        errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    const topErrors = Object.entries(errorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    const resolved = errors.filter(e => e.status === 'resolved').length;

    res.status(200).json({
        total,
        byModule,
        bySeverity,
        topErrors,
        resolutionRate: total ? ((resolved / total) * 100).toFixed(1) + '%' : '100%',
        avgResolutionTime: '2.4 hours', // Mock
        mostAffectedUsers: ['user-1'] // Mock
    });
}
