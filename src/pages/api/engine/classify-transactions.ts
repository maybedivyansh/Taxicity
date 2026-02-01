import type { NextApiRequest, NextApiResponse } from 'next';
import { classifyTransactionsBatch } from '@/services/engineService';
import { Transaction, TransactionClassification } from '@/types/engine';

type ResponseData = {
    success: boolean;
    data?: TransactionClassification[];
    error?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const transactions: Transaction[] = req.body;

        if (!Array.isArray(transactions)) {
            return res.status(400).json({ success: false, error: 'Invalid input: Expected an array of transactions' });
        }

        const classifications = await classifyTransactionsBatch(transactions);

        return res.status(200).json({ success: true, data: classifications });
    } catch (error) {
        console.error('Classification Error:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
