import { useState, useEffect, useCallback, useRef } from 'react';
import {
    SmartAlert,
    Nudge,
    DeprecationTracker,
    ContextualOpportunity,
} from '@/types/intelligence';
import { playAlertSound, playOpportunitySound } from '../styles/sounds';

interface UseIntelligenceOptions {
    transactions?: any[];
    grossIncome?: number;
    employmentType?: 'SALARIED' | 'FREELANCER' | 'BUSINESS';
    spendingPattern?: {
        category: string;
        monthlyAverage: number;
        claimed: boolean;
    }[];
    enableNudges?: boolean;
}

interface UseIntelligenceReturn {
    smartAlerts: SmartAlert[];
    nudgesStream: Nudge[];
    deprecationAssets: DeprecationTracker[];
    opportunities: ContextualOpportunity[];
    isProcessing: boolean;
    error: Error | null;
    refreshAlerts: () => Promise<void>;
    addAssetForDepreciation: (asset: {
        assetName: string;
        purchaseDate: string;
        cost: number;
        assetType: string;
    }) => Promise<void>;
}

/**
 * Custom React hook for real-time intelligence
 * 
 * Usage:
 * ```tsx
 * const {
 *   smartAlerts,
 *   nudgesStream,
 *   opportunities,
 *   isProcessing,
 *   error
 * } = useIntelligence({
 *   transactions,
 *   grossIncome: 1200000,
 *   employmentType: 'FREELANCER',
 *   enableNudges: true
 * });
 * ```
 */
export function useIntelligence(options: UseIntelligenceOptions = {}): UseIntelligenceReturn {
    const {
        transactions = [],
        grossIncome = 0,
        employmentType = 'SALARIED',
        spendingPattern = [],
        enableNudges = false,
    } = options;

    const [smartAlerts, setSmartAlerts] = useState<SmartAlert[]>([]);
    const [nudgesStream, setNudgesStream] = useState<Nudge[]>([]);
    const [deprecationAssets, setDeprecationAssets] = useState<DeprecationTracker[]>([]);
    const [opportunities, setOpportunities] = useState<ContextualOpportunity[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const eventSourceRef = useRef<EventSource | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    /**
     * Fetch smart alerts based on current transactions
     */
    const fetchSmartAlerts = useCallback(async () => {
        if (transactions.length === 0 || grossIncome === 0) return;

        try {
            setIsProcessing(true);
            setError(null);

            const response = await fetch('/api/intelligence/smart-alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactions,
                    grossIncome,
                    employmentType,
                    currentDate: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch smart alerts: ${response.statusText}`);
            }

            const alerts = await response.json();
            setSmartAlerts(alerts);
            if (alerts.length > 0) {
                playAlertSound();
            }
        } catch (err) {
            setError(err as Error);
            console.error('Error fetching smart alerts:', err);
        } finally {
            setIsProcessing(false);
        }
    }, [transactions, grossIncome, employmentType]);

    /**
     * Fetch contextual opportunities
     */
    const fetchOpportunities = useCallback(async () => {
        if (grossIncome === 0) return;

        try {
            const response = await fetch('/api/intelligence/contextual-opportunities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentDate: new Date().toISOString(),
                    grossIncome,
                    employmentType,
                    spendingPattern,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch opportunities: ${response.statusText}`);
            }

            const opps = await response.json();
            setOpportunities(opps);
        } catch (err) {
            console.error('Error fetching opportunities:', err);
        }
    }, [grossIncome, employmentType, spendingPattern]);

    /**
     * Subscribe to real-time nudges via SSE
     */
    const subscribeToNudges = useCallback(() => {
        if (!enableNudges || transactions.length === 0) return;

        // Close existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        try {
            const params = new URLSearchParams({
                transactions: JSON.stringify(transactions),
                grossIncome: grossIncome.toString(),
            });

            const eventSource = new EventSource(
                `/api/intelligence/proactive-nudges?${params.toString()}`
            );

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'connected') {
                        console.log('Connected to nudges stream');
                    } else if (data.type === 'completed') {
                        console.log('Nudges stream completed');
                        eventSource.close();
                    } else if (data.type === 'error') {
                        console.error('Nudges stream error:', data.message);
                        setError(new Error(data.message));
                    } else {
                        // Regular nudge
                        setNudgesStream((prev) => [...prev, data as Nudge]);
                        // Play sound for nudge
                        playOpportunitySound();
                    }
                } catch (err) {
                    console.error('Error parsing nudge:', err);
                }
            };

            eventSource.onerror = (err) => {
                console.error('EventSource error:', err);
                eventSource.close();
            };

            eventSourceRef.current = eventSource;
        } catch (err) {
            console.error('Error subscribing to nudges:', err);
        }
    }, [enableNudges, transactions, grossIncome]);

    /**
     * Add asset for depreciation tracking
     */
    const addAssetForDepreciation = useCallback(async (asset: {
        assetName: string;
        purchaseDate: string;
        cost: number;
        assetType: string;
    }) => {
        try {
            setIsProcessing(true);

            const response = await fetch('/api/intelligence/depreciation-tracker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(asset),
            });

            if (!response.ok) {
                throw new Error(`Failed to track depreciation: ${response.statusText}`);
            }

            const tracker = await response.json();
            setDeprecationAssets((prev) => [...prev, tracker]);
        } catch (err) {
            setError(err as Error);
            console.error('Error tracking depreciation:', err);
        } finally {
            setIsProcessing(false);
        }
    }, []);

    /**
     * Refresh all alerts
     */
    const refreshAlerts = useCallback(async () => {
        await Promise.all([fetchSmartAlerts(), fetchOpportunities()]);
    }, [fetchSmartAlerts, fetchOpportunities]);

    // Effect: Fetch smart alerts when transactions change
    useEffect(() => {
        fetchSmartAlerts();
    }, [fetchSmartAlerts]);

    // Effect: Fetch opportunities when income/spending changes
    useEffect(() => {
        fetchOpportunities();
    }, [fetchOpportunities]);

    // Effect: Subscribe to nudges stream
    useEffect(() => {
        subscribeToNudges();

        // Cleanup: Close SSE connection on unmount
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, [subscribeToNudges]);

    // Effect: Cleanup abort controller on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        smartAlerts,
        nudgesStream,
        deprecationAssets,
        opportunities,
        isProcessing,
        error,
        refreshAlerts,
        addAssetForDepreciation,
    };
}
