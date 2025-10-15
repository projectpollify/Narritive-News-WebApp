import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

interface EnhancedAnalysis {
  summary: string
  truthCheck?: string
  spinDetection?: string
  realImpact?: string
  commonGround?: string
  biggerPicture?: string
}

export interface Article {
  id: string
  title: string
  aiAnalysis: string | EnhancedAnalysis
  leftSource: {
    outlet: string
    headline: string
    summary: string
    url: string
    imageUrl?: string
    author?: string
  }
  rightSource: {
    outlet: string
    headline: string
    summary: string
    url: string
    imageUrl?: string
    author?: string
  }
  publishedAt: string
  category: string
}

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
  const analysisSummary = typeof article.aiAnalysis === 'string'
    ? article.aiAnalysis
    : article.aiAnalysis.summary

  return (
    <article className="article-card p-6 hover:shadow-lg transition-all duration-200">
      {/* Category and Date */}
      <div className="flex items-center justify-between mb-3">
        <span className="source-badge bg-gray-100 text-gray-700">
          {article.category}
        </span>
        <time className="text-sm text-gray-500" dateTime={article.publishedAt}>
          {timeAgo}
        </time>
      </div>

      {/* Main Title */}
      <Link href={`/article/${article.id}`} className="block mb-4 group">
        <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
          {article.title}
        </h2>
      </Link>

      {/* Truth & Impact Analysis Preview */}
      <div className="ai-analysis rounded-lg p-4 mb-6">
        <div className="flex items-center mb-2">
          <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center mr-2">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-green-800">Truth & Impact</span>
        </div>
        <p className="text-sm text-green-700 leading-relaxed">
          {analysisSummary}
        </p>
      </div>

      {/* Side-by-Side Sources */}
      <div className="grid md:grid-cols-2 gap-6 mb-4">
        {/* Left Source */}
        <div className="perspective-left rounded-lg overflow-hidden">
          {/* Article Image */}
          {article.leftSource.imageUrl && (
            <div className="relative h-48 w-full bg-gray-200">
              <Image
                src={article.leftSource.imageUrl}
                alt={article.leftSource.headline}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}

          <div className="p-4">
            {/* Outlet Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="source-left source-badge text-xs font-semibold">
                {article.leftSource.outlet}
              </span>
              {article.leftSource.author && (
                <span className="text-xs text-blue-600">
                  By {article.leftSource.author}
                </span>
              )}
            </div>

            {/* Headline */}
            <h3 className="font-bold text-blue-900 text-base mb-2 leading-tight">
              {article.leftSource.headline}
            </h3>

            {/* Summary */}
            <p className="text-sm text-blue-700 leading-relaxed line-clamp-3 mb-3">
              {article.leftSource.summary}
            </p>

            {/* Read Original Link */}
            <a
              href={article.leftSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Read on {article.leftSource.outlet}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Right Source */}
        <div className="perspective-right rounded-lg overflow-hidden">
          {/* Article Image */}
          {article.rightSource.imageUrl && (
            <div className="relative h-48 w-full bg-gray-200">
              <Image
                src={article.rightSource.imageUrl}
                alt={article.rightSource.headline}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}

          <div className="p-4">
            {/* Outlet Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="source-right source-badge text-xs font-semibold">
                {article.rightSource.outlet}
              </span>
              {article.rightSource.author && (
                <span className="text-xs text-red-600">
                  By {article.rightSource.author}
                </span>
              )}
            </div>

            {/* Headline */}
            <h3 className="font-bold text-red-900 text-base mb-2 leading-tight">
              {article.rightSource.headline}
            </h3>

            {/* Summary */}
            <p className="text-sm text-red-700 leading-relaxed line-clamp-3 mb-3">
              {article.rightSource.summary}
            </p>

            {/* Read Original Link */}
            <a
              href={article.rightSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
            >
              Read on {article.rightSource.outlet}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Link 
          href={`/article/${article.id}`}
          className="btn-primary text-sm px-4 py-2"
        >
          Read Full Analysis
        </Link>
        
        <div className="flex items-center space-x-3">
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
          
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}

// Utility CSS classes for line clamping (add to globals.css)
export const additionalStyles = `
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
`