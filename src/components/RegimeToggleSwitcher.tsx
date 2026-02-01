import React from 'react';
import { RegimeToggleState } from '@/types/ui';
import { CheckCircle2, ArrowRightLeft } from 'lucide-react';

interface ExtendedRegimeToggleState extends RegimeToggleState {
    onToggleRegime?: () => void;
}

export const RegimeToggleSwitcher: React.FC<ExtendedRegimeToggleState> = ({
    currentRegime,
    newRegimeTax,
    oldRegimeTax,
    shadowAmount,
    recommendedRegime,
    onToggleRegime
}) => {
    const isNewRec = recommendedRegime === 'New';
    const isOldRec = recommendedRegime === 'Old';

    return (
        <div className="flex flex-col md:flex-row gap-6 w-full items-center justify-between">
            {/* New Regime Card */}
            <div className={`flex-1 relative p-6 rounded-xl border transition-all duration-300 ${currentRegime === 'New' ? 'bg-indigo-50 border-indigo-200 shadow-md transform scale-105' : 'bg-white border-gray-100 opacity-60'}`}>
                {isNewRec && (
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-sm tracking-wider">
                        <CheckCircle2 size={12} /> RECOMMENDED
                    </div>
                )}
                <div className="flex justify-between items-center mb-2">
                    <h3 className={`text-lg font-bold ${currentRegime === 'New' ? 'text-indigo-900' : 'text-gray-500'}`}>New Regime</h3>
                </div>
                <div className={`text-3xl font-mono font-bold mb-1 ${currentRegime === 'New' ? 'text-indigo-700' : 'text-gray-400'}`}>₹{(newRegimeTax / 100000).toFixed(2)} L</div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Tax Payable</p>
            </div>

            {/* Switcher Button */}
            <div className="flex items-center justify-center -mx-4 z-10">
                <button
                    onClick={onToggleRegime}
                    className="flex items-center gap-2 p-3 bg-white border border-gray-200 text-gray-700 rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg hover:border-indigo-300 group z-20"
                >
                    <ArrowRightLeft size={20} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </button>
            </div>

            {/* Old Regime Card */}
            <div className={`flex-1 relative p-6 rounded-xl border transition-all duration-300 ${currentRegime === 'Old' ? 'bg-indigo-50 border-indigo-200 shadow-md transform scale-105' : 'bg-white border-gray-100 opacity-60'}`}>
                {isOldRec && (
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-sm tracking-wider">
                        <CheckCircle2 size={12} /> RECOMMENDED
                    </div>
                )}
                <div className="flex justify-between items-center mb-2">
                    <h3 className={`text-lg font-bold ${currentRegime === 'Old' ? 'text-indigo-900' : 'text-gray-500'}`}>Old Regime</h3>
                    {isOldRec && <span className="text-emerald-600 text-sm font-bold">Save ₹{Math.abs(oldRegimeTax - newRegimeTax).toLocaleString()}</span>}
                </div>
                <div className={`text-3xl font-mono font-bold mb-1 ${currentRegime === 'Old' ? 'text-indigo-700' : 'text-gray-400'}`}>₹{(oldRegimeTax / 100000).toFixed(2)} L</div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Tax Payable</p>
            </div>
        </div>
    );
};
