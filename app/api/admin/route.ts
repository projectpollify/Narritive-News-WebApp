import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'
import { automation } from '@/lib/services/cron'
import { AIService } from '@/lib/services/ai'
import { EmailService } from '@/lib/services/email'

// GET /api/admin/stats - Get comprehensive system statistics
export async function GET() {
  try {
    // Get basic stats
    const basicStats = await DatabaseService.getStats()
    
    // Get automation status
    const automationStatus = automation.getStatus()
    
    // Get service health
    const [aiHealth, emailHealth] = await Promise.all([
      AIService.healthCheck(),
      EmailService.testEmailConfig()
    ])
    
    // Get newsletter stats
    const newsletterStats = await DatabaseService.getNewsletterStats()
    
    // Calculate additional metrics
    const recentArticles = await DatabaseService.getArticles({ limit: 10 })
    const lastAutomationRun = recentArticles.length > 0 
      ? recentArticles[0].createdAt.toISOString()
      : null

    const stats = {
      // Basic metrics
      articles: basicStats.articles,
      subscribers: basicStats.subscribers,
      totalViews: basicStats.totalViews,
      
      // System health
      automationStatus: automationStatus.isRunning ? 'running' : 'stopped',
      lastAutomationRun,
      emailHealth: emailHealth.success ? 'healthy' : 'error',
      aiHealth: aiHealth.status === 'healthy' ? 'healthy' : 'error',
      dbHealth: 'healthy', // Assume healthy if we can query
      
      // Newsletter metrics
      newsletterStats,
      
      // Performance metrics
      avgViewsPerArticle: basicStats.articles > 0 
        ? Math.round(basicStats.totalViews / basicStats.articles) 
        : 0,
      
      // Growth metrics (mock data - in production calculate from historical data)
      growth: {
        articlesThisWeek: Math.floor(Math.random() * 10) + 5,
        subscribersThisWeek: Math.floor(Math.random() * 50) + 20,
        viewsThisWeek: Math.floor(Math.random() * 1000) + 500
      }
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error: any) {
    console.error('❌ Admin stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch system stats' },
      { status: 500 }
    )
  }
}

// POST /api/admin/health-check - Run comprehensive health check
export async function POST() {
  try {
    const healthChecks = await Promise.allSettled([
      // Database health
      DatabaseService.getStats(),
      
      // AI service health
      AIService.healthCheck(),
      
      // Email service health
      EmailService.testEmailConfig(),
      
      // Automation health
      Promise.resolve(automation.getStatus())
    ])

    const services = [
      {
        name: 'Database',
        status: healthChecks[0].status === 'fulfilled' ? 'healthy' : 'error',
        description: 'Article and user data storage',
        details: healthChecks[0].status === 'fulfilled' 
          ? 'Connection successful' 
          : healthChecks[0].reason?.message
      },
      {
        name: 'AI Service',
        status: healthChecks[1].status === 'fulfilled' && healthChecks[1].value.status === 'healthy' 
          ? 'healthy' : 'error',
        description: 'OpenAI analysis generation',
        details: healthChecks[1].status === 'fulfilled' 
          ? healthChecks[1].value.message 
          : healthChecks[1].reason?.message
      },
      {
        name: 'Email Service',
        status: healthChecks[2].status === 'fulfilled' && healthChecks[2].value.success 
          ? 'healthy' : 'error',
        description: 'Newsletter delivery system',
        details: healthChecks[2].status === 'fulfilled' 
          ? healthChecks[2].value.message 
          : healthChecks[2].reason?.message
      },
      {
        name: 'Automation',
        status: healthChecks[3].status === 'fulfilled' && healthChecks[3].value.isRunning 
          ? 'healthy' : 'error',
        description: 'News scraping and processing',
        details: healthChecks[3].status === 'fulfilled' 
          ? `Automation is ${healthChecks[3].value.isRunning ? 'running' : 'stopped'}` 
          : 'Status check failed'
      }
    ]

    const overallHealth = services.every(s => s.status === 'healthy') ? 'healthy' : 'degraded'

    return NextResponse.json({
      success: true,
      data: {
        status: overallHealth,
        timestamp: new Date().toISOString(),
        services,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    })

  } catch (error: any) {
    console.error('❌ Health check error:', error)
    return NextResponse.json(
      { success: false, error: 'Health check failed' },
      { status: 500 }
    )
  }
}