import type { NextApiRequest, NextApiResponse } from 'next';
import { calculateNewRegime, calculateOldRegime, compareRegimes } from '../../../services/engineService';
import { TaxScenario, RegimeComparison } from '../../../types/engine';

type ResponseData = {
    success: boolean;
    data?: RegimeComparison;
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

        // Validate minimal fields
        if (scenario.grossIncome === undefined || !scenario.employmentType) {
            return res.status(400).json({ success: false, error: 'Missing required fields: grossIncome, employmentType' });
        }

        const newRegimeResult = calculateNewRegime(scenario.grossIncome, scenario.employmentType);
        const oldRegimeResult = calculateOldRegime(scenario.grossIncome, scenario.deductions || {
            section80C: 0,
            section80D: 0,
            section37: 0,
            hra: 0,
            lta: 0,
            other: 0
        });

        const comparison = compareRegimes(newRegimeResult, oldRegimeResult);

        return res.status(200).json({ success: true, data: comparison });
    } catch (error) {
        console.error('Calculation Error:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
