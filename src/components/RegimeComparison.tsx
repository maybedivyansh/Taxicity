import type { TaxBreakdown } from '@/types'

interface Props {
    newRegimeTax: TaxBreakdown
    oldRegimeTax: TaxBreakdown
    savings: number
}

export default function RegimeComparison({ newRegimeTax, oldRegimeTax, savings }: Props) {
    const cheaper = newRegimeTax.totalTax <= oldRegimeTax.totalTax ? 'new' : 'old'

    return (
        <div className="glass-effect p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Regime Comparison</h2>
            <div className="grid md:grid-cols-2 gap-6">
                {/* New Regime */}
                <div className={`glass-effect p-6 border-2 ${cheaper === 'new' ? 'border-green-500' : 'border-gray-500'}`}>
                    <h3 className="text-xl font-bold text-white mb-2">New Regime</h3>
                    <p className="text-3xl font-bold text-blue-400">₹{(newRegimeTax.totalTax / 100000).toFixed(2)}L</p>
                    <p className="text-gray-400">Effective Rate: {newRegimeTax.effectiveTaxRate.toFixed(2)}%</p>
                    {cheaper === 'new' && <p className="text-green-400 mt-2">✓ RECOMMENDED</p>}
                </div>

                {/* Old Regime */}
                <div className={`glass-effect p-6 border-2 ${cheaper === 'old' ? 'border-green-500' : 'border-gray-500'}`}>
                    <h3 className="text-xl font-bold text-white mb-2">Old Regime</h3>
                    <p className="text-3xl font-bold text-blue-400">₹{(oldRegimeTax.totalTax / 100000).toFixed(2)}L</p>
                    <p className="text-gray-400">Effective Rate: {oldRegimeTax.effectiveTaxRate.toFixed(2)}%</p>
                    {cheaper === 'old' && <p className="text-green-400 mt-2">✓ RECOMMENDED</p>}
                </div>
            </div>
            {savings > 0 && <p className="text-center text-green-400 text-lg font-bold mt-4">Save ₹{(savings / 100000).toFixed(2)}L by switching</p>}
        </div>
    )
}
