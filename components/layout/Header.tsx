'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAudio } from '@/lib/context/AudioContext'

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { isPlaying, togglePlay, currentEpisode } = useAudio()

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center group cursor-pointer">
                        <div className="w-10 h-10 bg-navy-900 text-white flex items-center justify-center rounded-sm mr-3 shadow-md group-hover:bg-navy-800 transition-colors">
                            <span className="font-serif font-bold text-xl">N</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-serif font-bold text-navy-900 leading-none tracking-tight group-hover:text-navy-700 transition-colors">
                                Narrative News
                            </h1>
                            <span className="text-xs text-gray-500 font-medium tracking-widest uppercase mt-1">
                                Two Perspectives, One Truth
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation & Audio Controls */}
                    <div className="hidden md:flex items-center space-x-8">
                        {/* Audio Controls - Only visible if an episode is loaded */}
                        {currentEpisode && (
                            <div className="flex items-center bg-gray-100 rounded-full px-4 py-1.5 border border-gray-200 mr-4 animate-fade-in">
                                <button
                                    onClick={togglePlay}
                                    className="w-8 h-8 flex items-center justify-center bg-navy-900 text-white rounded-full hover:bg-gold-500 hover:text-navy-900 transition-colors mr-3"
                                >
                                    {isPlaying ? (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    )}
                                </button>
                                <div className="flex flex-col mr-2 max-w-[150px]">
                                    <span className="text-[10px] font-bold text-gold-600 uppercase tracking-wider">Now Playing</span>
                                    <span className="text-xs font-medium text-navy-900 truncate">{currentEpisode.title}</span>
                                </div>
                            </div>
                        )}

                        <Link href="/" className="text-gray-600 hover:text-navy-900 font-medium transition-colors">Home</Link>
                        <Link href="/podcast" className="text-gray-600 hover:text-navy-900 font-medium transition-colors">Podcast</Link>
                        <a href="#" className="text-gray-600 hover:text-navy-900 font-medium transition-colors">Manifesto</a>
                        <a href="#" className="text-gray-600 hover:text-navy-900 font-medium transition-colors">Technology</a>
                        <Link href="/signup" className="px-5 py-2.5 bg-navy-900 text-white font-bold rounded-sm hover:bg-navy-800 transition-all shadow-sm hover:shadow-md text-sm tracking-wide">
                            Join
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        {/* Mobile Audio Toggle (Mini) */}
                        {currentEpisode && (
                            <button
                                onClick={togglePlay}
                                className="mr-4 w-8 h-8 flex items-center justify-center bg-navy-900 text-white rounded-full"
                            >
                                {isPlaying ? (
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                                ) : (
                                    <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                )}
                            </button>
                        )}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-700 hover:text-navy-900 p-2"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 bg-white absolute left-0 right-0 shadow-lg px-4">
                        <div className="flex flex-col space-y-4">
                            <Link href="/" className="text-gray-600 hover:text-navy-900 font-medium">Home</Link>
                            <Link href="/podcast" className="text-gray-600 hover:text-navy-900 font-medium">Podcast</Link>
                            <a href="#" className="text-gray-600 hover:text-navy-900 font-medium">Manifesto</a>
                            <a href="#" className="text-gray-600 hover:text-navy-900 font-medium">Technology</a>
                            <Link href="/signup" className="text-center px-5 py-2.5 bg-navy-900 text-white font-bold rounded-sm">
                                Join
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    )
}
