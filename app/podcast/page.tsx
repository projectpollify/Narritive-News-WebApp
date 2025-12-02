'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

export default function PodcastPage() {
    const [currentEpisode, setCurrentEpisode] = useState<number | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement>(null)

    const episodes = [
        {
            id: 1,
            title: "Autopsy of the $300 Trillion Debt Lie",
            description: "A deep dive into the global debt crisis. We dissect the numbers and the narratives behind the $300 trillion figure that's shaping economic policy.",
            date: "Dec 1, 2025",
            duration: "33 min",
            image: "/images/podcast_hero.png",
            audioUrl: "/audio/episode-1.mp3"
        },
        {
            id: 2,
            title: "Defense Secretary Allegations: Deep Dive",
            description: "An in-depth look at the allegations against Defense Secretary Hegseth. We analyze the evidence and the media spin from both sides.",
            date: "Nov 28, 2025",
            duration: "52 min",
            image: "/images/podcast_hero.png",
            audioUrl: "/audio/episode-2.mp3"
        },
        {
            id: 3,
            title: "Tech Regulation: Innovation vs. Safety",
            description: "Silicon Valley is up in arms about new regulations. Are they necessary protections or government overreach?",
            date: "Nov 21, 2025",
            duration: "38 min",
            image: "/images/podcast_hero.png",
            audioUrl: "/audio/episode-3.mp3"
        }
    ]

    // Handle playback changes
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        if (currentEpisode && isPlaying) {
            setIsLoading(true)
            const playPromise = audio.play()

            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsLoading(false)
                        setError(null)
                    })
                    .catch(err => {
                        console.error("Playback failed:", err)
                        setIsPlaying(false)
                        setIsLoading(false)
                        setError("Playback failed. Please try again.")
                    })
            }
        } else {
            audio.pause()
        }
    }, [currentEpisode, isPlaying])

    const togglePlay = (episodeId: number) => {
        if (currentEpisode === episodeId) {
            setIsPlaying(!isPlaying)
        } else {
            setCurrentEpisode(episodeId)
            setIsPlaying(true)
        }
    }

    return (
        <div className="min-h-screen bg-paper pb-20">
            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src={currentEpisode ? episodes.find(e => e.id === currentEpisode)?.audioUrl : ''}
                onEnded={() => setIsPlaying(false)}
                onError={(e) => {
                    console.error("Audio error:", e)
                    setError("Error loading audio file.")
                    setIsLoading(false)
                    setIsPlaying(false)
                }}
                onCanPlay={() => setIsLoading(false)}
            />

            {/* Fixed Player Bar (Visible when playing or selected) */}
            {currentEpisode && (
                <div className="fixed bottom-0 left-0 right-0 bg-navy-900 text-white p-4 shadow-lg z-50 border-t border-gold-500">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="mr-4">
                                <button
                                    onClick={() => togglePlay(currentEpisode)}
                                    className="w-12 h-12 rounded-full bg-gold-500 text-navy-900 flex items-center justify-center hover:bg-white transition-colors"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : isPlaying ? (
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                    ) : (
                                        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    )}
                                </button>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm md:text-base">
                                    {episodes.find(e => e.id === currentEpisode)?.title}
                                </h4>
                                <p className="text-xs text-gray-400">
                                    {error ? <span className="text-red-400">{error}</span> : isPlaying ? 'Now Playing' : 'Paused'}
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:block w-1/3">
                            {/* Progress bar placeholder */}
                            <div className="w-full bg-navy-700 h-1.5 rounded-full overflow-hidden">
                                <div className={`bg-gold-500 h-full ${isPlaying ? 'animate-pulse' : ''}`} style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
                <Image
                    src="/images/podcast_hero.png"
                    alt="Narrative News Podcast Studio"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-navy-900/70 flex items-center justify-center">
                    <div className="text-center text-white max-w-4xl px-4">
                        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-white">
                            The Podcast
                        </h1>
                        <span className="inline-block py-1 px-3 border border-gold-500 rounded-full text-gold-500 text-sm font-bold tracking-widest uppercase mb-4">
                            New Episodes Weekly
                        </span>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Go beyond the headlines. We dissect the spin, analyze the bias, and uncover the truth behind the stories shaping our world.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="px-8 py-4 bg-gold-500 text-navy-900 font-bold rounded-sm hover:bg-white transition-colors shadow-lg flex items-center justify-center">
                                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                Listen Now
                            </button>
                            <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-sm hover:bg-white hover:text-navy-900 transition-colors flex items-center justify-center">
                                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" /></svg>
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Latest Episodes */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-serif font-bold text-navy-900">Latest Episodes</h2>
                    <Link href="/podcast/archive" className="text-gold-600 hover:text-navy-900 font-medium flex items-center">
                        View All
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                </div>

                <div className="space-y-8">
                    {episodes.map((episode) => (
                        <div key={episode.id} className="bg-white rounded-sm shadow-card hover:shadow-lg transition-shadow overflow-hidden flex flex-col md:flex-row group">
                            <div className="relative w-full md:w-1/3 h-64 md:h-auto">
                                <Image
                                    src={episode.image}
                                    alt={episode.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-navy-900/20 group-hover:bg-transparent transition-colors"></div>
                                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-sm text-xs font-bold text-navy-900 uppercase tracking-wide">
                                    {episode.duration}
                                </div>
                            </div>
                            <div className="p-8 md:w-2/3 flex flex-col justify-center">
                                <div className="flex items-center text-sm text-gray-500 mb-3">
                                    <span className="font-bold text-gold-600 uppercase tracking-wider">Episode {episode.id}</span>
                                    <span className="mx-2">•</span>
                                    <time>{episode.date}</time>
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-navy-900 mb-4 group-hover:text-gold-600 transition-colors">
                                    {episode.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed mb-6">
                                    {episode.description}
                                </p>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => togglePlay(episode.id)}
                                        className="flex items-center text-navy-900 font-bold hover:text-gold-600 transition-colors"
                                    >
                                        <div className={`w-10 h-10 rounded-full border-2 border-navy-900 flex items-center justify-center mr-3 group-hover:border-gold-600 ${currentEpisode === episode.id && isPlaying ? 'bg-navy-900 text-white' : ''}`}>
                                            {currentEpisode === episode.id && isPlaying ? (
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                            ) : (
                                                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            )}
                                        </div>
                                        {currentEpisode === episode.id && isPlaying ? 'Pause Episode' : 'Play Episode'}
                                    </button>
                                    <button className="text-gray-400 hover:text-navy-900 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Newsletter CTA */}
            <section className="bg-navy-900 text-white py-20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
                        Never Miss an Episode
                    </h2>
                    <p className="text-gray-300 text-lg mb-8">
                        Subscribe to our newsletter to get notified when new episodes drop, plus exclusive behind-the-scenes content.
                    </p>
                    <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="px-6 py-4 rounded-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500 w-full"
                        />
                        <button className="px-8 py-4 bg-gold-500 text-navy-900 font-bold rounded-sm hover:bg-white transition-colors whitespace-nowrap">
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>
        </div>
    )
}
