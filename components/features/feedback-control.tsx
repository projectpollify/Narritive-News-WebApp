'use client'

import { useState, useEffect } from 'react'

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

    // Handle vote
    const handleVote = async (type: 'up' | 'down') => {
        if (isVoting || userVote) return // Prevent multiple votes or changing vote for now (simple implementation)

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
            // Note: We'll implement the API endpoint next
            /*
            await fetch(`/api/articles/${articleId}/vote`, {
              method: 'POST',
              body: JSON.stringify({ type })
            })
            */

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500))

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
        <div className={`flex items-center space-x-6 ${className}`}>
            {variant === 'full' && (
                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Was this analysis helpful?
                </span>
            )}

            <div className="flex items-center space-x-4">
                {/* Upvote Button */}
                <button
                    onClick={() => handleVote('up')}
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
                    onClick={() => handleVote('down')}
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
    )
}
