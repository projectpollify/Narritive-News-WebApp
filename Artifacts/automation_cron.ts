import { CronJob } from 'cron'
import { NewsScraper } from './scraper'
import { EmailService } from './email'

export class AutomationScheduler {
  private newsJob: CronJob | null = null
  private emailJob: CronJob | null = null
  private isRunning = false
  
  // Start all automation jobs
  start() {
    if (this.isRunning) {
      console.log('⚠️ Automation already running')
      return
    }
    
    console.log('🚀 Starting automation scheduler...')
    
    // News scraping job - runs every 6 hours
    this.newsJob = new CronJob(
      '0 */6 * * *', // At minute 0 past every 6th hour
      this.runNewsAutomation.bind(this),
      null,
      true, // Start immediately
      'America/New_York'
    )
    
    // Email newsletter job - runs daily at 8 AM EST
    this.emailJob = new CronJob(
      '0 8 * * *', // At 8:00 AM every day
      this.runEmailCampaign.bind(this),
      null,
      true,
      'America/New_York'
    )
    
    this.isRunning = true
    console.log('✅ Automation scheduler started')
    console.log('📰 News scraping: Every 6 hours')
    console.log('📧 Email newsletters: Daily at 8 AM EST')
  }
  
  // Stop all automation jobs
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Automation not running')
      return
    }
    
    console.log('🛑 Stopping automation scheduler...')
    
    if (this.newsJob) {
      this.newsJob.stop()
      this.newsJob = null
    }
    
    if (this.emailJob) {
      this.emailJob.stop()
      this.emailJob = null
    }
    
    this.isRunning = false
    console.log('✅ Automation scheduler stopped')
  }
  
  // Get automation status
  getStatus() {
    return {
      isRunning: this.isRunning,
      newsJobActive: this.newsJob?.running || false,
      emailJobActive: this.emailJob?.running || false,
      nextNewsRun: this.newsJob?.nextDate()?.toISOString() || null,
      nextEmailRun: this.emailJob?.nextDate()?.toISOString() || null
    }
  }
  
  // Manual trigger for news automation
  async triggerNewsAutomation() {
    console.log('🔄 Manually triggering news automation...')
    return await this.runNewsAutomation()
  }
  
  // Manual trigger for email campaign
  async triggerEmailCampaign() {
    console.log('📧 Manually triggering email campaign...')
    return await this.runEmailCampaign()
  }
  
  // Run news scraping and analysis
  private async runNewsAutomation() {
    const startTime = Date.now()
    console.log(`📰 Starting news automation at ${new Date().toISOString()}`)
    
    try {
      // Check if automation is enabled
      if (process.env.ENABLE_AUTOMATION !== 'true') {
        console.log('⏸️ Automation disabled in environment variables')
        return { success: false, message: 'Automation disabled' }
      }
      
      const result = await NewsScraper.runAutomation()
      const duration = Date.now() - startTime
      
      console.log(`✅ News automation completed in ${duration}ms`)
      console.log(`📊 Result: ${result.processed}/${result.total} articles processed`)
      
      // Log automation stats (optional)
      await this.logAutomationRun('news', result, duration)
      
      return result
      
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ News automation failed after ${duration}ms:`, error)
      
      await this.logAutomationRun('news', { success: false, error: error.message }, duration)
      
      return { success: false, error: error.message }
    }
  }
  
  // Run daily email newsletter
  private async runEmailCampaign() {
    const startTime = Date.now()
    console.log(`📧 Starting email campaign at ${new Date().toISOString()}`)
    
    try {
      // Check if email service is configured
      if (!process.env.EMAIL_SERVER_USER) {
        console.log('⏸️ Email service not configured')
        return { success: false, message: 'Email service not configured' }
      }
      
      const result = await EmailService.sendDailyNewsletter()
      const duration = Date.now() - startTime
      
      console.log(`✅ Email campaign completed in ${duration}ms`)
      console.log(`📊 Result: ${result.sent} emails sent`)
      
      await this.logAutomationRun('email', result, duration)
      
      return result
      
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ Email campaign failed after ${duration}ms:`, error)
      
      await this.logAutomationRun('email', { success: false, error: error.message }, duration)
      
      return { success: false, error: error.message }
    }
  }
  
  // Log automation run results (simple console logging for now)
  private async logAutomationRun(type: 'news' | 'email', result: any, duration: number) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      success: result.success,
      duration,
      details: result
    }
    
    // In a production environment, you might want to save this to a database
    // or send to a logging service like Winston or Pino
    console.log('📊 Automation Log:', JSON.stringify(logEntry, null, 2))
  }
  
  // Health check for automation system
  async healthCheck() {
    const status = this.getStatus()
    
    const health = {
      status: this.isRunning ? 'healthy' : 'stopped',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      automation: status,
      environment: {
        automationEnabled: process.env.ENABLE_AUTOMATION === 'true',
        emailConfigured: !!process.env.EMAIL_SERVER_USER,
        databaseConnected: true // Could add actual DB ping here
      }
    }
    
    return health
  }
}

// Global automation instance
export const automation = new AutomationScheduler()

// Auto-start in production
if (process.env.NODE_ENV === 'production' && process.env.ENABLE_AUTOMATION === 'true') {
  automation.start()
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('📴 Received SIGTERM, stopping automation...')
    automation.stop()
    process.exit(0)
  })
  
  process.on('SIGINT', () => {
    console.log('📴 Received SIGINT, stopping automation...')
    automation.stop()
    process.exit(0)
  })
}