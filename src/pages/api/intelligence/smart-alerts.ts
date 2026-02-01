import type { NextApiRequest, NextApiResponse } from 'next';
import {
    SmartAlert,
    SmartAlertsRequest,
    AlertUrgency,
} from '@/types/intelligence';
import { generateSmartAlert } from '@/services/geminiService';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SmartAlert[] | { error: string }>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            transactions,
            grossIncome,
            employmentType,
            currentDate,
        } = req.body as SmartAlertsRequest;

        const alerts: SmartAlert[] = [];
        const now = new Date(currentDate);
        const month = now.getMonth() + 1; // 1-12

        // 1. LOCATION-BASED ALERTS
        for (const txn of transactions) {
            const desc = txn.description?.toLowerCase() || '';

            // Coffee shops / client meetings
            if (desc.includes('starbucks') || desc.includes('cafe') || desc.includes('coffee')) {
                alerts.push({
                    id: `location_coffee_${txn.id}`,
                    title: 'Client Meeting Expense?',
                    description: `Transaction at ${txn.description}. Mark as client meeting? Save ₹${Math.round(txn.amount * 0.3)} on taxes.`,
                    urgency: 'MEDIUM',
                    actionable: true,
                    metadata: {
                        category: 'Section 37',
                        potentialSavings: Math.round(txn.amount * 0.3),
                        transactionId: txn.id,
                    },
                });
            } else {
                // Try Gemini for other relevant transactions (limit to recent high-value ones for performance)
                if (txn.amount > 2000 && process.env.GEMINI_API_KEY) {
                    // We don't await strictly to avoid blocking, but for API response we must.
                    // To keep latency low, we might skip this or run it for ONLY the single most recent one.
                    // For this demo/implementation, let's skip deep Gemini integration per-transaction loop 
                    // in this specific "bulk" route to avoid timeouts. 
                    // Instead, we rely on the client calling specific "analyze" endpoints or `geminiService` usage elsewhere.
                    // OR: We can just use it for the *last* transaction if it's new.
                }
            }

            // ... (rest of static rules)

            // Airport / business travel
            if (desc.includes('airport') || desc.includes('flight') || desc.includes('airline')) {
                alerts.push({
                    id: `location_travel_${txn.id}`,
                    title: 'Business Travel Deduction',
                    description: `Airport transaction detected. Business travel? Deduct as Section 37 expense. Potential savings: ₹${Math.round(txn.amount * 0.3)}`,
                    urgency: 'HIGH',
                    actionable: true,
                    metadata: {
                        category: 'Section 37',
                        potentialSavings: Math.round(txn.amount * 0.3),
                        transactionId: txn.id,
                    },
                });
            }

            // Coworking spaces
            if (desc.includes('coworking') || desc.includes('wework') || desc.includes('workspace')) {
                alerts.push({
                    id: `location_coworking_${txn.id}`,
                    title: 'Professional Deduction Opportunity',
                    description: `Coworking space expense detected. This is a valid Section 37 professional deduction. Save ₹${Math.round(txn.amount * 0.3)}`,
                    urgency: 'MEDIUM',
                    actionable: true,
                    metadata: {
                        category: 'Section 37',
                        potentialSavings: Math.round(txn.amount * 0.3),
                        transactionId: txn.id,
                    },
                });
            }
        }

        // 2. CALENDAR-BASED ALERTS (Timing-Critical)

        // March (Tax season)
        if (month === 3) {
            const effectiveTaxRate = calculateEffectiveTaxRate(grossIncome);
            const amountToLowerBracket = calculateAmountToLowerBracket(grossIncome);

            if (amountToLowerBracket > 0) {
                alerts.push({
                    id: 'calendar_march_bracket',
                    title: "It's Tax Season - Lower Your Bracket",
                    description: `You're ₹${amountToLowerBracket.toLocaleString()} away from a lower tax bracket. Buy office supplies or make 80C investments now to save ₹${Math.round(amountToLowerBracket * 0.3).toLocaleString()}.`,
                    urgency: 'CRITICAL',
                    actionable: true,
                    metadata: {
                        category: 'Tax Planning',
                        potentialSavings: Math.round(amountToLowerBracket * 0.3),
                        deadline: `${now.getFullYear()}-03-31`,
                    },
                });
            }
        }

        // April 1 (New financial year)
        if (month === 4 && now.getDate() === 1) {
            alerts.push({
                id: 'calendar_april_new_year',
                title: 'New Financial Year - Review Investments',
                description: 'New financial year started. Review your 80C investments and plan your tax-saving strategy for the year.',
                urgency: 'MEDIUM',
                actionable: true,
                metadata: {
                    category: 'Tax Planning',
                },
            });
        }

        // Mid-February (Filing deadline warning)
        if (month === 2 && now.getDate() >= 14) {
            alerts.push({
                id: 'calendar_feb_deadline',
                title: 'Filing Deadline in 30 Days',
                description: 'ITR filing deadline is March 31. Claim all pending expenses and deductions now.',
                urgency: 'HIGH',
                actionable: true,
                metadata: {
                    category: 'Deadline',
                    deadline: `${now.getFullYear()}-03-31`,
                },
            });
        }

        // 3. THRESHOLD-BASED ALERTS

        // Calculate 80C contributions
        const section80CTransactions = transactions.filter(t =>
            t.category === '80C' || t.description?.toLowerCase().includes('mutual fund') ||
            t.description?.toLowerCase().includes('ppf') || t.description?.toLowerCase().includes('elss')
        );
        const total80C = section80CTransactions.reduce((sum, t) => sum + (t.type === 'DEBIT' ? t.amount : 0), 0);
        const limit80C = 150000;
        const remaining80C = limit80C - total80C;

        if (total80C >= limit80C * 0.8 && remaining80C > 0) {
            alerts.push({
                id: 'threshold_80c',
                title: '80C Limit Almost Reached',
                description: `₹${remaining80C.toLocaleString()} left in 80C limit. Invest now to save ₹${Math.round(remaining80C * 0.3).toLocaleString()}.`,
                urgency: 'HIGH',
                actionable: true,
                metadata: {
                    category: '80C',
                    potentialSavings: Math.round(remaining80C * 0.3),
                },
            });
        }

        // Calculate 80D (medical insurance)
        const section80DTransactions = transactions.filter(t =>
            t.category === '80D' || t.description?.toLowerCase().includes('health insurance') ||
            t.description?.toLowerCase().includes('medical insurance')
        );
        const total80D = section80DTransactions.reduce((sum, t) => sum + (t.type === 'DEBIT' ? t.amount : 0), 0);
        const limit80D = 25000;
        const remaining80D = limit80D - total80D;

        if (total80D >= limit80D * 0.9 && remaining80D > 0) {
            alerts.push({
                id: 'threshold_80d',
                title: '80D Limit Almost Maxed',
                description: `₹${remaining80D.toLocaleString()} left in medical insurance deduction. Complete claims now.`,
                urgency: 'MEDIUM',
                actionable: true,
                metadata: {
                    category: '80D',
                    potentialSavings: Math.round(remaining80D * 0.3),
                },
            });
        }

        // Effective tax rate check
        const effectiveTaxRate = calculateEffectiveTaxRate(grossIncome);
        if (effectiveTaxRate > 20) {
            alerts.push({
                id: 'threshold_tax_rate',
                title: 'High Tax Rate Detected',
                description: `Your effective tax rate is ${effectiveTaxRate.toFixed(1)}%. Consider reviewing Old vs New Regime options.`,
                urgency: 'CRITICAL',
                actionable: true,
                metadata: {
                    category: 'Regime Comparison',
                },
            });
        }

        // 4. ANOMALY DETECTION

        // Check for sudden drop in professional expenses
        const recentMonths = getRecentMonths(transactions, 3);
        const professionalExpenses = recentMonths.map(month =>
            month.filter(t => t.category === 'Section 37' || t.category === 'Professional').reduce((sum, t) => sum + t.amount, 0)
        );

        const avgProfessionalExpense = professionalExpenses.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
        const currentMonthExpense = professionalExpenses[2] || 0;

        if (avgProfessionalExpense > 10000 && currentMonthExpense < avgProfessionalExpense * 0.5) {
            alerts.push({
                id: 'anomaly_professional_drop',
                title: 'Professional Expenses Dropped',
                description: `No Section 37 expenses this month? Previous months averaged ₹${Math.round(avgProfessionalExpense).toLocaleString()}. Don't miss deductions.`,
                urgency: 'MEDIUM',
                actionable: true,
                metadata: {
                    category: 'Anomaly',
                },
            });
        }

        // Income spike detection
        const recentIncome = transactions
            .filter(t => t.type === 'CREDIT' && new Date(t.date) > new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000))
            .reduce((sum, t) => sum + t.amount, 0);

        if (recentIncome > grossIncome * 1.2) {
            alerts.push({
                id: 'anomaly_income_spike',
                title: 'Income Spike Detected',
                description: `Income up significantly. Regime comparison shows Old Regime may save you more now. Review your tax strategy.`,
                urgency: 'HIGH',
                actionable: true,
                metadata: {
                    category: 'Regime Comparison',
                    potentialSavings: 50000, // Placeholder
                },
            });
        }

        // Sort by urgency (highest first)
        const urgencyOrder: Record<AlertUrgency, number> = {
            CRITICAL: 4,
            HIGH: 3,
            MEDIUM: 2,
            LOW: 1,
        };

        alerts.sort((a, b) => urgencyOrder[b.urgency] - urgencyOrder[a.urgency]);

        return res.status(200).json(alerts);
    } catch (error) {
        console.error('Error generating smart alerts:', error);
        return res.status(500).json({ error: 'Failed to generate smart alerts' });
    }
}

// Helper functions
function calculateEffectiveTaxRate(grossIncome: number): number {
    // Simplified New Regime calculation
    if (grossIncome <= 300000) return 0;
    if (grossIncome <= 600000) return 5;
    if (grossIncome <= 900000) return 10;
    if (grossIncome <= 1200000) return 15;
    if (grossIncome <= 1500000) return 20;
    return 30;
}

function calculateAmountToLowerBracket(grossIncome: number): number {
    const brackets = [300000, 600000, 900000, 1200000, 1500000];
    for (const bracket of brackets) {
        if (grossIncome > bracket && grossIncome - bracket < 100000) {
            return grossIncome - bracket;
        }
    }
    return 0;
}

function getRecentMonths(transactions: any[], monthCount: number): any[][] {
    const now = new Date();
    const months: any[][] = [];

    for (let i = 0; i < monthCount; i++) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthTransactions = transactions.filter(t => {
            const txnDate = new Date(t.date);
            return txnDate >= monthStart && txnDate <= monthEnd;
        });

        months.push(monthTransactions);
    }

    return months.reverse();
}
