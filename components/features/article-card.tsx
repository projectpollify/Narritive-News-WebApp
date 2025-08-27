import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export interface Article {
  id: string
  title: string
  aiAnalysis: string
  leftSource: {
    outlet: string
    headline: string
    summary: string
    url: string
  }
  rightSource: {
    outlet: string
    headline: string
    summary: string
    url: string
  }
  publishedAt: string
  category: string
}

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })

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

      {/* AI Analysis Preview */}
      <div className="ai-analysis rounded-lg p-4 mb-6">
        <div className="flex items-center mb-2">
          <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center mr-2">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-green-800">AI Analysis</span>
        </div>
        <p className="text-sm text-green-700 leading-relaxed">
          {article.aiAnalysis}
        </p>
      </div>

      {/* Side-by-Side Sources */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Left Source */}
        <div className="perspective-left rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="source-left source-badge text-xs">
              {article.leftSource.outlet}
            </span>
          </div>
          <h3 className="font-semibold text-blue-900 text-sm mb-2 leading-tight">
            {article.leftSource.headline}
          </h3>
          <p className="text-xs text-blue-700 leading-relaxed line-clamp-3">
            {article.leftSource.summary}
          </p>
        </div>

        {/* Right Source */}
        <div className="perspective-right rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="source-right source-badge text-xs">
              {article.rightSource.outlet}
            </span>
          </div>
          <h3 className="font-semibold text-red-900 text-sm mb-2 leading-tight">
            {article.rightSource.headline}
          </h3>
          <p className="text-xs text-red-700 leading-relaxed line-clamp-3">
            {article.rightSource.summary}
          </p>
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