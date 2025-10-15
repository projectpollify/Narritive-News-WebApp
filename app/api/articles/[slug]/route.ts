import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'

// GET /api/articles/[slug] - Get single article by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Article slug required' },
        { status: 400 }
      )
    }
    
    // Get article (this also increments view count)
    const article = await DatabaseService.getArticleBySlug(slug)
    
    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    }
    
    // Transform data for frontend
    const transformedArticle = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      aiAnalysis: article.aiAnalysis,
      category: article.category,
      tags: article.tags,
      publishedAt: article.publishedAt.toISOString(),
      viewCount: article.viewCount,
      readingTime: Math.ceil(article.aiAnalysis.split(/\s+/).length / 200), // ~200 words per minute
      leftSource: {
        outlet: article.leftSource.outlet,
        headline: article.leftSource.headline,
        summary: article.leftSource.summary,
        fullContent: article.leftSource.fullContent,
        url: article.leftSource.url,
        author: article.leftSource.author,
        publishedAt: article.leftSource.publishedAt?.toISOString(),
        bias: article.leftSource.bias
      },
      rightSource: {
        outlet: article.rightSource.outlet,
        headline: article.rightSource.headline,
        summary: article.rightSource.summary,
        fullContent: article.rightSource.fullContent,
        url: article.rightSource.url,
        author: article.rightSource.author,
        publishedAt: article.rightSource.publishedAt?.toISOString(),
        bias: article.rightSource.bias
      }
    }
    
    // Record analytics
    await DatabaseService.recordArticleView(article.id)
    
    return NextResponse.json({
      success: true,
      data: transformedArticle
    })
    
  } catch (error: any) {
    console.error('❌ Article detail API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

// PATCH /api/articles/[slug] - Update article (for admin/editing)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    const updates = await request.json()
    
    // Get existing article
    const existingArticle = await DatabaseService.getArticleBySlug(slug)
    
    if (!existingArticle) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    }
    
    // For now, just return success - full update implementation would go here
    // In production, you'd want proper authentication and validation
    
    return NextResponse.json({
      success: true,
      message: 'Article update functionality would be implemented here',
      data: { slug }
    })
    
  } catch (error: any) {
    console.error('❌ Article update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 }
    )
  }
}