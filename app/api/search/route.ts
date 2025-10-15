import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'

// GET /api/search - Search articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'relevance' // relevance, date, views
    
    // Validate query
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Search query must be at least 2 characters' },
        { status: 400 }
      )
    }
    
    const searchTerm = query.trim().toLowerCase()
    
    // Get all articles (in production, you'd want more efficient search)
    const filters = {
      category: category && category !== 'all' ? category : undefined,
      published: true,
      limit: 100, // Get more for searching
      offset: 0
    }
    
    const allArticles = await DatabaseService.getArticles(filters)
    
    // Simple text search implementation
    const searchResults = allArticles.filter(article => {
      const titleMatch = article.title.toLowerCase().includes(searchTerm)
      const analysisMatch = article.aiAnalysis.toLowerCase().includes(searchTerm)
      const tagMatch = Array.isArray(article.tags) && article.tags.some(tag =>
        typeof tag === 'string' && tag.toLowerCase().includes(searchTerm)
      )
      const leftHeadlineMatch = article.leftSource.headline.toLowerCase().includes(searchTerm)
      const rightHeadlineMatch = article.rightSource.headline.toLowerCase().includes(searchTerm)
      const leftSummaryMatch = article.leftSource.summary.toLowerCase().includes(searchTerm)
      const rightSummaryMatch = article.rightSource.summary.toLowerCase().includes(searchTerm)

      return titleMatch || analysisMatch || tagMatch ||
             leftHeadlineMatch || rightHeadlineMatch ||
             leftSummaryMatch || rightSummaryMatch
    })
    
    // Calculate relevance scores
    const scoredResults = searchResults.map(article => {
      let score = 0
      
      // Title matches are most important
      if (article.title.toLowerCase().includes(searchTerm)) score += 10

      // Tag matches are also important
      if (Array.isArray(article.tags) && article.tags.some(tag =>
        typeof tag === 'string' && tag.toLowerCase().includes(searchTerm)
      )) score += 8
      
      // AI analysis matches
      if (article.aiAnalysis.toLowerCase().includes(searchTerm)) score += 5
      
      // Source headline matches
      if (article.leftSource.headline.toLowerCase().includes(searchTerm)) score += 3
      if (article.rightSource.headline.toLowerCase().includes(searchTerm)) score += 3
      
      // Summary matches
      if (article.leftSource.summary.toLowerCase().includes(searchTerm)) score += 2
      if (article.rightSource.summary.toLowerCase().includes(searchTerm)) score += 2
      
      // Boost recent articles
      const daysSincePublished = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSincePublished < 7) score += 2
      if (daysSincePublished < 1) score += 3
      
      // Boost popular articles
      score += Math.log(article.viewCount + 1)
      
      return { ...article, relevanceScore: score }
    })
    
    // Sort results
    let sortedResults = scoredResults
    switch (sortBy) {
      case 'date':
        sortedResults.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
        break
      case 'views':
        sortedResults.sort((a, b) => b.viewCount - a.viewCount)
        break
      case 'relevance':
      default:
        sortedResults.sort((a, b) => b.relevanceScore - a.relevanceScore)
        break
    }
    
    // Apply pagination
    const paginatedResults = sortedResults.slice(offset, offset + limit)
    
    // Transform for frontend
    const transformedResults = paginatedResults.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      aiAnalysis: article.aiAnalysis.slice(0, 200) + '...', // Truncate for search results
      category: article.category,
      tags: article.tags,
      publishedAt: article.publishedAt.toISOString(),
      viewCount: article.viewCount,
      relevanceScore: article.relevanceScore,
      leftSource: {
        outlet: article.leftSource.outlet,
        headline: article.leftSource.headline,
        summary: article.leftSource.summary,
        url: article.leftSource.url
      },
      rightSource: {
        outlet: article.rightSource.outlet,
        headline: article.rightSource.headline,
        summary: article.rightSource.summary,
        url: article.rightSource.url
      }
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        results: transformedResults,
        query: query,
        total: scoredResults.length,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < scoredResults.length,
          totalPages: Math.ceil(scoredResults.length / limit),
          currentPage: Math.floor(offset / limit) + 1
        }
      }
    })
    
  } catch (error: any) {
    console.error('❌ Search API error:', error)
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    )
  }
}

// POST /api/search/suggestions - Get search suggestions
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: { suggestions: [] }
      })
    }
    
    // Get popular search terms (in production, you'd maintain a search terms table)
    const popularTerms = [
      'Federal Reserve', 'Interest Rates', 'Climate Change', 'Election', 
      'Congress', 'Senate', 'Healthcare', 'Technology', 'Trade', 
      'Immigration', 'Economy', 'Business', 'Politics', 'International'
    ]
    
    const suggestions = popularTerms
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8)
    
    // Also get recent article titles that match
    const recentArticles = await DatabaseService.getArticles({ limit: 50 })
    const titleSuggestions = recentArticles
      .filter(article => article.title.toLowerCase().includes(query.toLowerCase()))
      .map(article => article.title)
      .slice(0, 5)
    
    const allSuggestions = Array.from(new Set([...suggestions, ...titleSuggestions]))
    
    return NextResponse.json({
      success: true,
      data: { 
        suggestions: allSuggestions.slice(0, 10)
      }
    })
    
  } catch (error: any) {
    console.error('❌ Search suggestions error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get suggestions' },
      { status: 500 }
    )
  }
}