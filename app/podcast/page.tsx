'use client'

import React from 'react'
import Image from 'next/image'
import { useAudio, Episode } from '@/lib/context/AudioContext'

// Episode Data
const episodes: Episode[] = [
    {
        id: 1,
        title: "The $300 Trillion Debt Lie: Why the Economy is a Ponzi Scheme",
        description: "A deep dive into the global debt crisis. We dissect the numbers and the narratives behind the $300 trillion figure that's shaping economic policy.",
        date: "Dec 1, 2025",
        duration: "33 min",
        image: "/images/podcast_hero.png",
        audioUrl: "/audio/episode-1.mp3"
    },
    {
        id: 2,
        title: "1971 Gold Standard Collapse Caused 2008 Crisis (Part 1/5)",
        description: "Part one of five. A deep dive into how the collapse of the Gold Standard in 1971 set the stage for the 2008 financial crisis.",
        date: "Dec 2, 2025",
        duration: "29 min",
        image: "/images/podcast_hero.png",
        audioUrl: "/audio/episode-2.mp3"
    },
    {
        id: 3,
        title: "Menopausal Health: Breaking the Silence",
        description: "An open and honest conversation about menopause. We explore the biological changes, the societal stigma, and the latest medical research empowering women to take control of their health.",
        date: "Dec 3, 2025",
        duration: "33 min",
        image: "/images/podcast_hero.png",
        audioUrl: "/audio/episode-3.mp3"
    }
]

export default function PodcastPage() {
    const { play, pause, currentEpisode, isPlaying } = useAudio()
    const [votes, setVotes] = React.useState<Record<number, { likes: number, dislikes: number }>>({
        1: { likes: 124, dislikes: 8 },
        2: { likes: 89, dislikes: 12 },
        3: { likes: 45, dislikes: 3 }
    })

    const handlePlay = (episode: Episode) => {
        if (currentEpisode?.id === episode.id && isPlaying) {
            pause()
        } else {
            play(episode)
        }
    }

    const handleVote = (id: number, type: 'like' | 'dislike') => {
        setVotes(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [type === 'like' ? 'likes' : 'dislikes']: prev[id][type === 'like' ? 'likes' : 'dislikes'] + 1
            }
        }))
    }

    return (
        <div className="min-h-screen bg-navy-900 text-white pb-20">
            {/* Hero Section */}
            <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
                <Image
                    src="/images/podcast_hero_v2.png"
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
                            Unfiltered conversations about the narratives shaping our world.
                            We go beyond the headlines to find the signal in the noise.
                        </p>
                    </div>
                </div>
            </div>

            {/* Episode List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid gap-8">
                    {episodes.map((episode) => {
                        const isCurrent = currentEpisode?.id === episode.id
                        const isActive = isCurrent && isPlaying
                        const episodeVotes = votes[episode.id]

                        return (
                            <div
                                key={episode.id}
                                className={`bg-navy-800 rounded-sm overflow-hidden flex flex-col md:flex-row shadow-lg hover:shadow-gold-500/10 transition-all border ${isCurrent ? 'border-gold-500' : 'border-navy-700'}`}
                            >
                                <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0 group">
                                    <Image
                                        src={episode.image}
                                        alt={episode.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <button
                                            onClick={() => handlePlay(episode)}
                                            className="w-16 h-16 bg-gold-500 rounded-full flex items-center justify-center text-navy-900 hover:scale-110 transition-transform shadow-lg"
                                        >
                                            {isActive ? (
                                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                                            ) : (
                                                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded-sm">
                                        {episode.duration}
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col justify-center flex-grow">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center text-gold-500 text-sm font-bold uppercase tracking-widest">
                                            <span>Episode {episode.id}</span>
                                            <span className="mx-2">•</span>
                                            <span>{episode.date}</span>
                                        </div>
                                        {/* Voting UI */}
                                        <div className="flex items-center space-x-4 text-gray-400">
                                            <button
                                                onClick={() => handleVote(episode.id, 'like')}
                                                className="flex items-center space-x-1 hover:text-gold-500 transition-colors group"
                                                title="I like this"
                                            >
                                                <svg className="w-5 h-5 group-active:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                                </svg>
                                                <span className="text-xs font-bold">{episodeVotes.likes}</span>
                                            </button>
                                            <button
                                                onClick={() => handleVote(episode.id, 'dislike')}
                                                className="flex items-center space-x-1 hover:text-red-500 transition-colors group"
                                                title="I dislike this"
                                            >
                                                <svg className="w-5 h-5 group-active:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                                </svg>
                                                <span className="text-xs font-bold">{episodeVotes.dislikes}</span>
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-serif font-bold text-white mb-4">
                                        {episode.title}
                                    </h3>
                                    <p className="text-gray-400 mb-6 leading-relaxed">
                                        {episode.description}
                                    </p>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => handlePlay(episode)}
                                            className={`px-6 py-2 rounded-sm font-bold text-sm uppercase tracking-wide transition-colors ${isActive ? 'bg-navy-900 text-gold-500 border border-gold-500' : 'bg-gold-500 text-navy-900 hover:bg-white'}`}
                                        >
                                            {isActive ? 'Playing...' : 'Play Episode'}
                                        </button>
                                        <button className="px-6 py-2 border border-gray-600 text-gray-300 rounded-sm font-bold text-sm uppercase tracking-wide hover:border-white hover:text-white transition-colors">
                                            Share
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
