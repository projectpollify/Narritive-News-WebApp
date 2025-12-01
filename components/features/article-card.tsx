import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { NEWSROOM } from '@/lib/services/ai'

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
  personaId?: string // New field for the reporter
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

  // Get the reporter persona (default to Voice of Reason if missing)
  const persona = article.personaId ? NEWSROOM[article.personaId] : NEWSROOM['voice-of-reason']

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

        {/* AI Analysis Box (The Reporter) */}
        <div className={`bg-paper rounded-sm p-6 mb-8 border-l-2 ${persona.color.replace('text-', 'border-')} relative`}>
          <div className="absolute -top-3 left-4 bg-white px-2 py-1 border border-gray-100 shadow-sm rounded-sm">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{persona.avatar}</span>
              <span className={`text-xs font-bold ${persona.color} uppercase tracking-wider`}>
                {persona.name}
              </span>
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed font-sans text-lg italic mt-2">
            "{analysisSummary}"
          </p>
        </div>

        {/* Two Perspectives Grid */}
        <div className="grid md:grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-sm overflow-hidden">
          {/* Left Perspective */}
          <div className="bg-white hover:bg-democrat-light/10 transition-colors relative group/left flex flex-col h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-democrat scale-x-0 group-hover/left:scale-x-100 transition-transform origin-left z-10"></div>
            {article.leftSource.imageUrl && (
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={article.leftSource.imageUrl}
                  alt={article.leftSource.outlet}
                  fill
                  className="object-cover transition-transform duration-700 group-hover/left:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/left:opacity-100 transition-opacity duration-300"></div>
              </div>
            )}
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-democrat uppercase tracking-wider flex items-center">
                  <span className="w-1.5 h-1.5 bg-democrat rounded-full mr-2"></span>
                  {article.leftSource.outlet}
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-navy-900 mb-2 leading-snug group-hover/left:text-democrat transition-colors">
                {article.leftSource.headline}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4 flex-grow">
                {article.leftSource.summary}
              </p>
              <a href={article.leftSource.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-democrat uppercase tracking-wide hover:underline mt-auto">
                Read Original →
              </a>
            </div>
          </div>

          {/* Right Perspective */}
          <div className="bg-white hover:bg-republican-light/10 transition-colors relative group/right flex flex-col h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-republican scale-x-0 group-hover/right:scale-x-100 transition-transform origin-left z-10"></div>
            {article.rightSource.imageUrl && (
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={article.rightSource.imageUrl}
                  alt={article.rightSource.outlet}
                  fill
                  className="object-cover transition-transform duration-700 group-hover/right:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/right:opacity-100 transition-opacity duration-300"></div>
              </div>
            )}
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-republican uppercase tracking-wider flex items-center">
                  <span className="w-1.5 h-1.5 bg-republican rounded-full mr-2"></span>
                  {article.rightSource.outlet}
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-navy-900 mb-2 leading-snug group-hover/right:text-republican transition-colors">
                {article.rightSource.headline}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4 flex-grow">
                {article.rightSource.summary}
              </p>
              <a href={article.rightSource.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-republican uppercase tracking-wide hover:underline mt-auto">
                Read Original →
              </a>
            </div>
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
          <button className="hover:text-navy-900 transition-colors flex items-center space-x-1" aria-label="Share this article">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
            <span className="text-xs font-medium">Share</span>
          </button>
          <button className="hover:text-navy-900 transition-colors" aria-label="Save article">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
          </button>
        </div>
      </div>
    </article>
  )
}