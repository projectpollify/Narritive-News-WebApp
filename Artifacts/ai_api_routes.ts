import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/ai'
import { DatabaseService } from '@/lib/db'

// POST /api/ai-analysis - Generate AI analysis for article pair
export async function POST(request: NextRequest) {
  try {
    const { leftArticle, rightArticle, saveToDb = false } = await request.json()
    
    // Validate input
    if (!leftArticle || !rightArticle) {
      return NextResponse.json(
        { success: false, error: 'Both leftArticle and rightArticle required' },
        { status: 400 }
      )
    }
    
    // Required fields validation
    const requiredFields = ['title', 'content', 'outlet']
    for (const field of requiredFields) {
      if (!leftArticle[field] || !rightArticle[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    console.log(`🤖 Generating AI analysis for ${leftArticle.outlet} vs ${rightArticle.outlet}`)
    
    // Generate analysis
    const analysis = await AIService.analyzeArticles(leftArticle, rightArticle)
    
    // Optionally save to database
    if (saveToDb) {
      const slug = await DatabaseService.generateUniqueSlug(
        `${leftArticle.title} vs ${rightArticle.title}`
      )
      
      const article = await DatabaseService.createArticle({
        title: await AIService.generateHeadline(leftArticle.title, rightArticle.title),
        slug,
        aiAnalysis: analysis.analysis,
        category: 'General',
        publishedAt: new Date(),
        leftSource: {
          outlet: leftArticle.outlet,
          headline: leftArticle.title,
          summary: leftArticle.summary || leftArticle.content.slice(0, 300) + '...',
          fullContent: leftArticle.content,
          url: leftArticle.url || '#',
          author: leftArticle.author,
          publishedAt: new Date(leftArticle.publishedAt || Date.now()),
          bias: 'LEFT'
        },
        rightSource: {
          outlet: rightArticle.outlet,
          headline: rightArticle.title,
          summary: rightArticle.summary || rightArticle.content.slice(0, 300) + '...',
          fullContent: rightArticle.content,
          url: rightArticle.url || '#',
          author: rightArticle.author,
          publishedAt: new Date(rightArticle.publishedAt || Date.now()),
          bias: 'RIGHT'
        }
      })
      
      return NextResponse.json({
        success: true,
        data: {
          ...analysis,
          articleId: article.id,
          slug: article.slug
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      data: analysis
    })
    
  } catch (error) {
    console.error('❌ AI analysis API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        fallbackAvailable: true
      },
      { status: 500 }
    )
  }
}

// GET /api/ai-analysis/health - Check AI service health
export async function GET() {
  try {
    const health = await AIService.healthCheck()
    
    return NextResponse.json({
      success: true,
      data: health
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/ai-analysis/[articleId] - Regenerate analysis for existing article
export async function PUT(request: NextRequest, { params }: { params: { articleId: string } }) {
  try {
    const articleId = params.articleId
    
    // Get existing article
    const article = await DatabaseService.getArticleById(articleId)
    
    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    }
    
    // Regenerate analysis
    const newAnalysis = await AIService.analyzeArticles(
      {
        title: article.leftSource.headline,
        content: article.leftSource.fullContent || article.leftSource.summary,
        outlet: article.leftSource.outlet,
        summary: article.leftSource.summary
      },
      {
        title: article.rightSource.headline,
        content: article.rightSource.fullContent || article.rightSource.summary,
        outlet: article.rightSource.outlet,
        summary: article.rightSource.summary
      }
    )
    
    // Update article in database
    const updatedArticle = await DatabaseService.createArticle({
      title: article.title,
      slug: article.slug + '-updated',
      aiAnalysis: newAnalysis.analysis,
      category: article.category,
      publishedAt: new Date(),
      leftSource: {
        outlet: article.leftSource.outlet,
        headline: article.leftSource.headline,
        summary: article.leftSource.summary,
        fullContent: article.leftSource.fullContent,
        url: article.leftSource.url,
        author: article.leftSource.author,
        publishedAt: article.leftSource.publishedAt,
        bias: article.leftSource.bias as 'LEFT' | 'RIGHT' | 'CENTER'
      },
      rightSource: {
        outlet: article.rightSource.outlet,
        headline: article.rightSource.headline,
        summary: article.rightSource.summary,
        fullContent: article.rightSource.fullContent,
        url: article.rightSource.url,
        author: article.rightSource.author,
        publishedAt: article.rightSource.publishedAt,
        bias: article.rightSource.bias as 'LEFT' | 'RIGHT' | 'CENTER'
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        ...newAnalysis,
        articleId: updatedArticle.id,
        oldArticleId: articleId
      }
    })
    
  } catch (error) {
    console.error('❌ Analysis regeneration failed:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}