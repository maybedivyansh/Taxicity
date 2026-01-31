import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory store for subscriptions (reset on restart)
// In production, use MongoDB/Postgres
let subscriptions: any[] = [];

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        const subscription = req.body;
        subscriptions.push(subscription);
        console.log(`[Push Subscription] New subscriber. Total: ${subscriptions.length}`);
        return res.status(201).json({ success: true });
    } else if (req.method === 'DELETE') {
        // Logic to removing subscription
        return res.status(200).json({ success: true });
    } else {
        res.setHeader('Allow', ['POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
