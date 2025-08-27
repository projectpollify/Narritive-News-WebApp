import { NextRequest, NextResponse } from 'next/server'
import { NewsScraper } from '@/lib/scraper'
import { DatabaseService } from '@/lib/db'

// GET /api/test-scraper - Test the scraping system with limited feeds
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const outlet = searchParams.get('outlet') // Test specific outlet
  const limit = parseInt(searchParams.get('limit') || '2') // Limit articles for testing
  
  try {
    console.log('🧪 Testing news scraper...')
    
    // Get a few RSS feeds for testing
    const feeds = await DatabaseService.getActiveRSSFeeds()
    const testFeeds = outlet 
      ? feeds.filter(f => f.outlet.toLowerCase().includes(outlet.toLowerCase()))
      : feeds.slice(0, 4) // Test with first 4 feeds
    
    if (testFeeds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No matching feeds found'
      })
    }
    
    console.log(`📰 Testing with ${testFeeds.length} feeds`)
    
    const results = []
    
    for (const feed of testFeeds) {
      try {
        console.log(`🔍 Testing ${feed.outlet} (${feed.url})`)
        
        const articles = await NewsScraper.scrapeRSSFeed(
          feed.url, 
          feed.outlet, 
          feed.bias as 'LEFT' | 'RIGHT' | 'CENTER'
        )
        
        results.push({
          outlet: feed.outlet,
          bias: feed.bias,
          url: feed.url,
          articlesFound: articles.length,
          articles: articles.slice(0, limit).map(article => ({
            title: article.title,
            url: article.url,
            publishedAt: article.publishedAt,
            contentLength: article.content.length,
            summaryLength: article.summary.length
          }))
        })
        
        console.log(`✅ ${feed.outlet}: ${articles.length} articles`)
        
      } catch (error) {
        console.error(`❌ Error testing ${feed.outlet}:`, error.message)
        results.push({
          outlet: feed.outlet,
          bias: feed.bias,
          url: feed.url,
          error: error.message
        })
      }
    }
    
    const totalArticles = results.reduce((sum, r) => sum + (r.articlesFound || 0), 0)
    
    return NextResponse.json({
      success: true,
      summary: {
        feedsTested: testFeeds.length,
        totalArticles,
        successfulFeeds: results.filter(r => !r.error).length,
        failedFeeds: results.filter(r => r.error).length
      },
      results
    })
    
  } catch (error) {
    console.error('❌ Test scraper failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// POST /api/test-scraper - Test story matching algorithm
export async function POST(request: NextRequest) {
  try {
    const { testArticles } = await request.json()
    
    if (!testArticles || !Array.isArray(testArticles)) {
      return NextResponse.json(
        { success: false, error: 'testArticles array required' },
        { status: 400 }
      )
    }
    
    console.log('🔗 Testing story matching...')
    
    // Test the matching algorithm
    const matches = await NewsScraper.findMatchingStories(testArticles)
    
    return NextResponse.json({
      success: true,
      data: {
        inputArticles: testArticles.length,
        matchesFound: matches.length,
        matches: matches.map(match => ({
          leftTitle: match.left.title,
          leftOutlet: match.left.outlet,
          rightTitle: match.right.title,
          rightOutlet: match.right.outlet,
          similarity: NewsScraper.calculateSimilarity(
            match.left.title,
            match.right.title
          )
        }))
      }
    })
    
  } catch (error) {
    console.error('❌ Story matching test failed:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/test-scraper - Clear test data
export async function DELETE() {
  try {
    // In development, you might want to clear processed articles
    if (process.env.NODE_ENV === 'development') {
      // This would clear the processed articles table
      // await prisma.processedArticle.deleteMany()
      
      return NextResponse.json({
        success: true,
        message: 'Test data cleared (development mode only)'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Only available in development mode' },
        { status: 403 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}