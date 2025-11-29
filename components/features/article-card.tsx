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
    <article className="bg-white rounded-sm shadow-card border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="p-8">
        {/* Header: Category & Date */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">
            {article.category}
          </span>
          <time className="text-xs font-medium text-gray-400 uppercase tracking-wide" dateTime={article.publishedAt}>
            {timeAgo}
          </time>
        </div>

        {/* Main Title */}
        <Link href={`/article/${article.id}`} className="block mb-6">
          <h2 className="text-3xl font-serif font-bold text-navy-900 group-hover:text-gold-600 transition-colors leading-tight">
            {article.title}
          </h2>
        </Link>

        {/* AI Analysis Box */}
        <div className="bg-paper rounded-sm p-6 mb-8 border-l-2 border-gold-500 relative">
          <div className="absolute -top-3 left-4 bg-white px-2 py-1 border border-gray-100 shadow-sm rounded-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gold-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">AI Analysis</span>
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed font-sans text-lg italic">
            "{analysisSummary}"
          </p>
        </div>

        {/* Two Perspectives Grid */}
        <div className="grid md:grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-sm overflow-hidden">
          {/* Left Perspective */}
          <div className="bg-white p-6 hover:bg-democrat-light/10 transition-colors relative group/left">
            <div className="absolute top-0 left-0 w-full h-1 bg-democrat scale-x-0 group-hover/left:scale-x-100 transition-transform origin-left"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-democrat uppercase tracking-wider flex items-center">
                <span className="w-1.5 h-1.5 bg-democrat rounded-full mr-2"></span>
                {article.leftSource.outlet}
              </span>
            </div>
            <h3 className="font-serif font-bold text-lg text-navy-900 mb-2 leading-snug group-hover/left:text-democrat transition-colors">
              {article.leftSource.headline}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">
              {article.leftSource.summary}
            </p>
            <a href={article.leftSource.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-democrat uppercase tracking-wide hover:underline">
              Read Original →
            </a>
          </div>

          {/* Right Perspective */}
          <div className="bg-white p-6 hover:bg-republican-light/10 transition-colors relative group/right">
            <div className="absolute top-0 left-0 w-full h-1 bg-republican scale-x-0 group-hover/right:scale-x-100 transition-transform origin-left"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-republican uppercase tracking-wider flex items-center">
                <span className="w-1.5 h-1.5 bg-republican rounded-full mr-2"></span>
                {article.rightSource.outlet}
              </span>
            </div>
            <h3 className="font-serif font-bold text-lg text-navy-900 mb-2 leading-snug group-hover/right:text-republican transition-colors">
              {article.rightSource.headline}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">
              {article.rightSource.summary}
            </p>
            <a href={article.rightSource.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-republican uppercase tracking-wide hover:underline">
              Read Original →
            </a>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex items-center justify-between">
        <Link
          href={`/article/${article.id}`}
          className="text-sm font-bold text-navy-900 hover:text-gold-600 transition-colors uppercase tracking-wide flex items-center"
        >
          Full Comparison <span className="ml-2">→</span>
        </Link>

        <div className="flex items-center space-x-4 text-gray-400">
          <button className="hover:text-navy-900 transition-colors flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
            <span className="text-xs font-medium">Share</span>
          </button>
          <button className="hover:text-navy-900 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
          </button>
        </div>
      </div>
    </article>
  )
}