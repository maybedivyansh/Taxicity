import React from 'react'
import { Transaction } from '@/types'
import { Check, X, Briefcase, User, HelpCircle } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

interface TransactionLedgerProps {
    transactions: Transaction[]
    onToggleCategory: (id: string, currentCategory: string) => void
}

export default function TransactionLedger({ transactions, onToggleCategory }: TransactionLedgerProps) {

    // Helper to get color based on category
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Business': return 'text-purple-400 border-purple-400/30 bg-purple-400/10'
            case 'Personal': return 'text-blue-400 border-blue-400/30 bg-blue-400/10'
            case 'Investment': return 'text-green-400 border-green-400/30 bg-green-400/10'
            default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10'
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        })
    }

    return (
        <div className="glass-effect rounded-2xl overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                    Live Transaction Feed
                </h3>
                <span className="text-xs text-gray-400">
                    {transactions.length} transactions found
                </span>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-2">
                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p>No transactions yet</p>
                        <p className="text-sm">Upload a bank statement to get started</p>
                    </div>
                ) : (
                    transactions.map((txn) => (
                        <div
                            key={txn.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 transition-colors border border-white/5 group"
                        >
                            {/* Left: Date & Desc */}
                            <div className="flex items-center gap-4 flex-1">
                                <div className="text-center min-w-[50px]">
                                    <div className="text-xs text-gray-500 uppercase font-bold">{formatDate(txn.date).split(' ')[1]}</div>
                                    <div className="text-lg font-bold text-gray-300">{formatDate(txn.date).split(' ')[0]}</div>
                                </div>

                                <div className="flex-1">
                                    <p className="text-white font-medium truncate max-w-[200px] md:max-w-md">
                                        {txn.description}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {txn.merchant || 'Unknown Merchant'}
                                    </p>
                                </div>
                            </div>

                            {/* Right: Amount & Toggle */}
                            <div className="flex items-center gap-6">
                                <div className={`font-mono text-right font-medium ${txn.type === 'CREDIT' ? 'text-green-400' : 'text-white'}`}>
                                    {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                                </div>

                                <div className="flex items-center gap-3 min-w-[140px] justify-end">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                                        {txn.category === 'Business' ? 'Business' : 'Personal'}
                                    </span>
                                    <Switch
                                        checked={txn.category === 'Business'}
                                        onCheckedChange={() => onToggleCategory(txn.id, txn.category)}
                                        className="data-[state=checked]:bg-purple-600"
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
