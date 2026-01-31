import type { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '../../../services/emailService';
import { ErrorLog, SupportTicket } from '../../../types/errors';

// Mock DB
let errorLogs: ErrorLog[] = [];
let supportTickets: SupportTicket[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { errorCode, errorMessage, stack, context, severity, userEmail } = req.body;

    try {
        // 1. Validate input
        if (!errorCode || !errorMessage || !userEmail) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const timestamp = Date.now();
        const errorId = `err-${Math.random().toString(36).substr(2, 9)}`;

        // 2. Create error log in database
        const errorLog: ErrorLog = {
            id: errorId,
            userId: context?.userId,
            errorCode,
            errorMessage,
            stack,
            severity,
            context,
            status: 'unresolved',
            timestamp,
        };
        errorLogs.unshift(errorLog);
        // Keep log manageable
        if (errorLogs.length > 100) errorLogs.pop();

        // 3. Create support ticket if severity is high/critical
        let ticketId: string | undefined = undefined;
        if (severity === 'high' || severity === 'critical') {
            ticketId = `ticket-${Math.random().toString(36).substr(2, 6)}`;
            const ticket: SupportTicket = {
                id: ticketId,
                userId: context?.userId || 'anonymous',
                errorId: errorId,
                subject: `${severity.toUpperCase()}: ${errorMessage}`,
                description: `Error occurred in ${context?.module || 'Unknown Module'}: ${errorMessage}`,
                status: 'open',
                priority: severity,
                createdAt: timestamp,
                updatedAt: timestamp,
            };
            supportTickets.unshift(ticket);

            // 4. Send error notification email immediately
            // Using emailService
            await emailService.sendEmail({
                to: userEmail,
                type: 'error',
                subject: `⚠️ Application Error: ${errorCode}`,
                templateName: 'error',
                data: {
                    userName: 'User', // In real app, fetch name
                    errorMessage,
                    ticketId,
                    supportURL: `http://localhost:3000/support/tickets` // Hardcoded base for demo
                }
            });
        }

        // 5. Alert admin if critical using emailService (mocked as sending to admin email)
        if (severity === 'critical') {
            // Mock Admin Alert
            console.log(`[ADMIN ALERT] Critical Error: ${errorMessage}`);
        }

        // 6. Log to external service (Mock)
        console.log(`[External Log] ${severity} - ${errorCode}: ${errorMessage}`);

        res.status(200).json({
            success: true,
            errorId,
            ticketId,
            nextSteps: severity === 'critical'
                ? 'Our team has been notified. Expect a response within 1 hour.'
                : 'Thank you for reporting this. We are investigating.',
        });
    } catch (error: any) {
        console.error('Error logging system failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to log error. Please contact support.'
        });
    }
}

// Helper to expose mock DB for other endpoints (Support Page uses this if not real DB)
export const getTickets = () => supportTickets;
export const getLogs = () => errorLogs;
