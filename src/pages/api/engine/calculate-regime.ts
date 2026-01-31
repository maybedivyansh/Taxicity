import type { NextApiRequest, NextApiResponse } from 'next';
import { TaxInput, TaxCalculationResult, TaxRegimeData } from '../../../types/engine';

// Mock Slabs for FY 2026-27 (Estimated/Sample)
const NEW_REGIME_SLABS = [
    { limit: 400000, rate: 0 },
    { limit: 800000, rate: 0.05 },
    { limit: 1200000, rate: 0.10 },
    { limit: 1600000, rate: 0.15 },
    { limit: 2000000, rate: 0.20 },
    { limit: 2400000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 }
];

const OLD_REGIME_SLABS = [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 0.05 },
    { limit: 1000000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 }
];

function calculateTax(income: number, slabs: typeof NEW_REGIME_SLABS): TaxRegimeData {
    let tax = 0;
    let prevLimit = 0;
    const breakdown = [];

    // Standard Deduction calculation (simplified for demo)
    // income passed here is *Taxable Income* (Gross - Deductions)

    let remainingIncome = income;

    for (const slab of slabs) {
        if (remainingIncome <= 0) break;

        const slabWidth = slab.limit === Infinity ? remainingIncome : slab.limit - prevLimit;
        const taxableAtThisSlab = Math.min(remainingIncome, slabWidth);

        if (taxableAtThisSlab > 0) {
            const taxForSlab = taxableAtThisSlab * slab.rate;
            tax += taxForSlab;
            breakdown.push({
                slab: `${prevLimit / 100000}L - ${slab.limit === Infinity ? 'Above' : slab.limit / 100000 + 'L'}`,
                rate: slab.rate * 100,
                amount: taxForSlab
            });
            remainingIncome -= taxableAtThisSlab;
        }
        prevLimit = slab.limit;
    }

    const cess = tax * 0.04;
    const totalTax = tax + cess;

    return {
        taxableIncome: income,
        baseTax: tax,
        cess,
        surcharge: 0, // Ignoring for simple demo
        totalTax,
        effectiveRate: income > 0 ? (totalTax / income) * 100 : 0,
        breakdown
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    try {
        const input: TaxInput = req.body;

        // Basic Validation
        if (!input || typeof input.grossIncome !== 'number') {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        // Logic
        // Old Regime: Subtract ALL deductions
        const oldDeductions = Object.values(input.deductions).reduce((a, b) => a + b, 0);
        const oldTaxable = Math.max(0, input.grossIncome - oldDeductions);

        // New Regime: Subtract ONLY standard deduction (50k assumed)
        const newDeductions = 50000;
        const newTaxable = Math.max(0, input.grossIncome - newDeductions);

        const oldRegimeData = calculateTax(oldTaxable, OLD_REGIME_SLABS);
        const newRegimeData = calculateTax(newTaxable, NEW_REGIME_SLABS);

        const result: TaxCalculationResult = {
            oldRegime: oldRegimeData,
            newRegime: newRegimeData,
            recommendation: newRegimeData.totalTax < oldRegimeData.totalTax ? 'NEW' : 'OLD',
            savings: Math.abs(oldRegimeData.totalTax - newRegimeData.totalTax)
        };

        res.status(200).json({ success: true, data: result });

    } catch (e: any) {
        console.error('Tax Engine Error', e);
        res.status(500).json({ error: e.message });
    }
}
