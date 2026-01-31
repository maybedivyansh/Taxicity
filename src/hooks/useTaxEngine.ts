import { useState, useCallback } from 'react';
import { TaxInput, TaxCalculationResult } from '../types/engine';
import { useErrorHandler } from './useErrorHandler';

export const useTaxEngine = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<TaxCalculationResult | null>(null);
    const { handleError } = useErrorHandler();

    const calculateTax = useCallback(async (input: TaxInput) => {
        setLoading(true);
        try {
            const res = await fetch('/api/engine/calculate-regime', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input)
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || 'Calculation Failed');
            }

            setResult(data.data);
        } catch (err) {
            handleError(err, 'tax-calculation');
        } finally {
            setLoading(false);
        }
    }, [handleError]);

    return {
        calculateTax,
        result,
        loading
    };
};
