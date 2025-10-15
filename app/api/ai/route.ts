import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/services/ai'
import { DatabaseService } from '@/lib/db'

// POST /api/ai-analysis - Generate AI analysis for article pair
export async function POST(request: NextRequest) {
  try {
    const {
      leftArticle,
      rightArticle,
      saveToDb = false,
      enhanced = true,  // Default to enhanced analysis with W5
      includeW5 = true  // Include W5 deep-dive sections
    } = await request.json()

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

    console.log(`🤖 Generating AI analysis for ${leftArticle.outlet} vs ${rightArticle.outlet} (Enhanced: ${enhanced}, W5: ${includeW5})`)

    // Generate analysis - use enhanced method if requested
    const analysis = enhanced
      ? await AIService.analyzeArticlesEnhanced(leftArticle, rightArticle, includeW5)
      : await AIService.analyzeArticles(leftArticle, rightArticle)
    
    // Optionally save to database
    if (saveToDb) {
      const slug = await DatabaseService.generateUniqueSlug(
        `${leftArticle.title} vs ${rightArticle.title}`
      )
      
      const article = await DatabaseService.createArticle({
        title: await AIService.generateHeadline(leftArticle.title, rightArticle.title),
        slug,
        aiAnalysis: enhanced
          ? JSON.stringify(analysis)  // Store full enhanced analysis as JSON
          : (analysis as any).analysis,  // Legacy: store only analysis text
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
    
  } catch (error: any) {
    console.error('❌ AI analysis API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || String(error),
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
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || String(error) },
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
        content: article.rightSource.fullContent || undefined || article.rightSource.summary,
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
        fullContent: article.leftSource.fullContent || undefined,
        url: article.leftSource.url,
        author: article.leftSource.author || undefined,
        publishedAt: article.leftSource.publishedAt || undefined,
        bias: article.leftSource.bias as 'LEFT' | 'RIGHT' | 'CENTER'
      },
      rightSource: {
        outlet: article.rightSource.outlet,
        headline: article.rightSource.headline,
        summary: article.rightSource.summary,
        fullContent: article.rightSource.fullContent || undefined,
        url: article.rightSource.url,
        author: article.rightSource.author || undefined,
        publishedAt: article.rightSource.publishedAt || undefined,
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
    
  } catch (error: any) {
    console.error('❌ Analysis regeneration failed:', error)
    return NextResponse.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    )
  }
}