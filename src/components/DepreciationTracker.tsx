import React, { useState } from 'react';
import { AssetType, DeprecationAdvice } from '@/types/intelligence';
import { Plus, Calculator, TrendingDown } from 'lucide-react';

export const DepreciationTracker: React.FC = () => {
    const [assets, setAssets] = useState<any[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newAsset, setNewAsset] = useState({ name: '', cost: '', date: '', type: 'ELECTRONICS' });

    const handleAddAsset = () => {
        if (!newAsset.name || !newAsset.cost) return;
        setAssets([...assets, {
            ...newAsset,
            id: Date.now(),
            cost: Number(newAsset.cost),
            savings: Number(newAsset.cost) * 0.4 * 0.3 // Approx Calc
        }]);
        setIsFormOpen(false);
        setNewAsset({ name: '', cost: '', date: '', type: 'ELECTRONICS' });
    };

    return (
        <div className="bg-white p-6 border rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-gray-600" />
                    Depreciation Tracker
                </h2>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-gray-800 transition-colors"
                >
                    <Plus size={16} /> Add Asset
                </button>
            </div>

            {isFormOpen && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg border animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                            placeholder="Asset Name (e.g., MacBook)"
                            className="p-2 border rounded text-sm"
                            value={newAsset.name}
                            onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                        />
                        <input
                            placeholder="Cost (₹)"
                            type="number"
                            className="p-2 border rounded text-sm"
                            value={newAsset.cost}
                            onChange={e => setNewAsset({ ...newAsset, cost: e.target.value })}
                        />
                        <input
                            type="date"
                            className="p-2 border rounded text-sm"
                            value={newAsset.date}
                            onChange={e => setNewAsset({ ...newAsset, date: e.target.value })}
                        />
                        <select
                            className="p-2 border rounded text-sm"
                            value={newAsset.type}
                            onChange={e => setNewAsset({ ...newAsset, type: e.target.value })}
                        >
                            <option value="ELECTRONICS">Electronics (40%)</option>
                            <option value="FURNITURE">Furniture (10%)</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsFormOpen(false)} className="text-xs px-3 py-1.5 text-gray-600 hover:bg-gray-200 rounded">Cancel</button>
                        <button onClick={handleAddAsset} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700">Calculate Savings</button>
                    </div>
                </div>
            )}

            {assets.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded-lg">
                    No assets tracked yet. Add high-value purchases to save tax.
                </div>
            ) : (
                <div className="space-y-4">
                    {assets.map(asset => (
                        <div key={asset.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border hover:border-indigo-200 transition-colors">
                            <div>
                                <h4 className="font-semibold text-gray-900">{asset.name}</h4>
                                <p className="text-xs text-gray-500">Purchased: {asset.date} • Cost: ₹{asset.cost.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Year 1 Tax Save</p>
                                <p className="text-indigo-600 font-bold font-mono">₹{Math.round(asset.savings).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
