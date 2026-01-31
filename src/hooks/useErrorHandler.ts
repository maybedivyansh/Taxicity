import { useState, useCallback } from 'react';
import { errorHandlingService } from '../services/errorHandlingService';

export const useErrorHandler = () => {
    const [error, setError] = useState<Error | null>(null);
    const [ticketId, setTicketId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showErrorUI, setShowErrorUI] = useState(false);

    const handleError = useCallback(async (error: unknown, contextAction: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
        const err = error instanceof Error ? error : new Error(String(error));
        setError(err);
        setIsLoading(true);
        setShowErrorUI(true);

        try {
            const result = await errorHandlingService.logError({
                errorCode: err.name || 'RUNTIME_ERROR',
                errorMessage: err.message,
                stack: err.stack,
                severity,
                context: {
                    action: contextAction,
                    timestamp: Date.now()
                } as any
            });

            if (result && result.ticketId) {
                setTicketId(result.ticketId);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
        setTicketId(null);
        setShowErrorUI(false);
    }, []);

    return {
        error,
        ticketId,
        isLoading,
        handleError,
        clearError,
        showErrorUI
    };
};
