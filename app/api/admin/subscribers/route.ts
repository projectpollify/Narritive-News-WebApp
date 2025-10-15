import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'

// GET /api/admin/subscribers - Get subscriber list with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')
    const status = (statusParam === 'active' || statusParam === 'inactive' || statusParam === 'all')
      ? statusParam
      : 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || undefined

    // Get subscribers with basic info
    const result = await DatabaseService.getSubscribersList({
      status,
      limit,
      offset,
      search
    })

    const subscribers = result.subscribers

    // Transform for admin display
    const transformedSubscribers = subscribers.map(subscriber => ({
      id: subscriber.id,
      email: subscriber.email,
      name: subscriber.name,
      subscribedAt: subscriber.subscribedAt.toISOString(),
      isActive: subscriber.isActive
    }))

    return NextResponse.json({
      success: true,
      data: transformedSubscribers
    })

  } catch (error: any) {
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
        const allResult = await DatabaseService.getSubscribersList({
          status: 'all',
          limit: 10000
        })

        return NextResponse.json({
          success: true,
          data: allResult.subscribers.map(sub => ({
            email: sub.email,
            name: sub.name,
            subscribedAt: sub.subscribedAt.toISOString(),
            isActive: sub.isActive
          }))
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('❌ Admin subscriber action error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}