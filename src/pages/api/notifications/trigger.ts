import type { NextApiRequest, NextApiResponse } from 'next';
import { NotificationEvent } from '../../../types/notifications';

// In a real app, this would use a proper database or message queue (Redis/Kafka)
// For this hackathon/demo, we'll confirm receipt.
// Ideally, this endpoint would push to a WebSocket or SSE stream.

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { type, title, message, urgency } = req.body;

        if (!type || !title || !message) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const notification: NotificationEvent = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            title,
            message,
            urgency: urgency || 'medium',
            timestamp: Date.now()
        };

        // Log for analytics
        console.log('[Notification Triggered]', notification);

        // Here we would broadcast to connected clients via Socket.io/Pusher/SSE
        // For now, we return success and the ID

        res.status(200).json({ success: true, notificationId: notification.id });
    } catch (error) {
        console.error('Notification trigger error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
