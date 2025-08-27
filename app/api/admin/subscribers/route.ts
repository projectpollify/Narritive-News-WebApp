import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'

// GET /api/admin/subscribers - Get subscriber list with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'active', 'inactive', 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')

    // Get subscribers with basic info
    const subscribers = await DatabaseService.getSubscribersList({
      status,
      limit,
      offset,
      search
    })

    // Transform for admin display
    const transformedSubscribers = subscribers.map(subscriber => ({
      id: subscriber.id,
      email: subscriber.email,
      subscribedAt: subscriber.subscribedAt.toISOString(),
      isActive: subscriber.isActive,
      preferences: subscriber.preferences,
      lastEmailSent: subscriber.lastEmailSent?.toISOString() || null
    }))

    return NextResponse.json({
      success: true,
      data: transformedSubscribers
    })

  } catch (error) {
    console.error('❌ Admin subscribers error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}

// POST /api/admin/subscribers - Bulk operations on subscribers
export async function POST(request: NextRequest) {
  try {
    const { action, subscriberIds, email } = await request.json()

    switch (action) {
      case 'bulk-unsubscribe':
        if (!subscriberIds || !Array.isArray(subscriberIds)) {
          return NextResponse.json(
            { success: false, error: 'subscriberIds array required' },
            { status: 400 }
          )
        }
        
        await DatabaseService.bulkUnsubscribe(subscriberIds)
        
        return NextResponse.json({
          success: true,
          message: `Unsubscribed ${subscriberIds.length} users`
        })

      case 'add-subscriber':
        if (!email) {
          return NextResponse.json(
            { success: false, error: 'Email required' },
            { status: 400 }
          )
        }
        
        const subscriber = await DatabaseService.addSubscriber(email)
        
        return NextResponse.json({
          success: true,
          data: subscriber
        })

      case 'export-subscribers':
        const allSubscribers = await DatabaseService.getSubscribersList({
          status: 'all',
          limit: 10000
        })
        
        return NextResponse.json({
          success: true,
          data: allSubscribers.map(sub => ({
            email: sub.email,
            subscribedAt: sub.subscribedAt.toISOString(),
            isActive: sub.isActive,
            categories: sub.preferences.categories.join(';'),
            frequency: sub.preferences.frequency
          }))
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('❌ Admin subscriber action error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}