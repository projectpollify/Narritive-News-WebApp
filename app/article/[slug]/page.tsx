'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { EnhancedAnalysisDisplay, W5AnalysisToggle } from '@/components/features/enhanced-analysis'
import type { EnhancedAIAnalysis } from '@/lib/services/ai'

export default function ArticlePage() {
  const params = useParams()
  const slug = params.slug as string

  const [article, setArticle] = useState<any>(null)
  const [analysis, setAnalysis] = useState<EnhancedAIAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArticle() {
      try {
        setLoading(true)
        setError(null)

        // Fetch article data
        const response = await fetch(`/api/articles/${slug}`)
        if (!response.ok) {
          throw new Error('Failed to fetch article')
        }

        const data = await response.json()
        setArticle(data)

        // Parse AI analysis if it exists
        if (data.aiAnalysis) {
          try {
            const parsedAnalysis = typeof data.aiAnalysis === 'string'
              ? JSON.parse(data.aiAnalysis)
              : data.aiAnalysis

            setAnalysis(parsedAnalysis)
          } catch (e) {
            console.error('Failed to parse AI analysis:', e)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchArticle()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Article not found</h1>
          <p className="text-gray-600 dark:text-gray-400">The article you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {article.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Published: {new Date(article.publishedAt).toLocaleDateString()}
            </span>
            {article.category && (
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full">
                {article.category}
              </span>
            )}
            <span>👁️ {article.viewCount || 0} views</span>
          </div>
        </header>

        {/* Sources */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Left Source */}
          {article.leftSource && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📰</span>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Left Perspective
                </h2>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {article.leftSource.outlet}
              </h3>
              <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                {article.leftSource.headline}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                {article.leftSource.summary}
              </p>
              <a
                href={article.leftSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Read full article →
              </a>
            </div>
          )}

          {/* Right Source */}
          {article.rightSource && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">📰</span>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Right Perspective
                </h2>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {article.rightSource.outlet}
              </h3>
              <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                {article.rightSource.headline}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                {article.rightSource.summary}
              </p>
              <a
                href={article.rightSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 dark:text-red-400 hover:underline text-sm"
              >
                Read full article →
              </a>
            </div>
          )}
        </div>

        {/* W5 Analysis Toggle */}
        <div className="mb-6">
          <W5AnalysisToggle />
        </div>

        {/* Enhanced Analysis */}
        {analysis ? (
          <EnhancedAnalysisDisplay analysis={analysis} defaultExpanded={false} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              AI analysis not available for this article
            </p>
          </div>
        )}

        {/* Legacy Analysis Fallback */}
        {!analysis && article.aiAnalysis && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mt-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Analysis
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              {typeof article.aiAnalysis === 'string' ? (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {article.aiAnalysis}
                </p>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {article.aiAnalysis.analysis || 'Analysis not available'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
