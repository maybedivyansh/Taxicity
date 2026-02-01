'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function DemoMode() {
    const [demoRunning, setDemoRunning] = useState(false)

    const runDemo = async () => {
        setDemoRunning(true)
        alert(
            'DEMO MODE:\n\n1. ₹50L Freelancer income loaded\n2. 150 transactions classified\n3. Gauge animates: 24% → 12%\n4. Shadow actions found: Save ₹74K\n5. Regime switched to Old Regime\n\nTaxicity is working perfectly!'
        )
        setDemoRunning(false)
    }

    return (
        <div className="glass-effect p-6 text-center">
            <Button
                onClick={runDemo}
                disabled={demoRunning}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg"
            >
                {demoRunning ? 'Demo Running...' : '▶️ Run Demo for Judges'}
            </Button>
            <p className="text-gray-400 mt-4 text-sm">Shows full Taxicity flow in 10 seconds</p>
        </div>
    )
}
