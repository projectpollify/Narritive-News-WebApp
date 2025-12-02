'use client'

import React, { createContext, useContext, useState, useRef, ReactNode } from 'react'

export interface Episode {
    id: number
    title: string
    description: string
    date: string
    duration: string
    image: string
    audioUrl: string
}

interface AudioContextType {
    isPlaying: boolean
    currentEpisode: Episode | null
    play: (episode: Episode) => void
    pause: () => void
    togglePlay: () => void
    audioRef: React.RefObject<HTMLAudioElement>
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: ReactNode }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null)
    const audioRef = useRef<HTMLAudioElement>(null)

    const play = (episode: Episode) => {
        if (currentEpisode?.id === episode.id) {
            // Resume if same episode
            audioRef.current?.play()
            setIsPlaying(true)
        } else {
            // Start new episode
            setCurrentEpisode(episode)
            setIsPlaying(true)
            // The useEffect in GlobalAudioPlayer will handle the actual play() call
            // once the audio source updates
        }
    }

    const pause = () => {
        audioRef.current?.pause()
        setIsPlaying(false)
    }

    const togglePlay = () => {
        if (isPlaying) {
            pause()
        } else if (currentEpisode) {
            audioRef.current?.play()
            setIsPlaying(true)
        }
    }

    return (
        <AudioContext.Provider value={{ isPlaying, currentEpisode, play, pause, togglePlay, audioRef }}>
            {children}
        </AudioContext.Provider>
    )
}

export function useAudio() {
    const context = useContext(AudioContext)
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider')
    }
    return context
}
