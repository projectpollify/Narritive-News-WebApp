import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'

// GET /api/analytics - Get site analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'week' // day, week, month, all
    const type = searchParams.get('type') || 'overview' // overview, articles, sources
    
    let analytics: any = {}
    
    switch (type) {
      case 'overview':
        analytics = await getOverviewAnalytics(timeframe)
        break
      case 'articles':
        analytics = await getArticleAnalytics(timeframe)
        break
      case 'sources':
        analytics = await getSourceAnalytics(timeframe)
        break
      default:
        analytics = await getOverviewAnalytics(timeframe)
    }
    
    return NextResponse.json({
      success: true,
      data: analytics
    })
    
  } catch (error) {
    console.error('❌ Analytics API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

// POST /api/analytics/track - Track user interactions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, articleId, sourceType, category } = body
    
    // Validate required fields
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event type required' },
        { status: 400 }
      )
    }
    
    switch (event) {
      case 'article_view':
        if (articleId) {
          await DatabaseService.recordArticleView(articleId)
        }
        break
        
      case 'source_click':
        if (articleId && sourceType) {
          await DatabaseService.recordSourceClick(articleId, sourceType)
        }
        break
        
      case 'newsletter_signup':
        // This is handled by the newsletter API, but we could track it here too
        break
        
      default:
        console.log(`📊 Unknown event type: ${event}`)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Event tracked'
    })
    
  } catch (error) {
    console.error('❌ Analytics tracking error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

// Helper function: Get overview analytics
async function getOverviewAnalytics(timeframe: string) {
  const stats = await DatabaseService.getStats()
  
  // Calculate date range
  const endDate = new Date()
  let startDate = new Date()
  
  switch (timeframe) {
    case 'day':
      startDate.setDate(endDate.getDate() - 1)
      break
    case 'week':
      startDate.setDate(endDate.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(endDate.getMonth() - 1)
      break
    default:
      startDate = new Date('2024-01-01') // All time
  }
  
  return {
    totalArticles: stats.articles,
    totalSubscribers: stats.subscribers,
    totalViews: stats.totalViews,
    timeframe,
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    }
  }
}

// Helper function: Get article-specific analytics
async function getArticleAnalytics(timeframe: string) {
  // Get top performing articles
  const topArticles = await DatabaseService.getTopArticles(10, timeframe)
  
  // Get articles by category
  const categoryCounts = await DatabaseService.getArticlesByCategory()
  
  return {
    topArticles: topArticles.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      viewCount: article.viewCount,
      category: article.category,
      publishedAt: article.publishedAt
    })),
    categoryCounts,
    timeframe
  }
}

// Helper function: Get source-specific analytics
async function getSourceAnalytics(timeframe: string) {
  // Get source click statistics
  const sourceStats = await DatabaseService.getSourceClickStats()
  
  return {
    sourceStats,
    timeframe
  }
}