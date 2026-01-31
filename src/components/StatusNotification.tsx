import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications'; // Reusing context if available, or independent

export const StatusNotification = () => {
    // Use global state or event listener in real app
    const [status, setStatus] = useState<{ message: string, type: 'info' | 'error' | 'success' } | null>(null);

    useEffect(() => {
        // Listen for custom events dispatched by services
        const handleStatus = (e: CustomEvent) => {
            setStatus(e.detail);
            if (e.detail.timeout) {
                setTimeout(() => setStatus(null), e.detail.timeout);
            }
        };

        window.addEventListener('status-update' as any, handleStatus as any);
        return () => window.removeEventListener('status-update' as any, handleStatus as any);
    }, []);

    if (!status) return null;

    return (
        <div className={`fixed bottom-0 left-0 right-0 py-2 px-4 text-center text-sm font-medium transition-transform duration-300 z-50 ${status.type === 'error' ? 'bg-red-600 text-white' :
                status.type === 'success' ? 'bg-green-600 text-white' :
                    'bg-indigo-600 text-white'
            }`}>
            <div className="flex items-center justify-center gap-2">
                {status.type === 'error' && <span>⚠️</span>}
                {status.type === 'success' && <span>✓</span>}
                {status.message}
                {status.type === 'error' && (
                    <a href="/support/tickets" className="underline ml-2 opacity-90 hover:opacity-100">Report Issue</a>
                )}
            </div>
            <button
                onClick={() => setStatus(null)}
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
            >
                ✕
            </button>
        </div>
    );
};

// Helper to trigger from anywhere
export const triggerStatus = (message: string, type: 'info' | 'error' | 'success' = 'info', timeout = 5000) => {
    if (typeof window !== 'undefined') {
        const event = new CustomEvent('status-update', { detail: { message, type, timeout } });
        window.dispatchEvent(event);
    }
};
