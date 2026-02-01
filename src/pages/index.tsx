import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Dashboard from '@/components/Dashboard'
import LandingPage from '@/components/LandingPage'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'

export default function Home() {
    const { session, loading } = useAuth()
    const router = useRouter()

    // No forced redirect here. Just render based on state.

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        )
    }

    return (
        <>
            <Head>
                <title>Taxicity - Tax Optimization Dashboard</title>
                <meta name="description" content="AI-powered tax optimization for Indian freelancers" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            {/* If logged in -> Dashboard, else -> Landing Page */}
            {session ? <Dashboard /> : <LandingPage />}
        </>
    )
}
