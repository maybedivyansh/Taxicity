import { RegimeComparison, ShadowGap, Transaction, TransactionClassification, TaxBreakdown } from './engine';

export type EnrichedTransaction = Transaction & TransactionClassification & {
    type?: 'Credit' | 'Debit'; // bridging old UI requirement
    originalCategory?: string; // bridging old UI requirement
    paymentMethod?: string;
};

export interface ShadowAction {
    id: string;
    action: string;
    potentialSavings: number;
    effort: "Easy" | "Medium" | "Hard";
    priority: 1 | 2 | 3;
    section: string;
    icon?: string;
    description?: string;
}

export interface DashboardState {
    grossIncome: number;
    transactions: EnrichedTransaction[];
}

export interface GaugeState {
    currentRate: number; // Effective tax rate %
    colorStatus: 'Red' | 'Orange' | 'Yellow' | 'Blue' | 'Cyan';
    trend: 'up' | 'down' | 'stable';
    tooltipText: string;
    isOptimized: boolean;
}

export interface AlertState extends ShadowGap {
    dismissed: boolean;
}

export interface RegimeToggleState {
    currentRegime: 'New' | 'Old';
    newRegimeTax: number;
    oldRegimeTax: number;
    shadowAmount: number;
    recommendedRegime: 'New' | 'Old';
    shadowActions: ShadowAction[];
}
