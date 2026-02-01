import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import {
    TransactionClassification,
    DeprecationAdvice,
    SmartAlert,
    Nudge,
    AssetType,
} from '@/types/intelligence';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

// Cache configuration
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper: Get from cache
function getFromCache<T>(key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > CACHE_TTL) {
        cache.delete(key);
        return null;
    }

    return entry.data as T;
}

// Helper: Set to cache
function setToCache<T>(key: string, data: T): void {
    cache.set(key, { data, timestamp: Date.now() });
}

// Helper: Retry logic with exponential backoff
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (i < maxRetries - 1) {
                const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

// Tax-specific system prompts
const TAX_SYSTEM_PROMPT = `You are an expert in Indian Income Tax Law. You help freelancers and salaried individuals optimize their taxes.
Key sections to consider:
- Section 80C: Investments (₹1.5L limit)
- Section 80D: Medical insurance (₹25K-₹50K limit)
- Section 37: Professional expenses for freelancers
- HRA: House Rent Allowance
- Standard Deduction: ₹50,000 for salaried

Always provide accurate, actionable advice based on current Indian tax laws.`;

/**
 * Classify a transaction with tax category
 */
export async function classifyTransaction(
    transaction: any
): Promise<TransactionClassification> {
    const cacheKey = `classify_${transaction.id}_${transaction.description}`;
    const cached = getFromCache<TransactionClassification>(cacheKey);
    if (cached) return cached;

    try {
        const result = await retryWithBackoff(async () => {
            const prompt = `${TAX_SYSTEM_PROMPT}

Classify this transaction for Indian tax purposes:
- Description: ${transaction.description}
- Amount: ₹${transaction.amount}
- Category: ${transaction.category}
- Date: ${transaction.date}

Respond in JSON format:
{
  "category": "string",
  "taxSection": "string or null",
  "deductible": boolean,
  "confidence": number (0-100),
  "reasoning": "string"
}`;

            const response = await model.generateContent(prompt);
            const text = response.response.text();

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Invalid response format');

            return JSON.parse(jsonMatch[0]);
        });

        setToCache(cacheKey, result);
        return result;
    } catch (error) {
        console.error('Gemini API error in classifyTransaction:', error);

        // Fallback classification
        return {
            category: transaction.category || 'UNCATEGORIZED',
            taxSection: undefined,
            deductible: false,
            confidence: 30,
            reasoning: 'Fallback: Unable to classify via AI. Manual review recommended.',
        };
    }
}

/**
 * Generate smart alert based on transaction and context
 */
export async function generateSmartAlert(
    transaction: any,
    context: { grossIncome: number; currentDate: string }
): Promise<SmartAlert | null> {
    try {
        const result = await retryWithBackoff(async () => {
            const prompt = `${TAX_SYSTEM_PROMPT}

Generate a smart tax alert for this transaction:
- Description: ${transaction.description}
- Amount: ₹${transaction.amount}
- Category: ${transaction.category}
- Date: ${transaction.date}
- User's gross income: ₹${context.grossIncome}
- Current date: ${context.currentDate}

If this transaction presents a tax-saving opportunity, respond in JSON:
{
  "id": "unique_id",
  "title": "string",
  "description": "string",
  "urgency": "LOW|MEDIUM|HIGH|CRITICAL",
  "actionable": boolean,
  "metadata": {
    "potentialSavings": number,
    "category": "string"
  }
}

If no alert needed, respond with: null`;

            const response = await model.generateContent(prompt);
            const text = response.response.text();

            if (text.trim() === 'null') return null;

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) return null;

            return JSON.parse(jsonMatch[0]);
        });

        return result;
    } catch (error) {
        console.error('Gemini API error in generateSmartAlert:', error);
        return null;
    }
}

/**
 * Analyze spending pattern for tax optimization
 */
export async function analyzeSpendingPattern(
    transactions: any[]
): Promise<string> {
    const cacheKey = `pattern_${transactions.length}_${transactions[0]?.id}`;
    const cached = getFromCache<string>(cacheKey);
    if (cached) return cached;

    try {
        const result = await retryWithBackoff(async () => {
            const summary = transactions.slice(0, 20).map(t =>
                `${t.date}: ${t.description} - ₹${t.amount} (${t.category})`
            ).join('\n');

            const prompt = `${TAX_SYSTEM_PROMPT}

Analyze this spending pattern for tax optimization opportunities:

${summary}

Provide a concise analysis (2-3 sentences) highlighting:
1. Potential unclaimed deductions
2. Tax-saving opportunities
3. Spending anomalies`;

            const response = await model.generateContent(prompt);
            return response.response.text();
        });

        setToCache(cacheKey, result);
        return result;
    } catch (error) {
        console.error('Gemini API error in analyzeSpendingPattern:', error);
        return 'Unable to analyze spending pattern at this time. Please review transactions manually.';
    }
}

/**
 * Suggest depreciation schedule for an asset
 */
export async function suggestDepreciation(
    asset: { name: string; cost: number; type: AssetType; purchaseDate: string }
): Promise<DeprecationAdvice> {
    const cacheKey = `depreciation_${asset.name}_${asset.cost}_${asset.type}`;
    const cached = getFromCache<DeprecationAdvice>(cacheKey);
    if (cached) return cached;

    try {
        const result = await retryWithBackoff(async () => {
            const prompt = `${TAX_SYSTEM_PROMPT}

Calculate depreciation schedule for this asset under Indian tax law:
- Name: ${asset.name}
- Cost: ₹${asset.cost}
- Type: ${asset.type}
- Purchase Date: ${asset.purchaseDate}

Standard rates:
- ELECTRONICS: 40% year 1, 20% subsequent
- EQUIPMENT: 50% year 1, 25% subsequent
- FURNITURE: 10% per year
- VEHICLE: 20% per year

Respond in JSON:
{
  "assetType": "${asset.type}",
  "depreciationRate": number,
  "yearlySchedule": [
    {"year": 1, "deduction": number, "bookValue": number},
    {"year": 2, "deduction": number, "bookValue": number},
    ...
  ],
  "taxSavings": number (at 30% tax slab),
  "recommendations": ["string"]
}`;

            const response = await model.generateContent(prompt);
            const text = response.response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Invalid response format');

            return JSON.parse(jsonMatch[0]);
        });

        setToCache(cacheKey, result);
        return result;
    } catch (error) {
        console.error('Gemini API error in suggestDepreciation:', error);

        // Fallback calculation
        const rates: Record<AssetType, number> = {
            ELECTRONICS: 0.4,
            EQUIPMENT: 0.5,
            FURNITURE: 0.1,
            VEHICLE: 0.2,
            OTHER: 0.15,
        };

        const rate = rates[asset.type];
        const year1Deduction = asset.cost * rate;
        const year2BookValue = asset.cost - year1Deduction;
        const year2Deduction = year2BookValue * (rate / 2);

        return {
            assetType: asset.type,
            depreciationRate: rate * 100,
            yearlySchedule: [
                { year: 1, deduction: year1Deduction, bookValue: year2BookValue },
                { year: 2, deduction: year2Deduction, bookValue: year2BookValue - year2Deduction },
            ],
            taxSavings: (year1Deduction + year2Deduction) * 0.3,
            recommendations: ['Fallback calculation used. Consult tax professional for accuracy.'],
        };
    }
}

/**
 * Stream real-time nudges (async generator)
 */
export async function* streamNudges(
    userData: { transactions: any[]; grossIncome: number }
): AsyncGenerator<Nudge> {
    for (const transaction of userData.transactions) {
        try {
            const prompt = `${TAX_SYSTEM_PROMPT}

Generate a real-time tax nudge for this transaction:
- Description: ${transaction.description}
- Amount: ₹${transaction.amount}
- Category: ${transaction.category}

Respond in JSON:
{
  "nudge": "string (concise message)",
  "action": "string (what user should do)",
  "savings": number (potential tax savings),
  "timestamp": "${new Date().toISOString()}"
}`;

            const response = await model.generateContent(prompt);
            const text = response.response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                yield JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            console.error('Error streaming nudge:', error);
            // Continue to next transaction
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}
