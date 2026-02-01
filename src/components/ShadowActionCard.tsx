import React from 'react';
import { ShadowAction } from '@/types/ui';
import { ArrowRight, Sparkles } from 'lucide-react';

interface Props {
    action: ShadowAction;
    onDismiss?: (id: string) => void;
    onAction?: (id: string) => void;
    className?: string;
}

export const ShadowActionCard: React.FC<Props> = ({ action, onDismiss, onAction, className = '' }) => {
    // Priority Colors (Subtle borders/badges)
    const priorityColor = action.priority === 1 ? 'border-red-500/50' : action.priority === 2 ? 'border-orange-500/50' : 'border-yellow-500/50';

    return (
        <div className={`relative bg-card border border-border rounded-lg p-4 mb-3 hover:border-primary/30 transition-all shadow-sm ${className}`}>
            <div className="flex justify-between items-start">
                <div className="flex gap-4">
                    <div className="text-xl pt-1 min-w-[3rem] h-12 flex items-center justify-center rounded-lg bg-muted text-foreground">
                        {action.icon || '💡'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground text-base">{action.action}</h4>
                            {action.effort === 'Easy' && (
                                <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-2 py-0.5 rounded font-medium">
                                    Quick Win
                                </span>
                            )}
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">Section: {action.section}</p>
                        <p className="text-primary font-medium text-sm">
                            Potential Savings: <span className="text-lg font-bold">₹{action.potentialSavings.toLocaleString()}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => onAction?.(action.id)}
                        className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded-md flex items-center gap-1 transition-colors"
                    >
                        Act Now <ArrowRight size={12} />
                    </button>
                    <button
                        onClick={() => onDismiss?.(action.id)}
                        className="text-muted-foreground hover:text-foreground text-xs text-right transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};
