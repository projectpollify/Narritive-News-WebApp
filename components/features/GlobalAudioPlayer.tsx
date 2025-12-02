'use client'

import { useEffect } from 'react'
import { useAudio } from '@/lib/context/AudioContext'

export function GlobalAudioPlayer() {
    const { currentEpisode, isPlaying, audioRef } = useAudio()

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        if (isPlaying) {
            audio.play().catch(error => {
                console.error("Playback failed:", error)
            })
        } else {
            audio.pause()
        }
    }, [isPlaying, audioRef])

    // Handle source change
    useEffect(() => {
        const audio = audioRef.current
        if (!audio || !currentEpisode) return

        audio.src = currentEpisode.audioUrl
        if (isPlaying) {
            audio.play().catch(error => {
                console.error("Playback failed:", error)
            })
        }
    }, [currentEpisode, audioRef]) // Removed isPlaying from dependency to avoid re-triggering on play/pause toggle

    if (!currentEpisode) return <audio ref={audioRef} />

    return (
        <audio
            ref={audioRef}
            src={currentEpisode.audioUrl}
            onEnded={() => {
                // Optional: Handle end of playback
            }}
        />
    )
}
