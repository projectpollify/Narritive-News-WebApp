import React from 'react'

export const ArweaveTooltip = () => {
    return (
        <span className="inline-flex items-center group relative cursor-help">
            <span className="border-b border-dotted border-gray-400 hover:border-navy-900 transition-colors">Arweave</span>
            <span className="ml-1 text-gray-400 hover:text-navy-900 transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-4 bg-navy-900 text-white text-xs rounded-sm shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-left">
                <div className="font-bold text-gold-500 mb-1 uppercase tracking-wider">About Arweave</div>
                <p className="leading-relaxed text-gray-300">
                    Arweave is a decentralized storage network that enables the permanent, immutable storage of data. It ensures that history cannot be rewritten or censored.
                </p>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-navy-900"></div>
            </div>
        </span>
    )
}
