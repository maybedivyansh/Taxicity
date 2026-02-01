import React from 'react'
import { motion } from 'framer-motion'

interface DeductionMeterProps {
    label: string
    current: number
    max: number
    color?: string
}

export default function DeductionMeter({ label, current, max, color = 'bg-blue-500' }: DeductionMeterProps) {
    const percentage = Math.min((current / max) * 100, 100)

    // Format large numbers (e.g. 150000 -> 1.5L)
    const formatAmount = (amt: number) => {
        if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`
        if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}k`
        return `₹${amt}`
    }

    return (
        <div className="mb-4 last:mb-0">
            <div className="flex justify-between items-end mb-1">
                <span className="text-sm text-gray-300 font-medium">{label}</span>
                <span className="text-xs text-gray-400 font-mono">
                    {formatAmount(current)} / {formatAmount(max)}
                </span>
            </div>

            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${color} rounded-full relative`}
                >
                    {/* Glossy effect overlay */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30" />
                </motion.div>
            </div>
        </div>
    )
}
