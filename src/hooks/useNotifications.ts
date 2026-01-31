import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { NotificationEvent, NotificationPreference } from '../types/notifications';
import { notificationService } from '../services/notificationService';

interface NotificationContextProps {
    notifications: NotificationEvent[];
    notify: (event: Omit<NotificationEvent, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    preferences: NotificationPreference;
    setPreferences: (pref: NotificationPreference) => void;
    hasPermission: boolean;
    requestPermission: () => void;
}

// Default values
const defaultPreferences: NotificationPreference = {
    soundEnabled: true,
    pushEnabled: false,
    vibrationEnabled: true,
    volume: 1.0,
};

// Creating a simple internal store for the hook or context use
// For this deliverable, if we don't have a top-level provider in _app, 
// we can make this hook subscribe to the singleton service directly. 
// However, the prompt asks for Context. We'll define the Context here and export a Provider 
// if the user wants to wrap their app, or make the hook semi-independent.
// Given strict instructions to use "useContext: Get notification context", 
// I will assume a Provider is correctly wrapping the app. 
// I will export the Context and Provider here.

export const NotificationContext = createContext<NotificationContextProps>({
    notifications: [],
    notify: () => { },
    removeNotification: () => { },
    preferences: defaultPreferences,
    setPreferences: () => { },
    hasPermission: false,
    requestPermission: () => { },
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
    const [preferences, setPreferences] = useState<NotificationPreference>(defaultPreferences);
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        // Load preferences from localStorage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('notificationPreferences');
            if (saved) {
                try {
                    setPreferences(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse preferences", e);
                }
            }

            setHasPermission(Notification.permission === 'granted');
        }

        // Subscribe to service
        const unsubscribe = notificationService.subscribe((queue) => {
            setNotifications([...queue]);
        });

        return () => unsubscribe();
    }, []);

    const notify = useCallback((event: Omit<NotificationEvent, 'id' | 'timestamp'>) => {
        const fullEvent: NotificationEvent = {
            ...event,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            soundEnabled: event.soundEnabled ?? preferences.soundEnabled,
        };
        notificationService.showNotification(fullEvent);
    }, [preferences.soundEnabled]);

    const removeNotification = useCallback((id: string) => {
        notificationService.removeNotification(id);
    }, []);

    const updatePreferences = useCallback((newPref: NotificationPreference) => {
        setPreferences(newPref);
        if (typeof window !== 'undefined') {
            localStorage.setItem('notificationPreferences', JSON.stringify(newPref));
        }
    }, []);

    const requestPermission = useCallback(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            Notification.requestPermission().then(perm => {
                setHasPermission(perm === 'granted');
                notificationService.requestPermission();
            });
        }
    }, []);

    return (
        <NotificationContext.Provider value= {{
        notifications,
            notify,
            removeNotification,
            preferences,
            setPreferences: updatePreferences,
                hasPermission,
                requestPermission
    }
}>
    { children }
    </NotificationContext.Provider>
  );
};
