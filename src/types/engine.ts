export interface TaxInput {
    grossIncome: number;
    deductions: {
        section80C: number;
        section80D: number;
        hra: number;
        lta: number;
        other: number;
    };
    employmentType: 'SALARIED' | 'SELF_EMPLOYED';
}

export interface TaxRegimeData {
    taxableIncome: number;
    baseTax: number;
    cess: number;
    surcharge: number;
    totalTax: number;
    effectiveRate: number;
    breakdown: {
        slab: string;
        rate: number;
        amount: number;
    }[];
}

export interface TaxCalculationResult {
    oldRegime: TaxRegimeData;
    newRegime: TaxRegimeData;
    recommendation: 'OLD' | 'NEW';
    savings: number;
}
