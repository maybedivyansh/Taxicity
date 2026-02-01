import React from 'react'

interface ScoreCardProps {
    title: string
    value: string
    subValue?: string
    isWinner?: boolean
    trend?: 'up' | 'down' | 'neutral'
    color?: 'blue' | 'green' | 'red' | 'default'
}

export default function ScoreCard({ title, value, subValue, isWinner, trend, color = 'default' }: ScoreCardProps) {
    const getColorClasses = () => {
        switch (color) {
            case 'green': return 'text-green-400'
            case 'red': return 'text-red-400'
            case 'blue': return 'text-blue-400'
            default: return 'text-white'
        }
    }

    return (
        <div className={`glass-effect p-6 rounded-2xl flex flex-col justify-between h-full relative overflow-hidden ${isWinner ? 'border-2 border-green-500/50' : ''}`}>
            {isWinner && (
                <div className="absolute top-0 right-0 bg-green-500 text-xs font-bold px-2 py-1 rounded-bl-lg text-black">
                    WINNER
                </div>
            )}

            <h3 className="text-gray-400 text-sm font-medium tracking-wide flex items-center gap-2">
                {title}
            </h3>

            <div className="mt-4">
                <div className={`text-3xl font-bold ${getColorClasses()}`}>
                    {value}
                </div>
                {subValue && (
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                        {subValue}
                    </p>
                )}
            </div>
        </div>
    )
}
