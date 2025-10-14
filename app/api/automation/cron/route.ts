import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { logger } from '@/lib/utils/logger'
import { successResponse, handleError, unauthorizedResponse } from '@/lib/utils/error-handler'

// This endpoint is called by Vercel Cron
// It triggers the RSS scraping and article analysis pipeline
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // In production, verify the cron secret
    if (process.env.NODE_ENV === 'production') {
      if (!cronSecret) {
        logger.error('CRON_SECRET not configured')
        return unauthorizedResponse('Cron secret not configured')
      }

      // Vercel Cron sends Authorization header with the secret
      if (authHeader !== `Bearer ${cronSecret}`) {
        logger.warn('Unauthorized cron attempt', {
          authHeader: authHeader ? 'present' : 'missing',
        })
        return unauthorizedResponse('Unauthorized')
      }
    }

    logger.cronJob('rss-scraping', 'started')

    // Import dynamically to avoid circular dependencies
    const { scrapeRSSFeeds, matchStories } = await import('@/lib/services/scraper')
    const { analyzeArticlePairs } = await import('@/lib/services/ai')

    // Step 1: Scrape RSS feeds
    logger.info('Starting RSS scraping...')
    const startTime = Date.now()

    const scrapedArticles = await scrapeRSSFeeds()
    const scrapingDuration = Date.now() - startTime

    logger.info(`RSS scraping completed: ${scrapedArticles.length} articles`, {
      duration: `${scrapingDuration}ms`,
    })

    // Step 2: Match stories (left vs right)
    logger.info('Starting story matching...')
    const matchStartTime = Date.now()

    const leftArticles = scrapedArticles.filter((a) => a.bias === 'LEFT')
    const rightArticles = scrapedArticles.filter((a) => a.bias === 'RIGHT')

    const matches = await matchStories(leftArticles, rightArticles)
    const matchingDuration = Date.now() - matchStartTime

    logger.info(`Story matching completed: ${matches.length} matches`, {
      duration: `${matchingDuration}ms`,
    })

    // Step 3: Analyze matched pairs with AI (limit to first 5 to avoid timeout)
    logger.info('Starting AI analysis...')
    const aiStartTime = Date.now()

    const matchesToAnalyze = matches.slice(0, 5) // Limit to avoid timeout
    const analyzedArticles = await analyzeArticlePairs(matchesToAnalyze)
    const aiDuration = Date.now() - aiStartTime

    logger.info(`AI analysis completed: ${analyzedArticles.length} articles`, {
      duration: `${aiDuration}ms`,
    })

    const totalDuration = Date.now() - startTime

    logger.cronJob('rss-scraping', 'completed', {
      scraped: scrapedArticles.length,
      matched: matches.length,
      analyzed: analyzedArticles.length,
      duration: `${totalDuration}ms`,
    })

    return successResponse({
      message: 'Cron job executed successfully',
      stats: {
        articlesScraped: scrapedArticles.length,
        storiesMatched: matches.length,
        articlesAnalyzed: analyzedArticles.length,
        durationMs: totalDuration,
      },
    })
  } catch (error) {
    logger.cronJob('rss-scraping', 'failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    return handleError(error, {
      endpoint: '/api/automation/cron',
    })
  }
}

// For manual testing (requires authentication)
export async function POST(request: NextRequest) {
  // Reuse the same logic as GET
  return GET(request)
}
