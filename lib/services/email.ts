import nodemailer from 'nodemailer'
import { DatabaseService } from '../db'
import { AIService } from './ai'

export interface EmailResult {
  success: boolean
  sent: number
  failed: number
  errors?: string[]
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null

  // Initialize email transporter
  static getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      })
    }
    return this.transporter
  }

  // Send daily newsletter to all active subscribers
  static async sendDailyNewsletter(): Promise<EmailResult> {
    console.log('📧 Starting daily newsletter campaign...')
    
    try {
      // Get active subscribers
      const subscribers = await DatabaseService.getActiveSubscribers()
      
      if (subscribers.length === 0) {
        console.log('📧 No active subscribers found')
        return { success: true, sent: 0, failed: 0 }
      }

      // Get today's top articles
      const articles = await DatabaseService.getArticles({
        limit: 5,
        offset: 0,
        published: true
      })

      if (articles.length === 0) {
        console.log('📧 No articles available for newsletter')
        return { success: true, sent: 0, failed: 0 }
      }

      // Generate newsletter content
      const newsletterContent = await this.generateNewsletterContent(articles)
      
      // Send emails in batches to avoid overwhelming SMTP server
      const batchSize = 50
      let sent = 0
      let failed = 0
      const errors: string[] = []

      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (subscriber) => {
          try {
            await this.sendNewsletterEmail(subscriber.email, newsletterContent)
            return { success: true, email: subscriber.email }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            console.error(`❌ Failed to send to ${subscriber.email}:`, errorMessage)
            return { success: false, email: subscriber.email, error: errorMessage }
          }
        })

        const batchResults = await Promise.allSettled(batchPromises)
        
        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            if (result.value.success) {
              sent++
            } else {
              failed++
              errors.push(`${result.value.email}: ${result.value.error}`)
            }
          } else {
            failed++
            errors.push(result.reason?.message || 'Unknown error')
          }
        }

        // Rate limiting between batches
        if (i + batchSize < subscribers.length) {
          await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
        }
      }

      console.log(`✅ Newsletter campaign complete: ${sent} sent, ${failed} failed`)
      
      // Update last email sent timestamps
      await this.updateLastEmailSent(subscribers.map(s => s.id))

      return {
        success: true,
        sent,
        failed,
        ...(errors.length > 0 && { errors })
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Newsletter campaign failed:', error)
      return {
        success: false,
        sent: 0,
        failed: 0,
        errors: [errorMessage]
      }
    }
  }

  // Generate newsletter HTML content
  static async generateNewsletterContent(articles: any[]): Promise<{
    subject: string
    html: string
    text: string
  }> {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const subject = `Narrative News - ${today}`

    // Generate article summaries
    const articleSummaries = await Promise.all(
      articles.slice(0, 3).map(async (article) => {
        const summary = await AIService.generateSummary(article.aiAnalysis, 200)
        return {
          ...article,
          summary
        }
      })
    )

    const html = this.generateNewsletterHTML(today, articleSummaries)
    const text = this.generateNewsletterText(today, articleSummaries)

    return { subject, html, text }
  }

  // Generate HTML email template
  static generateNewsletterHTML(date: string, articles: any[]): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Narrative News - ${date}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; text-align: center; }
        .header h1 { margin: 0; font-size: 2rem; }
        .header p { margin: 0.5rem 0 0; opacity: 0.9; }
        .content { padding: 2rem; }
        .article { margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid #e2e8f0; }
        .article:last-child { border-bottom: none; }
        .article h2 { color: #1a202c; margin: 0 0 1rem; font-size: 1.25rem; }
        .article .meta { color: #718096; font-size: 0.875rem; margin-bottom: 1rem; }
        .article .summary { margin-bottom: 1rem; }
        .perspectives { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
        .perspective { padding: 1rem; border-radius: 0.5rem; font-size: 0.875rem; }
        .perspective-left { background-color: #ebf8ff; border-left: 4px solid #3182ce; }
        .perspective-right { background-color: #fed7d7; border-left: 4px solid #e53e3e; }
        .perspective h4 { margin: 0 0 0.5rem; font-size: 0.875rem; font-weight: 600; }
        .cta { background-color: #667eea; color: white; padding: 1rem; text-align: center; margin: 1rem 0; border-radius: 0.5rem; }
        .cta a { color: white; text-decoration: none; font-weight: 600; }
        .footer { background-color: #1a202c; color: #a0aec0; padding: 2rem; font-size: 0.875rem; }
        .footer a { color: #63b3ed; text-decoration: none; }
        @media (max-width: 600px) {
            .perspectives { grid-template-columns: 1fr; }
            .content { padding: 1rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📰 Narrative News</h1>
            <p>Two Perspectives, One Truth • ${date}</p>
        </div>
        
        <div class="content">
            <p>Good morning! Here are today's top stories analyzed from multiple perspectives:</p>
            
            ${articles.map(article => `
                <div class="article">
                    <h2>${article.title}</h2>
                    <div class="meta">
                        ${article.category} • ${new Date(article.publishedAt).toLocaleDateString()}
                    </div>
                    <div class="summary">${article.summary}</div>
                    
                    <div class="perspectives">
                        <div class="perspective perspective-left">
                            <h4>${article.leftSource.outlet}</h4>
                            <p>${article.leftSource.headline}</p>
                        </div>
                        <div class="perspective perspective-right">
                            <h4>${article.rightSource.outlet}</h4>
                            <p>${article.rightSource.headline}</p>
                        </div>
                    </div>
                    
                    <div class="cta">
                        <a href="${process.env.SITE_URL}/article/${article.slug}">Read Full Analysis →</a>
                    </div>
                </div>
            `).join('')}
            
            <p style="text-align: center; margin: 2rem 0;">
                <a href="${process.env.SITE_URL}" style="color: #667eea; text-decoration: none; font-weight: 600;">
                    Visit Narrative News for more stories →
                </a>
            </p>
        </div>
        
        <div class="footer">
            <p>
                You're receiving this because you subscribed to Narrative News.<br>
                <a href="${process.env.SITE_URL}/unsubscribe?email={{EMAIL}}">Unsubscribe</a> | 
                <a href="${process.env.SITE_URL}">Visit Website</a>
            </p>
            <p style="margin-top: 1rem;">
                © 2024 Narrative News. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`
  }

  // Generate plain text email version
  static generateNewsletterText(date: string, articles: any[]): string {
    return `
NARRATIVE NEWS - ${date}
Two Perspectives, One Truth

Good morning! Here are today's top stories analyzed from multiple perspectives:

${articles.map(article => `
${article.title}
${article.category} • ${new Date(article.publishedAt).toLocaleDateString()}

${article.summary}

Left Perspective (${article.leftSource.outlet}):
${article.leftSource.headline}

Right Perspective (${article.rightSource.outlet}):
${article.rightSource.headline}

Read full analysis: ${process.env.SITE_URL}/article/${article.slug}

---
`).join('')}

Visit Narrative News for more stories: ${process.env.SITE_URL}

---
You're receiving this because you subscribed to Narrative News.
Unsubscribe: ${process.env.SITE_URL}/unsubscribe?email={{EMAIL}}

© 2024 Narrative News. All rights reserved.
`
  }

  // Send individual newsletter email
  static async sendNewsletterEmail(
    email: string, 
    content: { subject: string; html: string; text: string }
  ) {
    const transporter = this.getTransporter()
    
    const personalizedHtml = content.html.replace(/{{EMAIL}}/g, email)
    const personalizedText = content.text.replace(/{{EMAIL}}/g, email)
    
    await transporter.sendMail({
      from: `"Narrative News" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: content.subject,
      text: personalizedText,
      html: personalizedHtml,
      headers: {
        'List-Unsubscribe': `<${process.env.SITE_URL}/unsubscribe?email=${email}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      }
    })
  }

  // Send welcome email to new subscribers
  static async sendWelcomeEmail(email: string): Promise<void> {
    const transporter = this.getTransporter()
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 500px; margin: 0 auto; padding: 2rem; }
        .header { text-align: center; margin-bottom: 2rem; }
        .welcome { background: #f8fafc; padding: 1.5rem; border-radius: 0.5rem; margin: 1rem 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #667eea;">📰 Welcome to Narrative News!</h1>
        </div>
        
        <div class="welcome">
            <p><strong>Thank you for subscribing!</strong></p>
            <p>You'll now receive our daily analysis showing how different news outlets cover the same stories. Our AI helps you understand the differences in perspective and framing.</p>
        </div>
        
        <p>Here's what to expect:</p>
        <ul>
            <li>📧 Daily email with top analyzed stories</li>
            <li>🔍 Side-by-side comparisons of different outlets</li>
            <li>🤖 AI-powered analysis of media framing</li>
            <li>📈 Completely unbiased perspective</li>
        </ul>
        
        <p>Your first newsletter will arrive tomorrow morning!</p>
        
        <p style="text-align: center; margin-top: 2rem;">
            <a href="${process.env.SITE_URL}" style="background: #667eea; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.5rem;">
                Visit Narrative News
            </a>
        </p>
        
        <p style="font-size: 0.875rem; color: #718096; text-align: center; margin-top: 2rem;">
            <a href="${process.env.SITE_URL}/unsubscribe?email=${email}">Unsubscribe</a> anytime if this isn't for you.
        </p>
    </div>
</body>
</html>`

    const text = `
Welcome to Narrative News!

Thank you for subscribing! You'll now receive our daily analysis showing how different news outlets cover the same stories.

Here's what to expect:
• Daily email with top analyzed stories  
• Side-by-side comparisons of different outlets
• AI-powered analysis of media framing
• Completely unbiased perspective

Your first newsletter will arrive tomorrow morning!

Visit: ${process.env.SITE_URL}
Unsubscribe: ${process.env.SITE_URL}/unsubscribe?email=${email}
`

    await transporter.sendMail({
      from: `"Narrative News" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Welcome to Narrative News! 📰',
      text,
      html
    })
  }

  // Update last email sent timestamp for subscribers
  static async updateLastEmailSent(subscriberIds: string[]): Promise<void> {
    await DatabaseService.updateSubscribersLastEmail(subscriberIds)
  }

  // Test email configuration
  static async testEmailConfig(): Promise<{ success: boolean; message: string }> {
    try {
      const transporter = this.getTransporter()
      await transporter.verify()
      
      return {
        success: true,
        message: 'Email configuration is working correctly'
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        message: `Email configuration error: ${errorMessage}`
      }
    }
  }

  // Send test email
  static async sendTestEmail(toEmail: string): Promise<void> {
    const transporter = this.getTransporter()
    
    await transporter.sendMail({
      from: `"Narrative News Test" <${process.env.EMAIL_FROM}>`,
      to: toEmail,
      subject: 'Narrative News - Email Test',
      text: 'This is a test email from Narrative News. If you received this, email configuration is working!',
      html: `
        <div style="font-family: sans-serif; padding: 2rem; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #667eea;">✅ Email Test Successful!</h2>
          <p>This is a test email from Narrative News.</p>
          <p>If you received this, your email configuration is working correctly!</p>
          <p style="margin-top: 2rem; font-size: 0.875rem; color: #666;">
            Sent at: ${new Date().toISOString()}
          </p>
        </div>
      `
    })
  }
}