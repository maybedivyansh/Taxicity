interface Props {
    effectiveRate: number
}

export default function TaxTemperatureGauge({ effectiveRate }: Props) {
    const getColor = () => {
        if (effectiveRate > 20) return '#DC2626'
        if (effectiveRate > 15) return '#F97316'
        if (effectiveRate > 12) return '#EAB308'
        if (effectiveRate > 8) return '#0EA5E9'
        return '#00D9FF'
    }

    const getStatus = () => {
        if (effectiveRate > 20) return 'HOT'
        if (effectiveRate > 15) return 'WARM'
        if (effectiveRate > 12) return 'MODERATE'
        if (effectiveRate > 8) return 'COOL'
        return 'ICY'
    }

    return (
        <div className="glass-effect p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Tax Temperature</h2>
            <div className="w-full max-w-md mx-auto">
                <svg viewBox="0 0 200 200" className="w-full h-auto">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                    <circle cx="100" cy="100" r="70" fill="none" stroke={getColor()} strokeWidth="3" opacity="0.5" />

                    {/* Needle */}
                    <line
                        x1="100"
                        y1="100"
                        x2={100 + 60 * Math.sin((effectiveRate / 40) * Math.PI)}
                        y2={100 - 60 * Math.cos((effectiveRate / 40) * Math.PI)}
                        stroke={getColor()}
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{ transition: 'all 1s ease-out' }}
                    />
                    <circle cx="100" cy="100" r="5" fill={getColor()} />

                    {/* Labels */}
                    <text x="100" y="180" textAnchor="middle" fill="white" fontSize="12">
                        {effectiveRate.toFixed(1)}%
                    </text>
                </svg>
            </div>
            <p className="text-lg font-semibold mt-4" style={{ color: getColor() }}>
                Status: {getStatus()}
            </p>
            <p className="text-gray-400 text-sm mt-2">
                For every ₹100 earned, you pay ₹{effectiveRate.toFixed(2)} in tax
            </p>
        </div>
    )
}
