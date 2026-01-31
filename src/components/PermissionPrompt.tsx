import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

export const PermissionPrompt = () => {
    const { hasPermission, requestPermission } = useNotifications();
    const [dismissed, setDismissed] = useState(false);

    // If we have permission or user dismissed, don't show
    if (hasPermission || dismissed) return null;

    // We can also check if browser supports notifications
    if (typeof window !== 'undefined' && !('Notification' in window)) return null;
    // If permission is 'denied', prompt won't work anyway, so maybe best to hide or show "Enable in Settings"
    if (typeof window !== 'undefined' && Notification.permission === 'denied') return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 max-w-sm bg-white border border-indigo-100 rounded-xl shadow-lg p-5 animate-in slide-in-from-bottom duration-500">
            <div className="flex items-start gap-4">
                <div className="bg-indigo-50 p-2 rounded-lg">
                    <span className="text-2xl">🔔</span>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Enable Smart Alerts?</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-3">
                        Get instant alerts when tax saving opportunities appear. We only notify you about important savings.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={requestPermission}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Allow
                        </button>
                        <button
                            onClick={() => setDismissed(true)}
                            className="px-4 py-2 text-gray-500 text-sm font-medium hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
