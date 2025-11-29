'use client'

import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-paper flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <h1 className="text-9xl font-serif font-bold text-navy-900 opacity-20">404</h1>
                <div className="relative -mt-16">
                    <h2 className="text-3xl font-serif font-bold text-navy-900 mb-4">Page Not Found</h2>
                    <p className="text-gray-600 mb-8 font-sans">
                        The story you're looking for seems to have been moved or doesn't exist.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-navy-900 hover:bg-navy-800 transition-colors duration-200"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
