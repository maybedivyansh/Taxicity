import { ErrorContext } from '../types/errors';

class ErrorHandlingService {
    async logError(data: {
        errorCode?: string;
        errorMessage: string;
        stack?: string;
        context: ErrorContext;
        severity: 'low' | 'medium' | 'high' | 'critical';
    }) {
        // 1. Console log for development
        if (process.env.NODE_ENV !== 'production') {
            console.error('[ErrorService]', data);
        }

        try {
            // 2. Send to backend
            const response = await fetch('/api/errors/log-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    errorCode: data.errorCode || 'UNKNOWN_ERROR',
                    errorMessage: data.errorMessage,
                    stack: data.stack,
                    context: {
                        ...data.context,
                        browserInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
                        url: typeof window !== 'undefined' ? window.location.href : '',
                    },
                    severity: data.severity,
                    userEmail: 'user@example.com' // In real app, get from auth context
                })
            });

            return await response.json();
        } catch (loggingError) {
            // Fallback if logging fails
            console.error('Failed to log error to server:', loggingError);
            return { success: false };
        }
    }

    async createSupportTicket(errorId: string, description: string) {
        // This logic is currently handled automatically by the backend for high severity errors
        // But we can expose a manual trigger if needed
        return null;
    }
}

export const errorHandlingService = new ErrorHandlingService();
