'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AIWatchdog } from '@/components/features/ai-watchdog'

export default function SignupPage() {
    const [step, setStep] = useState<'intro' | 'scanning' | 'verified' | 'form'>('intro')

    const startVerification = () => {
        setStep('scanning')
        // Simulate scanning process
        setTimeout(() => {
            setStep('verified')
            // Auto-advance to form after verification
            setTimeout(() => {
                setStep('form')
            }, 1500)
        }, 3000)
    }

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault()

        // Mock User Database Logic
        const newUser = {
            id: 'user_' + Date.now(),
            email,
            name: email.split('@')[0], // Derive a name from email
            joinedAt: new Date().toISOString(),
            isVerified: true // They passed the AI Watchdog
        }

        // Save to localStorage (Mock DB)
        localStorage.setItem('currentUser', JSON.stringify(newUser))

        // Optional: Store in a list of users if we wanted a "database"
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')
        existingUsers.push(newUser)
        localStorage.setItem('users', JSON.stringify(existingUsers))

        // Redirect to home
        router.push('/')
    }

    return (
        <div className="min-h-screen bg-paper flex flex-col">
            {/* Simple Header */}
            <header className="p-6 flex justify-between items-center">
                <Link href="/" className="flex items-center group">
                    <div className="w-8 h-8 bg-navy-900 text-white flex items-center justify-center rounded-sm mr-3 shadow-md">
                        <span className="font-serif font-bold text-lg">N</span>
                    </div>
                    <span className="font-serif font-bold text-navy-900 text-lg">Narrative News</span>
                </Link>
            </header>

            <main className="flex-grow flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-sm shadow-card border border-gray-100 overflow-hidden relative">

                    {/* Progress Bar */}
                    <div className="h-1 bg-gray-100 w-full">
                        <div
                            className="h-full bg-navy-900 transition-all duration-500 ease-out"
                            style={{
                                width: step === 'intro' ? '25%' :
                                    step === 'scanning' ? '50%' :
                                        step === 'verified' ? '75%' : '100%'
                            }}
                        ></div>
                    </div>

                    <div className="p-8 md:p-12">
                        {step === 'intro' && (
                            <div className="text-center space-y-8">
                                <h1 className="font-serif font-bold text-3xl text-navy-900">
                                    Join the Truth.
                                </h1>
                                <p className="text-gray-600 leading-relaxed">
                                    We are building a community of real humans, not bots. To create an account, you must first prove your humanity.
                                </p>

                                <button
                                    onClick={startVerification}
                                    className="w-full bg-navy-900 text-white font-bold py-4 px-6 rounded-sm hover:bg-navy-800 transition-all transform hover:scale-[1.02] shadow-lg uppercase tracking-wider text-sm"
                                >
                                    Verify Humanity
                                </button>

                                <p className="text-xs text-gray-400">
                                    Powered by AI Watchdog™ Security
                                </p>
                            </div>
                        )}

                        {(step === 'scanning' || step === 'verified') && (
                            <div className="py-8">
                                <AIWatchdog status={step} />
                            </div>
                        )}

                        {step === 'form' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h2 className="font-serif font-bold text-2xl text-navy-900">
                                        Humanity Verified
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Welcome, human. Complete your profile.
                                    </p>
                                </div>

                                <form className="space-y-4" onSubmit={handleSignup}>
                                    <div>
                                        <label className="block text-xs font-bold text-navy-900 uppercase tracking-wide mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-navy-900 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                            placeholder="you@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-navy-900 uppercase tracking-wide mb-2">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-navy-900 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <button type="submit" className="w-full bg-gold-500 text-navy-900 font-bold py-4 px-6 rounded-sm hover:bg-gold-400 transition-all shadow-md uppercase tracking-wider text-sm mt-4">
                                        Create Account
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
