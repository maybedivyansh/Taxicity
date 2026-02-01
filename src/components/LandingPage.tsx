import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, PieChart, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0B0F19] text-white selection:bg-blue-500/30">
            {/* Navbar */}
            <nav className="border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Taxicity" className="w-8 h-8 object-contain" />
                        <span className="font-bold text-lg tracking-tight">Taxicity</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/auth/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                            Sign In
                        </Link>
                        <Link href="/auth/login">
                            <Button className="bg-white text-black hover:bg-slate-200 rounded-full px-6">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -z-10" />

                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-300 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        AI-Powered Tax Optimization for Freelancers
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent">
                        Stop Overpaying Taxes on <br /> Your Freelance Income.
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Upload your bank statement. finding hidden deductions. Switch regimes with confidence.
                        <br className="hidden md:block" />
                        We analyze every transaction to save you money.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/auth/login" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 rounded-full">
                                Start Saving Now <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="#how-it-works" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto h-12 px-8 text-base border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full">
                                How it Works
                            </Button>
                        </Link>
                    </div>

                    {/* Stats / Social Proof */}
                    <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-70">
                        <div>
                            <div className="text-2xl font-bold text-white">₹2.5L+</div>
                            <div className="text-xs text-slate-500 uppercase tracking-widest">Avg Savings</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">100%</div>
                            <div className="text-xs text-slate-500 uppercase tracking-widest">Automated</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">Zero</div>
                            <div className="text-xs text-slate-500 uppercase tracking-widest">Data Leaks</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">24/7</div>
                            <div className="text-xs text-slate-500 uppercase tracking-widest">AI Analysis</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid (Bento) */}
            <section className="py-24 px-6 bg-black/20" id="features">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Everything you need to optimize taxes</h2>
                        <p className="text-slate-400">Built specifically for the chaos of freelance finances.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-900/50 p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-colors group">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Smart Statement Analysis</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Drag and drop your generic bank PDF. Our AI engine parses generic descriptions like "UPI-MCDONALDS" or "NETFLIX" into tax-relevant categories like <em>Food Expenses</em> or <em>Business Subscriptions</em>.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-colors group">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Instant Regime Check</h3>
                            <p className="text-slate-400 leading-relaxed">
                                See exactly how much you'd pay under Old vs New Tax Regime based on your <strong>real spending habits</strong>.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 hover:border-green-500/30 transition-colors group">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-6 text-green-400 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Deduction Auto-Detect</h3>
                            <p className="text-slate-400 leading-relaxed">
                                We automatically find 80C (LIC, SIP, PPF) and 80D (Health Insurance) entries so you don't have to manually enter them.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-900/50 p-8 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-colors group">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 text-orange-400 group-hover:scale-110 transition-transform">
                                <PieChart className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Interactive Spending Breakdown</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Visualize where your money goes. Isolate business expenses from personal ones with a single click to maximize your Section 37 claims.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-24 px-6 relative" id="how-it-works">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full -z-10" />

                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">From Chaos to Clarity in 3 Steps</h2>
                    </div>

                    <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">

                        {/* Step 1 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#0B0F19] text-slate-500 group-[.is-active]:text-blue-500 group-[.is-active]:border-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                                <span className="font-bold">1</span>
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 p-6 rounded-xl border border-white/10 shadow-sm">
                                <div className="font-bold text-white mb-1">Upload Bank Statement</div>
                                <div className="text-slate-400 text-sm">Simply export your generic PDF or CSV from your bank and drop it into the secure upload zone.</div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#0B0F19] text-slate-500 group-[.is-active]:text-purple-500 group-[.is-active]:border-purple-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                                <span className="font-bold">2</span>
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 p-6 rounded-xl border border-white/10 shadow-sm">
                                <div className="font-bold text-white mb-1">AI Analyzes Everything</div>
                                <div className="text-slate-400 text-sm">Our Gemini-powered engine classifies thousands of lines in seconds, separating personal spend from business expenses.</div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#0B0F19] text-slate-500 group-[.is-active]:text-green-500 group-[.is-active]:border-green-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                                <span className="font-bold">3</span>
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 p-6 rounded-xl border border-white/10 shadow-sm">
                                <div className="font-bold text-white mb-1">Get Your Shadow Report</div>
                                <div className="text-slate-400 text-sm">See your "Shadow Savings"—the difference between what you are paying and what you COULD be paying.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center bg-gradient-to-b from-blue-900/20 to-slate-900/40 p-12 rounded-3xl border border-white/10">
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to see your savings?</h2>
                    <p className="text-slate-400 mb-8 max-w-xl mx-auto">Join smart freelancers who are taking control of their taxes. No credit card required.</p>
                    <Link href="/auth/login">
                        <Button className="h-12 px-8 text-base bg-white text-black hover:bg-slate-200 rounded-full">
                            Get Started Now
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-white/5 text-center text-slate-600 text-sm">
                <p>© 2025 Taxicity. All rights reserved.</p>
            </footer>
        </div>
    )
}
