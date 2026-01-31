import { NotificationEvent } from '../types/notifications';
import { playSuccessSound, playAlertSound, playWarningSound } from '../styles/sounds';

class NotificationService {
    private queue: NotificationEvent[] = [];
    private listeners: ((queue: NotificationEvent[]) => void)[] = [];
    private maxQueueSize = 3;

    constructor() {
        this.requestPermission();
    }

    requestPermission() {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }

    playSound(type: 'success' | 'alert' | 'warning' | 'info') {
        switch (type) {
            case 'success':
                playSuccessSound();
                break;
            case 'alert':
                playAlertSound();
                break;
            case 'warning':
                playWarningSound();
                break;
            case 'info':
                // Optional: specific sound for info or fallback to success/alert
                break;
        }
    }

    vibrate(pattern: number[]) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    showNotification(event: NotificationEvent) {
        // 1. Browser Notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(event.title, {
                body: event.message,
                icon: '/icons/notification-icon.png', // Placeholder
                silent: true // We handle sound manually via Web Audio API
            });
        }

        // 2. Play sound if enabled (handled by caller or here)
        if (event.soundEnabled !== false) {
            this.playSound(event.type);
        }

        // 3. Vibrate mobile
        if (event.urgency === 'high') {
            this.vibrate([200, 100, 200]);
        }

        // 4. Queue for in-app display
        this.queueNotification(event);
    }

    queueNotification(event: NotificationEvent) {
        // Add to beginning, keep max 3
        this.queue = [event, ...this.queue].slice(0, this.maxQueueSize);
        this.notifyListeners();

        // Auto-dismiss from queue logic could be here, or handled by UI component. 
        // Usually UI handles visual dismissal, but service manages data.
        // For simplicity, we'll let the UI handle the auto-dismiss timer on mount.
    }

    removeNotification(id: string) {
        this.queue = this.queue.filter(n => n.id !== id);
        this.notifyListeners();
    }

    subscribe(listener: (queue: NotificationEvent[]) => void) {
        this.listeners.push(listener);
        // Initial call
        listener(this.queue);

        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(l => l(this.queue));
    }
}

export const notificationService = new NotificationService();
