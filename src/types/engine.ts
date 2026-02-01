export type EmploymentType = 'SALARIED' | 'FREELANCER' | 'BUSINESS';

export interface Transaction {
  id: string;
  date: string; // ISO string
  description: string;
  amount: number;
  category: string;
  merchant?: string;
  tags?: string[];
}

export interface TaxDeductions {
  section80C: number;
  section80D: number;
  section37: number; // Business expenses
  hra: number;
  lta: number;
  other: number;
}

// Alias for UI components
export type TaxInput = TaxScenario;

export interface TaxScenario {
  grossIncome: number;
  employmentType: EmploymentType;
  transactions: Transaction[];
  deductions: TaxDeductions;
}

export interface TaxBreakdown {
  taxableIncome: number;
  taxAmount: number;
  cess: number;
  surcharge: number;
  totalTax: number;
  effectiveRate: number;
  regime: 'NEW' | 'OLD';
}

export interface RegimeComparison {
  newRegimeTax: TaxBreakdown;
  oldRegimeTax: TaxBreakdown;
  recommended: 'NEW' | 'OLD';
  savings: number;
}

export interface TransactionClassification {
  transactionId: string;
  aiCategory: string; // e.g., 'Section 37', '80C', 'Personal'
  confidence: number;
  reasoning: string;
  taxImpact: 'DEDUCTIBLE' | 'PARTIALLY_DEDUCTIBLE' | 'NONE';
  alternativeCategory?: string;
}

export interface ShadowGap {
  opportunityName: string; // e.g., 'Maximize 80C'
  currentSpend: number;
  maxLimit: number | null; // null for unlimited like Sec 37
  potentialSavings: number;
  priority: 1 | 2 | 3 | 4 | 5; // 1 is highest
  action: string;
}

export interface DynamicState {
  grossIncome: number;
  regime: 'NEW' | 'OLD';
  effectiveTaxRate: number;
  lastUpdated: string; // ISO string
  transactions: Transaction[];
}
