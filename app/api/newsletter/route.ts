import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'
import { z } from 'zod'

// Validation schema
const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  preferences: z.object({
    categories: z.array(z.string()).optional(),
    frequency: z.enum(['daily', 'weekly']).optional(),
    timezone: z.string().optional()
  }).optional()
})

// POST /api/newsletter - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = subscribeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }
    
    const { email } = validation.data

    // Check if already subscribed
    const existingSubscriber = await DatabaseService.getSubscriberByEmail(email)
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json({
          success: false,
          error: 'Email already subscribed'
        }, { status: 409 })
      } else {
        // Reactivate existing subscriber
        await DatabaseService.reactivateSubscriber(email)
        return NextResponse.json({
          success: true,
          message: 'Successfully resubscribed!'
        })
      }
    }

    // Add new subscriber
    const subscriber = await DatabaseService.addSubscriber(email)
    
    // Log subscription for analytics
    console.log(`📧 New subscriber: ${email}`)
    
    // TODO: Send welcome email
    // await EmailService.sendWelcomeEmail(email)
    
    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed! Welcome to Narrative News.',
      data: {
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt
      }
    })
    
  } catch (error: any) {
    console.error('❌ Newsletter subscription error:', error)
    
    if (error?.message || String(error) === 'Email already subscribed') {
      return NextResponse.json(
        { success: false, error: 'Email already subscribed' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    )
  }
}

// GET /api/newsletter - Get newsletter stats (for admin)
export async function GET() {
  try {
    const stats = await DatabaseService.getNewsletterStats()
    
    return NextResponse.json({
      success: true,
      data: stats
    })
    
  } catch (error: any) {
    console.error('❌ Newsletter stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get newsletter stats' },
      { status: 500 }
    )
  }
}

// DELETE /api/newsletter - Unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const token = searchParams.get('token') // For secure unsubscribe links
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailValidation = z.string().email().safeParse(email)
    if (!emailValidation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    // TODO: Validate unsubscribe token for security
    // if (token && !validateUnsubscribeToken(email, token)) {
    //   return NextResponse.json(
    //     { success: false, error: 'Invalid unsubscribe token' },
    //     { status: 403 }
    //   )
    // }
    
    // Unsubscribe user
    const result = await DatabaseService.unsubscribeEmail(email)
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Email not found' },
        { status: 404 }
      )
    }
    
    console.log(`📧 Unsubscribed: ${email}`)
    
    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed'
    })
    
  } catch (error: any) {
    console.error('❌ Newsletter unsubscribe error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe' },
      { status: 500 }
    )
  }
}