import type { NextApiRequest, NextApiResponse } from 'next';

// Mock database for preferences
let userPreferences: Record<string, any> = {};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        const { userId, emailAddress, preferences } = req.body;

        if (!userId || !emailAddress) {
            return res.status(400).json({ message: 'Missing userId or emailAddress' });
        }

        // Determine if we should update
        // In real app, validate email format

        userPreferences[userId] = {
            emailAddress,
            preferences,
            updatedAt: Date.now()
        };

        console.log(`[Preferences Update] User ${userId} updated settings`, preferences);

        // Send confirmation logic could go here

        return res.status(200).json({
            success: true,
            preferences: userPreferences[userId],
            message: 'Preferences updated successfully'
        });
    }

    // GET endpoint to retrieve
    if (req.method === 'GET') {
        const { userId } = req.query;
        if (typeof userId === 'string' && userPreferences[userId]) {
            return res.status(200).json({ preferences: userPreferences[userId] });
        }
        // Default
        return res.status(200).json({ preferences: null });
    }

    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
