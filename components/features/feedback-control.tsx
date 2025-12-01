'use client'

import { useState, useEffect } from 'react'
import { AIWatchdog } from './ai-watchdog'

interface FeedbackControlProps {
    articleId: string
    initialUpvotes: number
    initialDownvotes: number
    className?: string
    variant?: 'minimal' | 'full'
}

export function FeedbackControl({
    articleId,
    initialUpvotes,
    initialDownvotes,
    className = '',
    variant = 'full'
}: FeedbackControlProps) {
    // State for vote counts
    const [counts, setCounts] = useState({
        up: initialUpvotes,
        down: initialDownvotes
    })

    // State for user's vote (null, 'up', or 'down')
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
    const [isVoting, setIsVoting] = useState(false)

    // Verification State
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'scanning' | 'verified'>('idle')
    const [pendingVote, setPendingVote] = useState<'up' | 'down' | null>(null)

    // Load user's vote from localStorage on mount and listen for changes
    useEffect(() => {
        const loadVote = () => {
            const storedVote = localStorage.getItem(`vote_${articleId}`)
            if (storedVote === 'up' || storedVote === 'down') {
                setUserVote(storedVote)
            } else {
                setUserVote(null) // Clear vote if it's no longer in storage or invalid
            }
        }

        loadVote()

        // Listen for storage events (cross-tab) and custom events (same-page)
        const handleStorageChange = (e: StorageEvent | CustomEvent) => {
            if (e instanceof StorageEvent && e.key === `vote_${articleId}`) {
                loadVote()
            } else if (e instanceof CustomEvent && e.detail.key === `vote_${articleId}`) {
                loadVote()
            }
        }

        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('local-storage-change', handleStorageChange as EventListener)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('local-storage-change', handleStorageChange as EventListener)
        }
    }, [articleId])

    // Handle vote click - Starts Verification
    const initiateVote = (type: 'up' | 'down') => {
        if (isVoting || userVote) return

        setPendingVote(type)
        setVerificationStatus('scanning')

        // Simulate AI Watchdog Scan
        setTimeout(() => {
            setVerificationStatus('verified')

            // Complete the vote after verification
            setTimeout(() => {
                confirmVote(type)
                setVerificationStatus('idle')
                setPendingVote(null)
            }, 1000)
        }, 2000)
    }

    // Actual Vote Logic (after verification)
    const confirmVote = async (type: 'up' | 'down') => {
        setIsVoting(true)

        // Optimistic update
        setCounts(prev => ({
            ...prev,
            [type]: prev[type] + 1
        }))
        setUserVote(type)
        localStorage.setItem(`vote_${articleId}`, type)
        window.dispatchEvent(new CustomEvent('local-storage-change', {
            detail: { key: `vote_${articleId}`, newValue: type }
        }))

        try {
            // Call API to persist vote
            const response = await fetch(`/api/articles/${articleId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type })
            })

            if (!response.ok) {
                throw new Error('Failed to submit vote')
            }

            // We could update counts from response here if we wanted server-side authority
            // const data = await response.json()

        } catch (error) {
            // Revert on error
            setCounts(prev => ({
                ...prev,
                [type]: prev[type] - 1
            }))
            setUserVote(null)
            localStorage.removeItem(`vote_${articleId}`)
            console.error('Failed to submit vote:', error)
        } finally {
            setIsVoting(false)
        }
    }

    return (
        <>
            {/* Verification Overlay */}
            {verificationStatus !== 'idle' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/90 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white p-8 rounded-sm shadow-2xl max-w-sm w-full mx-4 border border-gold-500/20">
                        <AIWatchdog status={verificationStatus} />
                        <p className="text-center text-gray-500 mt-6 text-sm font-mono">
                            {verificationStatus === 'scanning' ? 'Verifying humanity...' : 'Vote verified on-chain.'}
                        </p>
                    </div>
                </div>
            )}

            <div className={`flex items-center space-x-6 ${className}`}>
                {variant === 'full' && (
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                        Was this analysis helpful?
                    </span>
                )}

                <div className="flex items-center space-x-4">
                    {/* Upvote Button */}
                    <button
                        onClick={() => initiateVote('up')}
                        disabled={!!userVote || isVoting}
                        className={`flex items-center space-x-2 transition-all duration-200 ${userVote === 'up'
                            ? 'text-green-600'
                            : userVote === 'down'
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-400 hover:text-green-600'
                            }`}
                        aria-label="Thumbs up"
                    >
                        <svg className={`w-6 h-6 ${userVote === 'up' ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span className={`font-mono font-medium ${userVote === 'up' ? 'text-green-600' : 'text-gray-500'}`}>
                            {counts.up}
                        </span>
                    </button>

                    {/* Downvote Button */}
                    <button
                        onClick={() => initiateVote('down')}
                        disabled={!!userVote || isVoting}
                        className={`flex items-center space-x-2 transition-all duration-200 ${userVote === 'down'
                            ? 'text-red-600'
                            : userVote === 'up'
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-400 hover:text-red-600'
                            }`}
                        aria-label="Thumbs down"
                    >
                        <svg className={`w-6 h-6 ${userVote === 'down' ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                        </svg>
                        <span className={`font-mono font-medium ${userVote === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                            {counts.down}
                        </span>
                    </button>
                </div>
            </div>
        </>
    )
}
