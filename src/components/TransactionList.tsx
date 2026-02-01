import type { Transaction } from '@/types'

interface Props {
    transactions: Transaction[]
    onDelete: (id: string) => void
}

export default function TransactionList({ transactions, onDelete }: Props) {
    return (
        <div className="glass-effect p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Transactions</h2>
            {transactions.length === 0 ? (
                <p className="text-gray-400">No transactions uploaded yet</p>
            ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {transactions.slice(0, 10).map((txn) => (
                        <div key={txn.id} className="flex justify-between items-center bg-white/5 p-3 rounded group hover:bg-white/10 transition-colors">
                            <div className="flex-1">
                                <p className="text-white font-semibold">{txn.description}</p>
                                <p className="text-gray-400 text-sm">{txn.date}</p>
                            </div>
                            <div className="text-right mr-4">
                                <p className="text-white font-bold">₹{(txn.amount).toLocaleString('en-IN')}</p>
                                <span className={`text-xs px-2 py-1 rounded-full ${txn.category === 'Business' ? 'bg-green-900/50 text-green-400' :
                                    txn.category === 'Investment' ? 'bg-purple-900/50 text-purple-400' :
                                        'bg-gray-700/50 text-gray-400'
                                    }`}>
                                    {txn.category}
                                </span>
                            </div>
                            <button
                                onClick={() => onDelete(txn.id)}
                                className="text-gray-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Transaction"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
