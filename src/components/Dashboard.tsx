import React, { useEffect } from 'react';
import { useTaxEngine } from '../hooks/useTaxEngine';
import { TaxInput } from '../types/engine';
import { TaxTemperatureGauge } from './TaxTemperatureGauge';
import { DashboardHeader } from './DashboardHeader';

export default function Dashboard() {
    const { calculateTax, result, loading } = useTaxEngine();

    useEffect(() => {
        // Initial Calculation with dummy data for Demo
        const initialData: TaxInput = {
            grossIncome: 1200000,
            employmentType: 'SALARIED',
            deductions: {
                section80C: 150000,
                section80D: 25000,
                hra: 0,
                lta: 0,
                other: 0
            }
        };
        calculateTax(initialData);
    }, [calculateTax]);

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Tax-Loss Shadow Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Tax Summary / Gauge */}
                    <div className="bg-white p-6 border rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Tax Liability</h2>
                        {loading ? (
                            <div className="animate-pulse flex space-x-4">
                                <div className="rounded-full bg-gray-200 h-24 w-24"></div>
                                <div className="flex-1 space-y-4 py-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ) : result ? (
                            <div className="flex flex-col items-center">
                                {/* Using Type Assertion or updating Gauge to accept specific props */}
                                {/* Assuming TaxTemperatureGauge can take these props or update it next */}
                                <TaxTemperatureGauge
                                    min={0}
                                    max={40}
                                    value={result.newRegime.effectiveRate}
                                    label="Effective Tax Rate"
                                />
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-500">Rec. Regime</p>
                                    <p className="text-2xl font-bold text-indigo-600">{result.recommendation} REGIME</p>
                                    <p className="text-sm text-gray-500 mt-2">Potential Savings</p>
                                    <p className="text-lg font-semibold text-green-600">₹{result.savings.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">No data available.</p>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white p-6 border rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Financial Snapshot</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Gross Income</span>
                                <span className="font-semibold text-gray-900">₹12,00,000</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">Total Deductions</span>
                                <span className="font-semibold text-gray-900">₹1,75,000</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600">New Regime Tax</span>
                                <span className="font-semibold text-gray-900">₹{(result?.newRegime.totalTax || 0).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
