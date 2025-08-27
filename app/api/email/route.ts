import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email'
import { withRateLimit, rateLimitConfigs } from '@/lib/middleware'

// POST /api/email/test - Send test email
export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      try {
        const { action, email } = await request.json()
        
        switch (action) {
          case 'test-config':
            const configTest = await EmailService.testEmailConfig()
            return NextResponse.json({
              success: true,
              data: configTest
            })
          
          case 'send-test':
            if (!email) {
              return NextResponse.json(
                { success: false, error: 'Email address required for test' },
                { status: 400 }
              )
            }
            
            await EmailService.sendTestEmail(email)
            return NextResponse.json({
              success: true,
              message: `Test email sent to ${email}`
            })
          
          case 'send-welcome':
            if (!email) {
              return NextResponse.json(
                { success: false, error: 'Email address required for welcome email' },
                { status: 400 }
              )
            }
            
            await EmailService.sendWelcomeEmail(email)
            return NextResponse.json({
              success: true,
              message: `Welcome email sent to ${email}`
            })
          
          case 'send-newsletter':
            const result = await EmailService.sendDailyNewsletter()
            return NextResponse.json({
              success: true,
              data: result
            })
          
          default:
            return NextResponse.json(
              { success: false, error: 'Invalid action' },
              { status: 400 }
            )
        }
      } catch (error) {
        console.error('❌ Email API error:', error)
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        )
      }
    },
    'email-test'
  )
}

// GET /api/email/health - Check email service health
export async function GET() {
  try {
    const health = await EmailService.testEmailConfig()
    
    return NextResponse.json({
      success: true,
      data: {
        emailConfigured: !!process.env.EMAIL_SERVER_USER,
        smtpHost: process.env.EMAIL_SERVER_HOST || 'Not configured',
        fromAddress: process.env.EMAIL_FROM || 'Not configured',
        serviceHealth: health
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}