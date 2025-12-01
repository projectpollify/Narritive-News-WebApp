'use client'

import { useState, useEffect } from 'react'
import { DEFAULT_SOURCES, NewsSourceConfig } from '@/lib/config/sources'
import Link from 'next/link'

export default function SourceControlPage() {
    const [sources, setSources] = useState<NewsSourceConfig[]>([])
    const [isSaved, setIsSaved] = useState(false)

    useEffect(() => {
        // Load from localStorage or use defaults
        const saved = localStorage.getItem('news_sources')
        if (saved) {
            setSources(JSON.parse(saved))
        } else {
            setSources(DEFAULT_SOURCES)
        }
    }, [])

    const toggleSource = (id: string) => {
        setSources(sources.map(s =>
            s.id === id ? { ...s, enabled: !s.enabled } : s
        ))
        setIsSaved(false)
    }

    const saveConfiguration = () => {
        localStorage.setItem('news_sources', JSON.stringify(sources))
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 3000)
    }

    const resetDefaults = () => {
        setSources(DEFAULT_SOURCES)
        setIsSaved(false)
    }

    const groupedSources = {
        LEFT: sources.filter(s => s.bias === 'LEFT'),
        RIGHT: sources.filter(s => s.bias === 'RIGHT'),
        CENTER: sources.filter(s => s.bias === 'CENTER')
    }

    return (
        <div className="min-h-screen bg-paper p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/" className="text-sm font-bold text-gray-400 uppercase tracking-widest hover:text-navy-900 transition-colors mb-2 block">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-serif font-bold text-navy-900">Source Control Center</h1>
                        <p className="text-gray-600 mt-2">Manage the trusted sources for AI analysis and data aggregation.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={resetDefaults}
                            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-navy-900 transition-colors"
                        >
                            Reset Defaults
                        </button>
                        <button
                            onClick={saveConfiguration}
                            className={`px-6 py-2 rounded-sm font-bold text-white transition-all shadow-sm ${isSaved ? 'bg-green-600' : 'bg-navy-900 hover:bg-navy-800'
                                }`}
                        >
                            {isSaved ? 'Configuration Saved' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Bias Column */}
                    <div className="bg-white p-6 rounded-sm shadow-card border-t-4 border-democrat">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-navy-900">Progressive Sources</h2>
                            <span className="px-2 py-1 bg-democrat/10 text-democrat text-xs font-bold uppercase rounded-sm">Left Bias</span>
                        </div>
                        <div className="space-y-4">
                            {groupedSources.LEFT.map(source => (
                                <SourceToggle key={source.id} source={source} onToggle={() => toggleSource(source.id)} />
                            ))}
                        </div>
                    </div>

                    {/* Center Column */}
                    <div className="bg-white p-6 rounded-sm shadow-card border-t-4 border-gray-400">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-navy-900">Neutral / Business</h2>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded-sm">Center</span>
                        </div>
                        <div className="space-y-4">
                            {groupedSources.CENTER.map(source => (
                                <SourceToggle key={source.id} source={source} onToggle={() => toggleSource(source.id)} />
                            ))}
                        </div>
                    </div>

                    {/* Right Bias Column */}
                    <div className="bg-white p-6 rounded-sm shadow-card border-t-4 border-republican">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-navy-900">Conservative Sources</h2>
                            <span className="px-2 py-1 bg-republican/10 text-republican text-xs font-bold uppercase rounded-sm">Right Bias</span>
                        </div>
                        <div className="space-y-4">
                            {groupedSources.RIGHT.map(source => (
                                <SourceToggle key={source.id} source={source} onToggle={() => toggleSource(source.id)} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-12 bg-blue-50 border border-blue-100 p-6 rounded-sm">
                    <h3 className="font-bold text-navy-900 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        How this works
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        The AI Watchdog continuously monitors these selected RSS feeds. When a story appears across multiple sources with differing perspectives, it triggers an analysis event.
                        Disabling a source will prevent the AI from using it for cross-referencing and bias detection.
                    </p>
                </div>
            </div>
        </div>
    )
}

function SourceToggle({ source, onToggle }: { source: NewsSourceConfig, onToggle: () => void }) {
    return (
        <div className={`flex items-center justify-between p-3 rounded-sm border transition-all ${source.enabled ? 'bg-gray-50 border-gray-200' : 'bg-gray-50/50 border-transparent opacity-60'
            }`}>
            <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${source.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="font-medium text-navy-900">{source.name}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={source.enabled} onChange={onToggle} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-900"></div>
            </label>
        </div>
    )
}
