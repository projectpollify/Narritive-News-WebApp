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
        return unauthorizedResponse()
      }

      // Vercel Cron sends Authorization header with the secret
      if (authHeader !== `Bearer ${cronSecret}`) {
        logger.warn('Unauthorized cron attempt', {
          authHeader: authHeader ? 'present' : 'missing',
        })
        return unauthorizedResponse()
      }
    }

    logger.cronJob('rss-scraping', 'started')

    // Import dynamically to avoid circular dependencies
    const { NewsScraper } = await import('@/lib/services/scraper')

    // Run the full automation pipeline
    logger.info('Starting news automation pipeline...')
    const startTime = Date.now()

    const result = await NewsScraper.runAutomation()
    const totalDuration = Date.now() - startTime

    if (!result.success) {
      logger.cronJob('rss-scraping', 'failed', {
        error: result.error,
        duration: `${totalDuration}ms`,
      })
      return handleError(new Error(result.error || 'Automation failed'), {
        endpoint: '/api/automation/cron',
      })
    }

    logger.cronJob('rss-scraping', 'completed', {
      processed: result.processed,
      total: result.total,
      duration: `${totalDuration}ms`,
    })

    return successResponse({
      message: 'Cron job executed successfully',
      stats: {
        articlesProcessed: result.processed,
        totalMatched: result.total,
        durationMs: totalDuration,
      },
    })
  } catch (error: any) {
    logger.cronJob('rss-scraping', 'failed', {
      error: error instanceof Error ? error?.message || String(error) : String(error),
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
