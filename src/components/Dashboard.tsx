'use client'

import { useState, useEffect } from 'react'
import { Plus, Upload, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import ScoreCard from './dashboard/ScoreCard'
import DeductionMeter from './dashboard/DeductionMeter'
import TransactionLedger from './dashboard/TransactionLedger'
import DocumentUpload from './DocumentUpload'
import AddTransactionForm from './AddTransactionForm'
import FinancialSummary from './dashboard/FinancialSummary'
import SpendingBreakdown from './dashboard/SpendingBreakdown'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import type { Transaction, TaxBreakdown, ShadowAnalysis } from '@/types'

export default function Dashboard() {
    const { signOut } = useAuth()
    const [grossIncome, setGrossIncome] = useState<number>(2800000)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [newRegimeTax, setNewRegimeTax] = useState<TaxBreakdown | null>(null)
    const [oldRegimeTax, setOldRegimeTax] = useState<TaxBreakdown | null>(null)
    const [shadowAnalysis, setShadowAnalysis] = useState<ShadowAnalysis | null>(null)
    const [loading, setLoading] = useState(false)
    const [showAddForm, setShowAddForm] = useState(false)
    const [showUpload, setShowUpload] = useState(false)

    useEffect(() => {
        fetchTransactions()
    }, [])

    useEffect(() => {
        calculateTaxes()
    }, [grossIncome, transactions])

    const fetchTransactions = async () => {
        try {
            const { data, error } = await supabase
                .from('statement_transactions')
                .select('*')
                .order('date', { ascending: false })

            if (data) {
                const realTxns: Transaction[] = data.map(t => ({
                    id: t.id,
                    description: t.description,
                    amount: Number(t.amount),
                    type: t.type as 'DEBIT' | 'CREDIT',
                    category: t.category || 'Uncategorized',
                    confidence: 100,
                    merchant: t.merchant_name,
                    date: t.date
                }))
                // Granular categories allowed now
                setTransactions(realTxns)

                // Auto-calculate Gross Income from CREDITS
                const totalIncome = realTxns
                    .filter(t => t.type === 'CREDIT')
                    .reduce((sum, t) => sum + t.amount, 0)

                if (totalIncome > 0) {
                    setGrossIncome(totalIncome)
                }
            }
        } catch (error) {
            console.error('Failed to fetch transactions', error)
        }
    }

    const calculateTaxes = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/engine/calculate-regime', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grossIncome, employmentType: 'Freelancer', transactions }),
            })
            const data = await res.json()
            if (data.success) {
                setNewRegimeTax(data.data.newRegimeTax)
                setOldRegimeTax(data.data.oldRegimeTax)
                setShadowAnalysis(data.data.shadowAnalysis)
            }
        } catch (error) {
            console.error('Error calculating taxes:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddTransaction = (newTxn: Transaction) => {
        setTransactions(prev => [newTxn, ...prev])
    }

    const handleToggleCategory = (id: string, currentCategory: string) => {
        // Toggle logic might need update for granular categories, defaulting to flipping between Business/Personal for now if applicable
        // Or strictly strictly only toggle if it is one of those two.
        const newCategory = currentCategory === 'Business' ? 'Personal' : 'Business'

        // Optimistic Update
        setTransactions(prev => prev.map(t =>
            t.id === id ? { ...t, category: newCategory as any } : t
        ))
    }

    // Determine Regime Winner
    const recommendedRegime = shadowAnalysis?.recommendedRegime || 'New'
    const isNewRegimeWinner = recommendedRegime === 'New'

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* HEADER: Context & global actions */}
                <header className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/5 pb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white/90">Taxicity</h1>
                        <p className="text-slate-400 text-sm">FY 2024-25 • Assessment Year 2025-26</p>
                    </div>

                    <div className="flex items-center gap-3">

                        <Link href="/transactions">
                            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5">
                                Transactions
                            </Button>
                        </Link>


                        {/* Income Input */}
                        <div className="relative group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">₹</span>
                            {/* Income Input */}
                            <Input
                                type="number"
                                value={grossIncome}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGrossIncome(Number(e.target.value))}
                                className="w-40 bg-white/5 border-white/10 text-white pl-7 h-10 rounded-lg focus:ring-blue-500/50"
                            />
                            <span className="absolute -top-5 left-0 text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                Gross Income
                            </span>
                        </div>


                        <Button
                            onClick={fetchTransactions}
                            variant="ghost"
                            size="icon"
                            className="bg-white/5 hover:bg-white/10 text-slate-400"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>

                        <Button
                            onClick={signOut}
                            variant="outline"
                            className="border-red-900/30 text-red-400 hover:bg-red-900/20 h-10 text-xs uppercase tracking-wider"
                        >
                            Logout
                        </Button>
                    </div>
                </header>

                {/* ROW 0: FINANCIAL SUMMARY (CASHFLOW) */}
                <FinancialSummary transactions={transactions} />

                {/* ROW 1: THE SCOREBOARD */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ScoreCard
                        title="You Need To Pay"
                        value={`₹${(newRegimeTax?.totalTax || 0).toLocaleString('en-IN')}`}
                        subValue={isNewRegimeWinner ? "New Regime Optimized" : "Old Regime Optimized"}
                        color="blue"
                        isWinner={true} // Highlighting the primary metric
                    />
                    <ScoreCard
                        title="You Can Save"
                        value={`₹${(shadowAnalysis?.shadowAmount || 0).toLocaleString('en-IN')}`}
                        subValue="Potential extra savings"
                        color="green"
                    />
                    <ScoreCard
                        title="Tax Rate"
                        value={`${(newRegimeTax?.effectiveTaxRate || 0).toFixed(1)}%`}
                        subValue="Of Gross Income"
                        color="default"
                    />
                </div>

                {/* ROW 2: DEEP DIVE & ANALYSIS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Column 1: Gap Analysis */}
                    <div className="glass-effect p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-white">Tax Savings Plan</h3>
                                <span className={`text-xs px-2 py-1 rounded font-bold ${isNewRegimeWinner ? 'bg-blue-500/20 text-blue-300' : 'bg-orange-500/20 text-orange-300'}`}>
                                    {recommendedRegime} Regime Wins
                                </span>
                            </div>

                            <p className="text-gray-400 text-sm mb-6">
                                The {recommendedRegime} Regime is currently more beneficial for you.
                                {shadowAnalysis?.shadowAmount && shadowAnalysis.shadowAmount > 0
                                    ? ` You are overpaying by ₹${shadowAnalysis.shadowAmount.toLocaleString('en-IN')} compared to the optimal path.`
                                    : " You are currently on the optimal path."}
                            </p>

                            {/* Action Items List */}
                            <div className="space-y-3">
                                <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Recommended Actions</h4>
                                {shadowAnalysis?.shadowActions.slice(0, 3).map(action => (
                                    <div key={action.id} className="bg-white/5 p-4 rounded-lg border border-white/5 space-y-3 group hover:border-white/10 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <span className="text-sm text-slate-200 font-medium block">{action.action}</span>
                                                {action.description && (
                                                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-[90%]">
                                                        {action.description}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-green-400 text-xs font-mono font-bold whitespace-nowrap bg-green-500/10 px-2 py-1 rounded">
                                                Save ₹{action.potentialSavings.toLocaleString('en-IN')}
                                            </span>
                                        </div>

                                        {action.impact && action.impact.length > 0 && (
                                            <div className="pt-2 border-t border-white/5">
                                                <ul className="text-[10px] text-slate-500 space-y-1 ml-4 list-disc">
                                                    {action.impact.map((point: string, i: number) => (
                                                        <li key={i}>{point}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {(!shadowAnalysis?.shadowActions || shadowAnalysis.shadowActions.length === 0) && (
                                    <div className="text-slate-500 text-sm italic">No pending actions. Great job!</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Spending Breakdown */}
                    <SpendingBreakdown transactions={transactions} />

                    {/* Column 3: Deduction Meters */}
                    <div className="glass-effect p-6 rounded-2xl border border-white/5">
                        <h3 className="text-lg font-semibold text-white mb-6">Deduction Meters</h3>
                        <DeductionMeter
                            label="Section 80C"
                            current={shadowAnalysis?.deductions?.section80C || 0}
                            max={150000}
                            color="bg-blue-500"
                        />
                        <DeductionMeter
                            label="Section 80D"
                            current={shadowAnalysis?.deductions?.section80D || 0}
                            max={50000}
                            color="bg-purple-500"
                        />
                        <DeductionMeter
                            label="NPS (80CCD)"
                            current={shadowAnalysis?.deductions?.nps || 0}
                            max={50000}
                            color="bg-orange-500"
                        />

                        <div className="mt-6 pt-6 border-t border-white/5">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Total Deductions</span>
                                <span className="text-white font-bold">
                                    ₹{((shadowAnalysis?.deductions?.section80C || 0) + (shadowAnalysis?.deductions?.section80D || 0) + (shadowAnalysis?.deductions?.nps || 0)).toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ROW 3: THE LEDGER */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Left panel: Upload Area */}
                    <div className="md:col-span-1">
                        <div className="sticky top-6">
                            <DocumentUpload onUploadSuccess={fetchTransactions} />
                            <Button
                                onClick={() => setShowAddForm(true)}
                                className="w-full mt-4 bg-white/5 hover:bg-white/10 text-white border border-dashed border-white/20 h-12"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Manual Entry
                            </Button>
                        </div>
                    </div>

                    {/* Column 2: Transaction Feed */}
                    <div className="md:col-span-3">
                        <TransactionLedger
                            transactions={transactions}
                            onToggleCategory={handleToggleCategory}
                        />
                        <div className="mt-4 text-center">
                            <Link href="/transactions">
                                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-slate-400">
                                    View All Transactions & Add Manual
                                </Button>
                            </Link>
                        </div>
                        {/* Add Transaction Form Button (Optional, if we keep the modal here too) */}
                    </div>
                </div>

                {/* Add Transaction Modal */}
                {showAddForm && (
                    <AddTransactionForm
                        onAddTransaction={handleAddTransaction}
                        onClose={() => setShowAddForm(false)}
                    />
                )}
            </div>
        </div>
    )
}
