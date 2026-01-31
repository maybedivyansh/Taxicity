import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { playSuccessSound, playAlertSound, playWarningSound, playOpportunitySound } from '../styles/sounds';

export const SoundAlert = () => {
    const { preferences, setPreferences } = useNotifications();

    const handleTestSound = (type: 'success' | 'alert' | 'warning' | 'opportunity') => {
        switch (type) {
            case 'success': playSuccessSound(); break;
            case 'alert': playAlertSound(); break;
            case 'warning': playWarningSound(); break;
            case 'opportunity': playOpportunitySound(); break;
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    🔊 Sound Settings
                </h3>

                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={preferences.soundEnabled}
                        onChange={(e) => setPreferences({ ...preferences, soundEnabled: e.target.checked })}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">enabled</span>
                </label>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Volume ({Math.round((preferences.volume || 1) * 100)}%)
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={preferences.volume || 1}
                        onChange={(e) => setPreferences({ ...preferences, volume: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                        onClick={() => handleTestSound('success')}
                        className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 flex items-center justify-center gap-2"
                    >
                        ✓ Success
                    </button>
                    <button
                        onClick={() => handleTestSound('alert')}
                        className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100 flex items-center justify-center gap-2"
                    >
                        🚨 Alert
                    </button>
                    <button
                        onClick={() => handleTestSound('warning')}
                        className="px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm hover:bg-orange-100 flex items-center justify-center gap-2"
                    >
                        ⚠️ Warning
                    </button>
                    <button
                        onClick={() => handleTestSound('opportunity')}
                        className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm hover:bg-indigo-100 flex items-center justify-center gap-2"
                    >
                        💡 Opportunity
                    </button>
                </div>
            </div>
        </div>
    );
};
