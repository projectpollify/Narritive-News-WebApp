import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'

// GET /api/articles - Get articles with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'publishedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const search = searchParams.get('search')
    
    // Validate parameters
    if (limit > 50) {
      return NextResponse.json(
        { success: false, error: 'Limit cannot exceed 50' },
        { status: 400 }
      )
    }
    
    // Build filters
    const filters: any = {
      limit,
      offset,
      published: true
    }
    
    if (category && category !== 'all') {
      filters.category = category
    }
    
    // Get articles
    const articles = await DatabaseService.getArticles(filters)
    
    // Filter by search term if provided
    let filteredArticles = articles
    if (search) {
      const searchLower = search.toLowerCase()
      filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.aiAnalysis.toLowerCase().includes(searchLower) ||
        (Array.isArray(article.tags) && article.tags.some(tag =>
          typeof tag === 'string' && tag.toLowerCase().includes(searchLower)
        ))
      )
    }
    
    // Transform data for frontend
    const transformedArticles = filteredArticles.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      aiAnalysis: article.aiAnalysis,
      category: article.category,
      tags: article.tags,
      publishedAt: article.publishedAt.toISOString(),
      viewCount: article.viewCount,
      leftSource: {
        outlet: article.leftSource.outlet,
        headline: article.leftSource.headline,
        summary: article.leftSource.summary,
        url: article.leftSource.url,
        author: article.leftSource.author,
        publishedAt: article.leftSource.publishedAt?.toISOString()
      },
      rightSource: {
        outlet: article.rightSource.outlet,
        headline: article.rightSource.headline,
        summary: article.rightSource.summary,
        url: article.rightSource.url,
        author: article.rightSource.author,
        publishedAt: article.rightSource.publishedAt?.toISOString()
      }
    }))
    
    // Get total count for pagination
    const totalCount = await DatabaseService.getArticlesCount({
      category: category && category !== 'all' ? category : undefined,
      published: true
    })
    
    return NextResponse.json({
      success: true,
      data: transformedArticles,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: Math.floor(offset / limit) + 1
      }
    })
    
  } catch (error: any) {
    console.error('❌ Articles API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

// POST /api/articles - Create new article (for testing/admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { title, category, aiAnalysis, leftSource, rightSource, tags = [] } = body
    
    // Validate required fields
    if (!title || !category || !aiAnalysis || !leftSource || !rightSource) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Generate slug
    const slug = await DatabaseService.generateUniqueSlug(title)
    
    // Create article
    const article = await DatabaseService.createArticle({
      title,
      slug,
      aiAnalysis,
      category,
      tags,
      publishedAt: new Date(),
      leftSource: {
        ...leftSource,
        bias: 'LEFT' as const,
        publishedAt: new Date(leftSource.publishedAt || Date.now())
      },
      rightSource: {
        ...rightSource,
        bias: 'RIGHT' as const,
        publishedAt: new Date(rightSource.publishedAt || Date.now())
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        id: article.id,
        slug: article.slug,
        title: article.title
      }
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('❌ Create article error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    )
  }
}