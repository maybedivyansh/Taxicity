import type { NextApiRequest, NextApiResponse } from 'next';
import { findShadowGaps } from '../../../services/engineService';
import { TaxScenario, ShadowGap } from '../../../types/engine';

type ResponseData = {
    success: boolean;
    data?: ShadowGap[];
    error?: string;
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const scenario: TaxScenario = req.body;

        if (!scenario || !scenario.deductions) {
            return res.status(400).json({ success: false, error: 'Invalid scenario data' });
        }

        const gaps = findShadowGaps(scenario);

        return res.status(200).json({ success: true, data: gaps });
    } catch (error) {
        console.error('Shadow Gap Error:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
