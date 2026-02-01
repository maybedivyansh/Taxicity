import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from '../hooks/useNotifications';
import { errorHandlingService } from '../services/errorHandlingService'; // Hypothetical explicit access

export const DashboardHeader = () => {
    const { notifications } = useNotifications();
    const [errorCount, setErrorCount] = useState(0);

    useEffect(() => {
        // In a real app we might subscribe to error service or check an endpoint
        // Mocking for demo
        const checkErrors = () => {
            // This would ideally come from a context or swr hook
            setErrorCount(0); // Default to clean
        };
        checkErrors();
    }, []);

    const unreadCount = notifications.length;

    return (
        <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between sticky top-0 z-10 w-full">
            {/* Left: Branding or Breadcrumbs */}
            <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Taxicity" className="w-8 h-8 object-contain" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    Taxicity
                </span>
            </div>

            {/* Right: Actions & Status */}
            <div className="flex items-center gap-6">

                {/* Error Indicator */}
                {errorCount > 0 && (
                    <Link href="/support/tickets" className="flex items-center gap-1.5 text-red-600 text-sm font-medium bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition">
                        <span>⚠️</span> {errorCount} Error{errorCount > 1 ? 's' : ''}
                    </Link>
                )}

                {/* Notification Bell */}
                <div className="relative cursor-pointer group">
                    <span className="text-xl">🔔</span>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white">
                            {unreadCount}
                        </span>
                    )}
                    {unreadCount > 0 && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white shadow-xl rounded-lg border border-gray-100 p-2 hidden group-hover:block">
                            <p className="text-xs font-semibold text-gray-500 mb-2 px-2">Recent Alerts</p>
                            {notifications.slice(0, 3).map(n => (
                                <div key={n.id} className="p-2 hover:bg-gray-50 rounded text-sm mb-1">
                                    <p className="font-medium text-gray-800">{n.title}</p>
                                    <p className="text-xs text-gray-500 truncate">{n.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Settings Link */}
                <Link href="/settings" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition">
                    <span>📧</span> Preferences
                </Link>

                {/* User Profile */}
                <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs ring-2 ring-transparent hover:ring-indigo-100 transition cursor-pointer">
                    JS
                </div>
            </div>
        </header>
    );
};
