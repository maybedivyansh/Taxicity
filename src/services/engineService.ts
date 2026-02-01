import {
    TaxScenario,
    TaxBreakdown,
    RegimeComparison,
    Transaction,
    TransactionClassification,
    ShadowGap,
    DynamicState,
    EmploymentType,
    TaxDeductions
} from '../types/engine';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Calculates tax under the New Regime (FY 2026-27).
 * Slabs: 0-4L: 0%, 4-8L: 5%, 8-12L: 10%, 12-20L: 15%, 20-30L: 20%, 30L+: 30%
 */
export const calculateNewRegime = (grossIncome: number, employmentType: EmploymentType): TaxBreakdown => {
    let taxableIncome = grossIncome;
    let tax = 0;

    // Slabs
    if (taxableIncome > 3000000) {
        tax += (taxableIncome - 3000000) * 0.30;
        tax += 1000000 * 0.20; // 20L-30L
        tax += 800000 * 0.15;  // 12L-20L
        tax += 400000 * 0.10;  // 8L-12L
        tax += 400000 * 0.05;  // 4L-8L
    } else if (taxableIncome > 2000000) {
        tax += (taxableIncome - 2000000) * 0.20;
        tax += 800000 * 0.15;
        tax += 400000 * 0.10;
        tax += 400000 * 0.05;
    } else if (taxableIncome > 1200000) {
        tax += (taxableIncome - 1200000) * 0.15;
        tax += 400000 * 0.10;
        tax += 400000 * 0.05;
    } else if (taxableIncome > 800000) {
        tax += (taxableIncome - 800000) * 0.10;
        tax += 400000 * 0.05;
    } else if (taxableIncome > 400000) {
        tax += (taxableIncome - 400000) * 0.05;
    }

    // Rebate Logic: If salaried and income <= 12.75L, tax = 0
    if (employmentType === 'SALARIED' && taxableIncome <= 1275000) {
        tax = 0;
    }

    const surcharge = 0;
    const cess = (tax + surcharge) * 0.04;
    const totalTax = tax + surcharge + cess;

    return {
        taxableIncome,
        taxAmount: tax,
        cess,
        surcharge,
        totalTax,
        effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
        regime: 'NEW'
    };
};

/**
 * Calculates tax under the Old Regime.
 * Slabs (Standard): 0-2.5L: 0%, 2.5-5L: 5%, 5-10L: 20%, 10L+: 30%
 */
export const calculateOldRegime = (grossIncome: number, deductions: TaxDeductions): TaxBreakdown => {
    // Apply deductions
    let totalDeductions =
        Math.min(deductions.section80C, 150000) +
        Math.min(deductions.section80D, 25000) +
        deductions.section37 +
        deductions.hra +
        deductions.lta +
        deductions.other;

    let taxableIncome = Math.max(0, grossIncome - totalDeductions);
    let tax = 0;

    // Old Regime Slabs
    if (taxableIncome > 1000000) {
        tax += (taxableIncome - 1000000) * 0.30;
        tax += 500000 * 0.20; // 5L-10L
        tax += 250000 * 0.05; // 2.5L-5L
    } else if (taxableIncome > 500000) {
        tax += (taxableIncome - 500000) * 0.20;
        tax += 250000 * 0.05;
    } else if (taxableIncome > 250000) {
        tax += (taxableIncome - 250000) * 0.05;
    }

    // Rebate u/s 87A (Old Regime: Income <= 5L, rebate up to 12.5k)
    // Note: If tax is less than 12.5k, it becomes 0.
    if (taxableIncome <= 500000) {
        tax = 0;
    }

    const surcharge = 0;
    const cess = (tax + surcharge) * 0.04;
    const totalTax = tax + surcharge + cess;

    return {
        taxableIncome,
        taxAmount: tax,
        cess,
        surcharge,
        totalTax,
        effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
        regime: 'OLD'
    };
};

export const compareRegimes = (newTax: TaxBreakdown, oldTax: TaxBreakdown): RegimeComparison => {
    const savings = Math.abs(newTax.totalTax - oldTax.totalTax);
    const recommended = newTax.totalTax <= oldTax.totalTax ? 'NEW' : 'OLD';

    return {
        newRegimeTax: newTax,
        oldRegimeTax: oldTax,
        recommended,
        savings
    };
};

// Initialize Gemini safely
const getGeminiModel = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    const genAI = new GoogleGenerativeAI(apiKey);
    // Explicitly set the version to gemini-1.5-flash which is generally available and fast
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

/**
 * Classifies a single transaction. 
 * Wrapper around batch classification for compatibility.
 */
export const classifyWithGemini = async (transaction: Transaction): Promise<TransactionClassification> => {
    const results = await classifyTransactionsBatch([transaction]);
    return results[0];
};

/**
 * Classifies a batch of transactions using Gemini or Keyword Fallback.
 */
export const classifyTransactionsBatch = async (transactions: Transaction[]): Promise<TransactionClassification[]> => {
    const model = getGeminiModel();

    if (!model) {
        console.warn("GEMINI_API_KEY not found, falling back to keywords.");
        return transactions.map(classifyWithKeywords);
    }

    try {
        // Prepare prompt for batch processing
        const prompt = `
      You are an expert Indian Tax Consultant for FY 2026-27.
      Classify the following financial transactions for tax purposes.
      
      Categories: 'Section 37' (Business Expense), '80C' (Investments), '80D' (Medical), 'Personal' (Non-deductible).
      
      Input Format: JSON Array of { id, description, amount, category }
      Output Format: JSON Array of { transactionId, aiCategory, confidence (0-1), reasoning, taxImpact ('DEDUCTIBLE'|'PARTIALLY_DEDUCTIBLE'|'NONE'), alternativeCategory? }
      
      Transactions:
      ${JSON.stringify(transactions.map(t => ({ id: t.id, description: t.description, amount: t.amount, category: t.category })))}
      
      Return ONLY valid JSON.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // clean markdown code blocks if present
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const classifications: TransactionClassification[] = JSON.parse(cleanJson);

        // Map back to ensure order/completeness (Gemini might miss some or reorder)
        const resultMap = new Map(classifications.map(c => [c.transactionId, c]));

        return transactions.map(tx => {
            if (resultMap.has(tx.id)) {
                return resultMap.get(tx.id)!;
            }
            return classifyWithKeywords(tx); // Fallback for missed ones
        });

    } catch (error) {
        console.error("Gemini Batch Error:", error);
        return transactions.map(classifyWithKeywords);
    }
};

/**
 * Fallback keyword-based classifier
 */
const classifyWithKeywords = (transaction: Transaction): TransactionClassification => {
    const lowerDesc = transaction.description.toLowerCase();

    let aiCategory = 'Personal';
    let taxImpact: 'DEDUCTIBLE' | 'PARTIALLY_DEDUCTIBLE' | 'NONE' = 'NONE';
    let reasoning = 'Classified based on keywords (Fallback)';

    if (
        lowerDesc.includes('laptop') ||
        lowerDesc.includes('monitor') ||
        lowerDesc.includes('software') ||
        lowerDesc.includes('hosting') ||
        lowerDesc.includes('course') ||
        lowerDesc.includes('freelance') ||
        lowerDesc.includes('office')
    ) {
        aiCategory = 'Section 37';
        taxImpact = 'DEDUCTIBLE';
        reasoning = 'Business expense detected via keywords';
    } else if (lowerDesc.includes('lic') || lowerDesc.includes('ppf') || lowerDesc.includes('elss')) {
        aiCategory = '80C';
        taxImpact = 'DEDUCTIBLE';
        reasoning = 'Investment detected via keywords';
    } else if (lowerDesc.includes('mediclaim') || lowerDesc.includes('health insurance')) {
        aiCategory = '80D';
        taxImpact = 'DEDUCTIBLE';
        reasoning = 'Health insurance detected via keywords';
    }

    return {
        transactionId: transaction.id,
        aiCategory,
        confidence: 0.6,
        reasoning,
        taxImpact
    };
};

export const findShadowGaps = (scenario: TaxScenario): ShadowGap[] => {
    const gaps: ShadowGap[] = [];
    const { deductions } = scenario;

    // 1. Check 80C Limit
    const max80C = 150000;
    if (deductions.section80C < max80C) {
        const diff = max80C - deductions.section80C;
        gaps.push({
            opportunityName: 'Maximize 80C',
            currentSpend: deductions.section80C,
            maxLimit: max80C,
            potentialSavings: diff * 0.312, // Approx max tax rate saving (30% + cess)
            priority: 1,
            action: `Invest ₹${diff.toLocaleString('en-IN')} in ELSS/PPF`
        });
    }

    // 2. Check 80D Limit
    const max80D = 25000;
    if (deductions.section80D < max80D) {
        const diff = max80D - deductions.section80D;
        gaps.push({
            opportunityName: 'Maximize 80D',
            currentSpend: deductions.section80D,
            maxLimit: max80D,
            potentialSavings: diff * 0.312,
            priority: 2,
            action: `Purchase Health Insurance worth ₹${diff.toLocaleString('en-IN')}`
        });
    }

    // 3. Check for Misclassified Transactions
    scenario.transactions.forEach(tx => {
        if (tx.category === 'Personal' && tx.amount > 10000 && (tx.description.toLowerCase().includes('laptop') || tx.description.toLowerCase().includes('phone'))) {
            gaps.push({
                opportunityName: 'Reclassify Business Expense',
                currentSpend: tx.amount,
                maxLimit: null,
                potentialSavings: tx.amount * 0.312,
                priority: 1,
                action: `Reclassify '${tx.description}' under Section 37`
            });
        }
    });

    return gaps.sort((a, b) => b.potentialSavings - a.potentialSavings);
};

export const updateDynamicState = async (currentState: DynamicState): Promise<DynamicState> => {
    // Logic to re-calculate state
    return currentState;
};
