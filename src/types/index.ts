export interface Transaction {
    id: string
    date: string
    description: string
    amount: number
    type: 'DEBIT' | 'CREDIT'
    category: 'Personal' | 'Business' | 'Investment' | 'Unclassified'
    confidence: number
    merchant: string
}

export interface TaxBreakdown {
    regime: 'New' | 'Old'
    taxableIncome: number
    taxBeforeSurcharge: number
    surcharge: number
    cess: number
    totalTax: number
    effectiveTaxRate: number
}

export interface ShadowGap {
    id: string
    action: string
    potentialSavings: number
    effort: 'Easy' | 'Medium' | 'Hard'
    priority: number
}

export interface Deductions {
    section80C: number
    section80D: number
    nps: number
    capped80C: number
    capped80D: number
    cappedNPS: number
}

export interface ShadowAnalysis {
    newRegimeTax: number
    oldRegimeTax: number
    shadowAmount: number
    recommendedRegime: 'New' | 'Old'
    shadowActions: ShadowGap[]
    deductions?: Deductions
}
