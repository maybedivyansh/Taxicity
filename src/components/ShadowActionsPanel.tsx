import React from 'react';
import { ShadowAction } from '@/types/ui';
import { ShadowActionCard } from './ShadowActionCard';
import { BellRing } from 'lucide-react';

interface Props {
    actions: ShadowAction[];
    onDismiss: (actionId: string) => void; // Added for new props
    onAction: (actionId: string) => void;   // Added for new props
}

export const ShadowActionsPanel: React.FC<Props> = ({ actions, onDismiss, onAction }) => {
    const sortedActions = [...actions].sort((a, b) => a.priority - b.priority);

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 pl-1">
                <div>
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        Action Plan
                    </h2>
                </div>
                <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-medium rounded-full border border-border">{sortedActions.length} PENDING</span>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {sortedActions.length > 0 ? (
                    sortedActions.map(action => (
                        <ShadowActionCard
                            key={action.id}
                            action={action}
                            onDismiss={onDismiss}
                            onAction={onAction}
                            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                        />
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <p>No actions found - you are fully optimized! 🎉</p>
                    </div>
                )}
            </div>
        </div>
    );
};
