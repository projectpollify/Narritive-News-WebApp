// Core article types
export interface Article {
  id: string
  title: string
  aiAnalysis: string
  leftSource: NewsSource
  rightSource: NewsSource
  publishedAt: string
  category: string
  slug?: string
  tags?: string[]
  readingTime?: number
  viewCount?: number
}

export interface NewsSource {
  outlet: string
  headline: string
  summary: string
  fullContent?: string
  url: string
  author?: string
  publishedAt?: string
  bias?: 'left' | 'right' | 'center'
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ArticleResponse extends ApiResponse<Article> {}
export interface ArticlesResponse extends ApiResponse<Article[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Newsletter types
export interface NewsletterSubscription {
  id: string
  email: string
  subscribedAt: string
  isActive: boolean
  preferences?: {
    categories?: string[]
    frequency?: 'daily' | 'weekly'
  }
}

export interface NewsletterResponse extends ApiResponse<NewsletterSubscription> {}

// Automation types
export interface RSSFeed {
  id: string
  url: string
  outlet: string
  bias: 'left' | 'right' | 'center'
  category?: string
  isActive: boolean
  lastChecked?: string
}

export interface AIAnalysisRequest {
  leftArticle: {
    title: string
    content: string
    outlet: string
  }
  rightArticle: {
    title: string
    content: string
    outlet: string
  }
  topic: string
}

export interface AIAnalysisResponse {
  analysis: string
  keyDifferences: string[]
  possibleMotives: string[]
  confidenceScore: number
}

// Database models (for Prisma)
export interface DatabaseArticle {
  id: string
  title: string
  slug: string
  aiAnalysis: string
  category: string
  tags: string[]
  publishedAt: Date
  createdAt: Date
  updatedAt: Date
  viewCount: number
  isPublished: boolean
  
  // Relations
  leftSource: DatabaseNewsSource
  rightSource: DatabaseNewsSource
}

export interface DatabaseNewsSource {
  id: string
  outlet: string
  headline: string
  summary: string
  fullContent?: string
  url: string
  author?: string
  publishedAt?: Date
  bias: 'left' | 'right' | 'center'
  
  // Relations
  articleId: string
  sourceType: 'left' | 'right'
}

export interface DatabaseSubscriber {
  id: string
  email: string
  subscribedAt: Date
  isActive: boolean
  preferences: {
    categories: string[]
    frequency: 'daily' | 'weekly'
  }
  lastEmailSent?: Date
}

// Component props types
export interface ArticleCardProps {
  article: Article
  featured?: boolean
  compact?: boolean
}

export interface NewsletterProps {
  variant?: 'default' | 'compact' | 'sidebar'
  showBenefits?: boolean
}

// Utility types
export type Category = 'Politics' | 'Business' | 'Technology' | 'Health' | 'Environment' | 'International'
export type SortOrder = 'newest' | 'oldest' | 'popular' | 'trending'
export type TimeFilter = 'today' | 'week' | 'month' | 'all'

// Search and filtering types
export interface ArticleFilters {
  category?: Category
  timeFilter?: TimeFilter
  sortOrder?: SortOrder
  page?: number
  limit?: number
  search?: string
}

export interface SearchResults {
  articles: Article[]
  total: number
  page: number
  totalPages: number
  filters: ArticleFilters
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
}

// Configuration types
export interface SiteConfig {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter: string
    github: string
  }
}

// Analytics types (for future use)
export interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  userId?: string
  sessionId: string
}

export interface ArticleAnalytics {
  articleId: string
  views: number
  shares: number
  readingTime: number
  bounceRate: number
  sourceClicks: {
    left: number
    right: number
  }
}