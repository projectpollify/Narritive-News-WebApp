'use client'

import { useEffect, useState } from 'react'

interface AIWatchdogProps {
    status?: 'scanning' | 'verified' | 'idle'
    className?: string
}

export function AIWatchdog({ status = 'idle', className = '' }: AIWatchdogProps) {
    const [pulse, setPulse] = useState(false)

    useEffect(() => {
        if (status === 'scanning') {
            const interval = setInterval(() => {
                setPulse(prev => !prev)
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [status])

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Outer Ring - Radar */}
                <div className={`absolute inset-0 border-2 border-navy-900/20 rounded-full ${status === 'scanning' ? 'animate-ping-slow' : ''}`}></div>
                <div className={`absolute inset-2 border border-navy-900/10 rounded-full ${status === 'scanning' ? 'animate-spin-slow' : ''} border-t-navy-900`}></div>

                {/* Core - The Eye */}
                <div className={`relative z-10 w-16 h-16 bg-navy-900 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${status === 'verified' ? 'bg-green-600 scale-110' : ''}`}>
                    {status === 'verified' ? (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <div className="w-6 h-6 bg-white rounded-full relative overflow-hidden">
                            <div className={`absolute top-1/2 left-1/2 w-3 h-3 bg-navy-900 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${status === 'scanning' ? 'animate-scan-eye' : ''}`}></div>
                        </div>
                    )}
                </div>

                {/* Status Text Ring */}
                {status === 'scanning' && (
                    <div className="absolute -bottom-8 whitespace-nowrap">
                        <span className="text-xs font-mono text-navy-900 uppercase tracking-widest animate-pulse">
                            Scanning for Humanity...
                        </span>
                    </div>
                )}

                {status === 'verified' && (
                    <div className="absolute -bottom-8 whitespace-nowrap">
                        <span className="text-xs font-mono text-green-600 font-bold uppercase tracking-widest">
                            Humanity Verified
                        </span>
                    </div>
                )}
            </div>

            {/* Description */}
            <div className="mt-12 text-center max-w-xs">
                <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wide mb-2">
                    AI Watchdog Active
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                    Our system continuously monitors for bot activity and malicious patterns to ensure a human-first platform.
                </p>
            </div>
        </div>
    )
}
