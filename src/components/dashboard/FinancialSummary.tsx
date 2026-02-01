import React from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface FinancialSummaryProps {
    transactions: any[]
}

export default function FinancialSummary({ transactions }: FinancialSummaryProps) {
    const totalCredit = transactions
        .filter(t => t.type === 'CREDIT')
        .reduce((sum, t) => sum + t.amount, 0)

    const totalDebit = transactions
        .filter(t => t.type === 'DEBIT')
        .reduce((sum, t) => sum + t.amount, 0)

    const netFlow = totalCredit - totalDebit

    const formatAmount = (amt: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(Math.abs(amt))
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="glass-effect p-4 rounded-xl border border-white/5 bg-green-500/5">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Total Income</p>
                        <h3 className="text-2xl font-bold text-green-400 mt-1">{formatAmount(totalCredit)}</h3>
                    </div>
                    <div className="p-2 bg-green-500/20 rounded-lg">
                        <ArrowUpRight className="w-5 h-5 text-green-400" />
                    </div>
                </div>
            </div>

            <div className="glass-effect p-4 rounded-xl border border-white/5 bg-red-500/5">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Total Spend</p>
                        <h3 className="text-2xl font-bold text-red-400 mt-1">{formatAmount(totalDebit)}</h3>
                    </div>
                    <div className="p-2 bg-red-500/20 rounded-lg">
                        <ArrowDownRight className="w-5 h-5 text-red-400" />
                    </div>
                </div>
            </div>

            <div className="glass-effect p-4 rounded-xl border border-white/5 bg-blue-500/5">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Net Flow</p>
                        <h3 className={`text-2xl font-bold mt-1 ${netFlow >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                            {netFlow >= 0 ? '+' : '-'}{formatAmount(netFlow)}
                        </h3>
                    </div>
                    {/* Placeholder for small sparkline or icon */}
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <span className="text-xs font-bold text-blue-400">NET</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
