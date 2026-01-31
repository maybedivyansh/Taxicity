import React, { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationEvent } from '../types/notifications';

const NotificationItem = ({ notification, onClose }: { notification: NotificationEvent; onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const getColors = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200 text-green-800';
            case 'warning': return 'bg-orange-50 border-orange-200 text-orange-800';
            case 'alert': return 'bg-red-50 border-red-200 text-red-800';
            default: return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return '✓';
            case 'warning': return '⚠️';
            case 'alert': return '🚨';
            default: return 'ℹ️';
        }
    };

    return (
        <div className={`flex items-start p-4 mb-3 rounded-lg border shadow-sm transition-all animate-in slide-in-from-right ${getColors(notification.type)}`}>
            <span className="text-xl mr-3">{getIcon(notification.type)}</span>
            <div className="flex-1">
                <h4 className="font-semibold text-sm">{notification.title}</h4>
                <p className="text-sm opacity-90">{notification.message}</p>
            </div>
            <button
                onClick={onClose}
                className="ml-2 text-opacity-50 hover:text-opacity-100 text-current transition-opacity"
            >
                ×
            </button>
        </div>
    );
};

export const NotificationCenter = () => {
    const { notifications, removeNotification, preferences, setPreferences } = useNotifications();

    return (
        <div className="fixed top-4 right-4 z-50 w-80 flex flex-col items-end">
            {/* Sound Toggle */}
            <div className="mb-2 bg-white/90 backdrop-blur border rounded-full px-3 py-1 shadow-sm text-xs flex items-center gap-2">
                <span>Sound:</span>
                <button
                    onClick={() => setPreferences({ ...preferences, soundEnabled: !preferences.soundEnabled })}
                    className={`font-semibold ${preferences.soundEnabled ? 'text-green-600' : 'text-gray-400'}`}
                >
                    {preferences.soundEnabled ? 'ON' : 'OFF'}
                </button>
            </div>

            {notifications.length > 0 && (
                <div className="text-xs text-gray-500 mb-2 bg-white/80 px-2 py-1 rounded">
                    Showing {notifications.length} of 3 notifications
                </div>
            )}

            {notifications.map(notification => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}
        </div>
    );
};
