import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface SpendingBreakdownProps {
    transactions: any[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A855F7', '#EF4444', '#EC4899'];

export default function SpendingBreakdown({ transactions }: SpendingBreakdownProps) {

    // Aggregate spending by category
    const categoryTotals = transactions
        .filter(t => t.type === 'DEBIT')
        .reduce((acc, t) => {
            const cat = t.category || 'Uncategorized';
            acc[cat] = (acc[cat] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    const data = Object.entries(categoryTotals)
        .map(([name, value]) => ({ name, value: value as number }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5 categories

    const formatCurrency = (amt: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amt)
    }

    if (data.length === 0) return null;

    return (
        <div className="glass-effect p-6 rounded-2xl border border-white/5 h-full">
            <h3 className="text-lg font-semibold text-white mb-4">Top Spending</h3>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                            itemStyle={{ color: '#f8fafc' }}
                            formatter={(value: number) => formatCurrency(value)}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-2">
                {data.slice(0, 3).map((item, idx) => (
                    <div key={item.name} className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                            <span className="text-slate-300">{item.name}</span>
                        </div>
                        <span className="text-slate-400 font-mono">{formatCurrency(item.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
