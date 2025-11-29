'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-paper flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <h2 className="text-3xl font-serif font-bold text-navy-900 mb-4">Something went wrong</h2>
                <p className="text-gray-600 mb-8 font-sans">
                    We encountered an unexpected error. Please try again later.
                </p>
                <button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-navy-900 hover:bg-navy-800 transition-colors duration-200"
                >
                    Try again
                </button>
            </div>
        </div>
    )
}
