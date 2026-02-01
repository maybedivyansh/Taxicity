import React, { useState, useEffect, useContext, createContext, ReactNode, Dispatch, SetStateAction } from 'react';

// Types
export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'alert' | 'warning' | 'info';
    timestamp: number;
    read: boolean;
}

export interface NotificationPreferences {
    soundEnabled: boolean;
    volume: number;
    emailAlerts: boolean;
    pushProactive: boolean;
    vibrationEnabled: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    preferences: NotificationPreferences;
    setPreferences: Dispatch<SetStateAction<NotificationPreferences>>;
    notify: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    removeNotification: (id: string) => void;
    requestPermission: () => Promise<boolean>;
    hasPermission: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
    soundEnabled: true,
    volume: 0.8,
    emailAlerts: true,
    pushProactive: true,
    vibrationEnabled: true
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('cai_notification_prefs');
        if (saved) {
            try {
                setPreferences(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse prefs', e);
            }
        }
        // Check browser permission
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            setHasPermission(true);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cai_notification_prefs', JSON.stringify(preferences));
    }, [preferences]);

    const notify = (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...n,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            read: false
        };
        setNotifications(prev => [newNotification, ...prev]);

        // Browser notification
        if (hasPermission && preferences.pushProactive) {
            new window.Notification(n.title, { body: n.message });
        }
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const requestPermission = async () => {
        if (typeof Notification === 'undefined') return false;
        const result = await Notification.requestPermission();
        const granted = result === 'granted';
        setHasPermission(granted);
        return granted;
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            preferences,
            setPreferences,
            notify,
            removeNotification,
            requestPermission,
            hasPermission
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
