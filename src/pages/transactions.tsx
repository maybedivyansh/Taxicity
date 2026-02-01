import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeft, Plus, Download, Filter, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddTransactionModal from '@/components/AddTransactionModal'
import UploadStatementModal from '@/components/UploadStatementModal'

export default function TransactionsPage() {
    const { session, loading: authLoading } = useAuth()
    const router = useRouter()
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('All')

    useEffect(() => {
        if (!authLoading && !session) {
            router.push('/auth/login')
        } else if (session) {
            fetchTransactions()
        }
    }, [session, authLoading, router])

    const fetchTransactions = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('statement_transactions')
                .select(`
                    *,
                    bank_statements ( filename )
                `)
                .order('date', { ascending: false })

            if (error) throw error
            setTransactions(data || [])
        } catch (error) {
            console.error('Error fetching transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    // Deduplicate transactions based on a unique key signature
    // This prevents double-counting if the same statement was uploaded multiple times
    const uniqueTransactions = transactions.filter((tx, index, self) =>
        index === self.findIndex((t) => (
            t.date === tx.date &&
            t.description === tx.description &&
            Math.abs(t.amount) === Math.abs(tx.amount) &&
            t.type === tx.type
        ))
    )

    const filteredTransactions = uniqueTransactions.filter(t => {
        const matchesSearch = t.description?.toLowerCase().includes(search.toLowerCase()) ||
            t.merchant_name?.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter
        return matchesSearch && matchesCategory
    })

    const totalInflow = filteredTransactions
        .filter(t => t.type === 'CREDIT')
        .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalOutflow = filteredTransactions
        .filter(t => t.type === 'DEBIT')
        .reduce((sum, t) => sum + Number(t.amount), 0)

    const netFlow = totalInflow - totalOutflow

    if (authLoading) return <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="hover:bg-white/5">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">All Transactions</h1>
                            <p className="text-slate-400 text-sm">
                                {filteredTransactions.length} unique entries found
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <UploadStatementModal onUploadSuccess={fetchTransactions} />
                        <AddTransactionModal onTransactionAdded={fetchTransactions} />
                        <Button variant="outline" className="border-white/10 hover:bg-white/5">
                            <Download className="w-4 h-4 mr-2" /> Export
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                            placeholder="Search transactions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-black/20 border-white/10 text-white"
                        />
                    </div>
                    <div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-white/10 text-white">
                                <SelectItem value="All">All Categories</SelectItem>
                                <SelectItem value="Personal">Personal</SelectItem>
                                <SelectItem value="Business">Business</SelectItem>
                                <SelectItem value="Investment">Investment</SelectItem>
                                <SelectItem value="Food">Food</SelectItem>
                                <SelectItem value="Travel">Travel</SelectItem>
                                <SelectItem value="Medical">Medical</SelectItem>
                                <SelectItem value="Utilities">Utilities</SelectItem>
                                <SelectItem value="Insurance">Insurance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-end gap-4 text-sm font-mono">
                        <div className="text-right">
                            <div className="text-slate-500 text-xs">Total Inflow</div>
                            <div className="text-green-400">₹{totalInflow.toLocaleString('en-IN')}</div>
                        </div>
                        <div className="h-8 w-px bg-white/10"></div>
                        <div className="text-right">
                            <div className="text-slate-500 text-xs">Total Outflow</div>
                            <div className="text-red-400">₹{totalOutflow.toLocaleString('en-IN')}</div>
                        </div>
                        <div className="h-8 w-px bg-white/10"></div>
                        <div className="text-right">
                            <div className="text-slate-500 text-xs">Net Flow</div>
                            <div className={`font-bold ${netFlow >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                                {netFlow >= 0 ? '+' : ''}₹{netFlow.toLocaleString('en-IN')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-black/20 text-slate-400 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Source</th>
                                    <th className="p-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                            Loading transactions...
                                        </td>
                                    </tr>
                                ) : filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">
                                            No transactions found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4 font-mono text-slate-400 whitespace-nowrap">
                                                {new Date(tx.date).toLocaleDateString('en-IN', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-white">{tx.description}</div>
                                                <div className="text-xs text-slate-500">{tx.merchant_name}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${tx.category === 'Business' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                    tx.category === 'Investment' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    }`}>
                                                    {tx.category || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-500 text-xs">
                                                {tx.bank_statements?.filename || 'Manual Entry'}
                                            </td>
                                            <td className={`p-4 text-right font-mono font-medium ${tx.type === 'CREDIT' ? 'text-green-400' : 'text-slate-200'
                                                }`}>
                                                {tx.type === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
