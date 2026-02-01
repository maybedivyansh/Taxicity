'use client'

import { useState } from 'react'
import { Plus, X, Calendar, IndianRupee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Transaction } from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface Props {
    onAddTransaction: (txn: Transaction) => void
    onClose: () => void
}

export default function AddTransactionForm({ onAddTransaction, onClose }: Props) {
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState<Transaction['category']>('Personal')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Add logic to submit
        const newTxn: Transaction = {
            id: uuidv4(),
            description,
            amount: parseFloat(amount),
            category,
            date,
            confidence: 1.0, // Manual entry is 100% confident
            merchant: description // Simplify for now
        }

        onAddTransaction(newTxn)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6">Add Transaction</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-1">Description</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. New MacBook Pro"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-1">Amount (₹)</label>
                            <div className="relative">
                                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    className="w-full bg-slate-800 border-slate-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-1">Date</label>
                            <div className="relative">
                                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-slate-800 border-slate-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-1">Category</label>
                        <select
                            className="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as any)}
                        >
                            <option value="Personal">Personal Expense</option>
                            <option value="Business">Business / Professional</option>
                            <option value="Investment">Investment (80C/80D)</option>
                        </select>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold mt-4"
                    >
                        Add Transaction
                    </Button>
                </form>
            </div>
        </div>
    )
}
