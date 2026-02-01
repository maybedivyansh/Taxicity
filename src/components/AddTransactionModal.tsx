import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabaseClient'
import { Loader2 } from 'lucide-react'

interface AddTransactionModalProps {
    onTransactionAdded?: () => void
}

export default function AddTransactionModal({ onTransactionAdded }: AddTransactionModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        type: 'DEBIT',
        category: 'Personal'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Insert into statement_transactions
            // We use a null statement_id for manual entries or create a "Manual" placeholder if needed.
            // But our schema says statement_id is NOT NULL. 
            // We should probably allow nullable statement_id or create a "Manual Entry" statement for the user.

            // For now, let's try to find or create a "Manual Entries" statement bucket
            let statementId = null

            // Check if a "Manual Entries" statement exists for this user
            const { data: existingStatement } = await supabase
                .from('bank_statements')
                .select('id')
                .eq('user_id', user.id)
                .eq('filename', 'Manual Entry')
                .limit(1)
                .single()

            if (existingStatement) {
                statementId = existingStatement.id
            } else {
                // Create it
                const { data: newStatement } = await supabase
                    .from('bank_statements')
                    .insert({
                        user_id: user.id,
                        filename: 'Manual Entry',
                        file_path: 'manual',
                        status: 'processed'
                    })
                    .select()
                    .single()

                if (newStatement) statementId = newStatement.id
            }

            if (!statementId) throw new Error('Failed to associate transaction with a ledger')

            const { error } = await supabase.from('statement_transactions').insert({
                statement_id: statementId,
                user_id: user.id,
                date: formData.date,
                description: formData.description,
                amount: parseFloat(formData.amount),
                type: formData.type,
                category: formData.category,
                merchant_name: 'Manual Entry'
            })

            if (error) throw error

            setOpen(false)
            setFormData({
                date: new Date().toISOString().split('T')[0],
                description: '',
                amount: '',
                type: 'DEBIT',
                category: 'Personal'
            })

            if (onTransactionAdded) onTransactionAdded()

        } catch (error) {
            console.error('Error adding transaction:', error)
            alert('Failed to add transaction')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <span className="mr-2">+</span> Add Manual
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#151A25] border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={v => setFormData({ ...formData, type: v })}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/10 text-white">
                                    <SelectItem value="DEBIT">Debit (Expense)</SelectItem>
                                    <SelectItem value="CREDIT">Credit (Income)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                            placeholder="e.g. Dinner at Taj"
                            required
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="bg-white/5 border-white/10"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Amount (₹)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                required
                                min="0"
                                step="0.01"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={v => setFormData({ ...formData, category: v })}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/10 text-white">
                                    <SelectItem value="Personal">Personal</SelectItem>
                                    <SelectItem value="Business">Business</SelectItem>
                                    <SelectItem value="Investment">Investment</SelectItem>
                                    <SelectItem value="Food">Food</SelectItem>
                                    <SelectItem value="Travel">Travel</SelectItem>
                                    <SelectItem value="Medical">Medical</SelectItem>
                                    <SelectItem value="Utilities">Utilities</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-2" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Transaction
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
