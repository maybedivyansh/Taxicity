import { useState, useEffect, useCallback } from 'react';
import { RegimeToggleState } from '../types/ui';
import {
    TaxScenario,
    Transaction,
    RegimeComparison,
    TransactionClassification,
    ShadowGap,
    TaxDeductions
} from '../types/engine';
import { GaugeState, ShadowAction, EnrichedTransaction } from '../types/ui';

// Mock Data matching "Arjun" Scenario
const INITIAL_TRANSACTIONS: Transaction[] = [
    {
        id: '1', date: '2027-03-14', description: 'Amazon - Office Chair', amount: 5000,
        category: 'Personal', merchant: 'Amazon'
    },
    {
        id: '2', date: '2027-03-13', description: 'Cafe Coffee Day - Meeting', amount: 450,
        category: 'Personal', merchant: 'Cafe Coffee Day'
    },
    {
        id: '3', date: '2027-03-12', description: 'Flipkart - Phone Stand', amount: 800,
        category: 'Personal', merchant: 'Flipkart'
    },
    {
        id: '4', date: '2027-03-11', description: 'ICICI Health Insurance', amount: 25000,
        category: 'Medical', merchant: 'ICICI Lombard'
    },
    {
        id: '5', date: '2027-03-10', description: 'Swiggy - Lunch', amount: 500,
        category: 'Personal', merchant: 'Swiggy'
    }
];

// Initial mock classifications to simulate AI output
const INITIAL_CLASSIFICATIONS: TransactionClassification[] = [
    { transactionId: '1', aiCategory: 'Personal (Non-deductible)', confidence: 0.95, reasoning: 'Looks like furniture', taxImpact: 'NONE' }, // High confidence personal, but actually business
    { transactionId: '2', aiCategory: 'Personal (Non-deductible)', confidence: 0.40, reasoning: 'Coffee shop', taxImpact: 'NONE' }, // Low confidence
    { transactionId: '3', aiCategory: 'Personal (Non-deductible)', confidence: 0.88, reasoning: 'Online shopping', taxImpact: 'NONE' },
    { transactionId: '4', aiCategory: 'Medical Deduction (80D)', confidence: 0.99, reasoning: 'Insurance provider detected', taxImpact: 'DEDUCTIBLE' },
    { transactionId: '5', aiCategory: 'Personal (Non-deductible)', confidence: 0.99, reasoning: 'Food delivery', taxImpact: 'NONE' }
];

const INITIAL_DEDUCTIONS: TaxDeductions = {
    section80C: 0, // Opportunity to invest
    section80D: 25000, // Matched with transaction
    section37: 0,
    hra: 0,
    lta: 0,
    other: 0
};

export const useTaxEngine = () => {
    const [scenario, setScenario] = useState<TaxScenario>({
        grossIncome: 2800000, // Arjun's income
        employmentType: 'FREELANCER',
        transactions: INITIAL_TRANSACTIONS,
        deductions: INITIAL_DEDUCTIONS
    });

    const [comparison, setComparison] = useState<RegimeComparison | null>(null);
    const [classifications, setClassifications] = useState<TransactionClassification[]>(INITIAL_CLASSIFICATIONS);
    const [shadowGaps, setShadowGaps] = useState<ShadowGap[]>([]);

    // UI State
    const [currentRegime, setCurrentRegime] = useState<'New' | 'Old'>('New');
    const [uiShadowActions, setUiShadowActions] = useState<ShadowAction[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const recalculateTax = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. Calculate Regime
            const regimeRes = await fetch('/api/engine/calculate-regime', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scenario)
            });
            const regimeData = await regimeRes.json();
            if (regimeData.success) {
                setComparison(regimeData.data);
            }

            // 2. Find Shadow Gaps
            const gapsRes = await fetch('/api/engine/shadow-gap-finder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scenario)
            });
            const gapsData = await gapsRes.json();
            if (gapsData.success) {
                const gaps: ShadowGap[] = gapsData.data;
                setShadowGaps(gaps);

                const actions: ShadowAction[] = gaps.map((gap, index) => ({
                    id: `gap-${index}`,
                    action: gap.opportunityName,
                    description: gap.action,
                    potentialSavings: gap.potentialSavings,
                    effort: gap.priority === 1 ? 'Easy' : 'Medium',
                    priority: gap.priority as 1 | 2 | 3,
                    section: gap.opportunityName.includes('80C') ? '80C' : gap.opportunityName.includes('80D') ? '80D' : '37',
                    icon: gap.opportunityName.includes('80C') ? '📈' : gap.opportunityName.includes('80D') ? '💉' : '💼'
                }));
                setUiShadowActions(actions);
            }
            // Classifications are static mock for demo to ensure consistency

        } catch (err) {
            console.error(err);
            setError('Failed to update tax engine');
        } finally {
            setIsLoading(false);
        }
    }, [scenario]);

    useEffect(() => {
        const timer = setTimeout(() => recalculateTax(), 500);
        return () => clearTimeout(timer);
    }, [recalculateTax]);

    const updateTransactionCategory = (id: string, newCategory: string) => {
        // Update both the transaction category and standard deductions for Section 37
        setScenario(prev => {
            const tx = prev.transactions.find(t => t.id === id);
            if (!tx) return prev;

            // Simplified logic: If moving to Section 37, add to deductions
            let newSection37 = prev.deductions.section37;
            if (newCategory.includes('37')) {
                newSection37 += tx.amount;
            } else if (tx.category.includes('37') && !newCategory.includes('37')) {
                // If it was 37 and is now something else, remove it
                newSection37 -= tx.amount;
            }

            return {
                ...prev,
                transactions: prev.transactions.map(t =>
                    t.id === id ? { ...t, category: newCategory } : t
                ),
                deductions: {
                    ...prev.deductions,
                    section37: newSection37
                }
            };
        });

        // Also update classification state for UI feedback
        setClassifications(prev => prev.map(c =>
            c.transactionId === id ? { ...c, aiCategory: newCategory, confidence: 1.0, taxImpact: newCategory.includes('Personal') ? 'NONE' : 'DEDUCTIBLE' } : c
        ));
    };

    const toggleRegime = () => {
        setCurrentRegime(prev => prev === 'New' ? 'Old' : 'New');
    };

    const getGaugeState = (): GaugeState => {
        if (!comparison) return { currentRate: 0, colorStatus: 'Blue', trend: 'stable', tooltipText: 'Calculating...', isOptimized: false };

        const currentTax = currentRegime === 'New' ? comparison.newRegimeTax.totalTax : comparison.oldRegimeTax.totalTax;
        const rate = scenario.grossIncome > 0 ? (currentTax / scenario.grossIncome) * 100 : 0;

        let colorStatus: GaugeState['colorStatus'] = 'Blue';
        if (rate < 10) colorStatus = 'Cyan';
        else if (rate < 20) colorStatus = 'Blue';
        else if (rate < 25) colorStatus = 'Yellow'; // 24% falls here
        else colorStatus = 'Red';

        const isOptimized = currentRegime.toUpperCase() === comparison.recommended;

        return {
            currentRate: rate,
            colorStatus,
            trend: 'stable',
            tooltipText: `Effective Tax Rate: ${rate.toFixed(1)}%`,
            isOptimized
        };
    };

    const analysis = useAnalysisAdapter(comparison, uiShadowActions, currentRegime);

    const enrichedTransactions: EnrichedTransaction[] = scenario.transactions.map(t => {
        const classification = classifications.find(c => c.transactionId === t.id);
        const defaultClassification: TransactionClassification = {
            transactionId: t.id, aiCategory: t.category || 'Ambiguous',
            confidence: 0, reasoning: 'Manual or Default', taxImpact: 'NONE'
        };
        return { ...t, ...(classification || defaultClassification) };
    });

    return {
        grossIncome: scenario.grossIncome,
        transactions: enrichedTransactions,
        updateTransactionCategory,
        toggleRegime,
        analysis,
        gaugeState: getGaugeState(),
        isLoading,
        error
    };
};

function useAnalysisAdapter(comparison: RegimeComparison | null, shadowActions: ShadowAction[], currentRegime: 'New' | 'Old'): RegimeToggleState {
    if (!comparison) {
        return {
            currentRegime,
            recommendedRegime: 'New',
            newRegimeTax: 0,
            oldRegimeTax: 0,
            shadowAmount: 0,
            shadowActions: []
        };
    }

    return {
        currentRegime,
        recommendedRegime: comparison.recommended === 'NEW' ? 'New' : 'Old',
        newRegimeTax: comparison.newRegimeTax.totalTax,
        oldRegimeTax: comparison.oldRegimeTax.totalTax,
        shadowAmount: comparison.savings + shadowActions.reduce((sum, a) => sum + a.potentialSavings, 0),
        shadowActions
    };
}
