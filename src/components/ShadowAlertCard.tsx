import type { ShadowGap } from '@/types'

interface Props {
    action: ShadowGap
}

export default function ShadowActionCard({ action }: Props) {
    const effortColor = action.effort === 'Easy' ? 'bg-green-500' : action.effort === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'

    return (
        <div className="glass-effect glass-hover p-4 border border-purple-500/30">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="font-bold text-white">{action.action}</h3>
                    <p className="text-green-400 font-bold text-lg mt-2">Save ₹{(action.potentialSavings / 1000).toFixed(0)}K</p>
                    <p className="text-gray-400 text-sm mt-2">Priority: {action.priority}/3</p>
                </div>
                <span className={`${effortColor} text-white px-3 py-1 rounded text-sm`}>{action.effort}</span>
            </div>
        </div>
    )
}
