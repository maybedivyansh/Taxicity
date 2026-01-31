import React, { useEffect, useState } from 'react';

// Mock data for analytics
const mockMetrics = {
    transactionsAnalyzed: 50,
    deductionsIdentified: 850000,
    potentialSavings: 250000,
    avgConfidence: 94,
    fastestImprovement: { from: 24, to: 12 }
};

export const AnalyticsDashboard = () => {
    const [metrics, setMetrics] = useState(mockMetrics);

    // Animate numbers on mount
    useEffect(() => {
        // In a real app, fetch from API
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumSignificantDigits: 3
        }).format(val);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-500">Real-time usage metrics and system performance</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Card 1 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-400 uppercase tracking-wide">Transactions Analyzed</div>
                    <div className="text-3xl font-bold text-gray-900 mt-2">{metrics.transactionsAnalyzed}</div>
                    <div className="text-xs text-green-600 font-medium mt-1">↑ 12% vs last week</div>
                </div>

                {/* Card 2 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total Deductions</div>
                    <div className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(metrics.deductionsIdentified)}</div>
                    <div className="text-xs text-green-600 font-medium mt-1">Found in 50 transactions</div>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-400 uppercase tracking-wide">Potential Savings</div>
                    <div className="text-3xl font-bold text-indigo-600 mt-2">{formatCurrency(metrics.potentialSavings)}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Avg. ₹5,000 per user</div>
                </div>

                {/* Card 4 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-400 uppercase tracking-wide">AI Confidence</div>
                    <div className="text-3xl font-bold text-gray-900 mt-2">{metrics.avgConfidence}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Optimization Journey</h3>
                    <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                        <div className="text-center">
                            <div className="text-sm text-gray-500 mb-1">Initial Rate</div>
                            <div className="text-2xl font-bold text-red-500">{metrics.fastestImprovement.from}%</div>
                        </div>
                        <div className="text-2xl text-gray-300">➜</div>
                        <div className="text-center">
                            <div className="text-sm text-gray-500 mb-1">Optimized Rate</div>
                            <div className="text-2xl font-bold text-green-600">{metrics.fastestImprovement.to}%</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-4xl">🏆</div>
                        <h3 className="text-lg font-semibold text-gray-900 mt-2">Hackathon Ready</h3>
                        <p className="text-sm text-gray-500">System performing optimally</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
