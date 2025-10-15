import { NextRequest, NextResponse } from 'next/server'
import { automation } from '@/lib/services/cron'
import { NewsScraper } from '@/lib/services/scraper'

// GET /api/automation - Get automation status
export async function GET() {
  try {
    const status = automation.getStatus()
    const health = await automation.healthCheck()
    
    return NextResponse.json({
      success: true,
      data: {
        ...status,
        health
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to get automation status' },
      { status: 500 }
    )
  }
}

// POST /api/automation - Control automation system
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    switch (action) {
      case 'start':
        automation.start()
        return NextResponse.json({
          success: true,
          message: 'Automation started'
        })
      
      case 'stop':
        automation.stop()
        return NextResponse.json({
          success: true,
          message: 'Automation stopped'
        })
      
      case 'trigger-news':
        const newsResult = await automation.triggerNewsAutomation()
        return NextResponse.json({
          success: true,
          data: newsResult
        })
      
      case 'trigger-email':
        const emailResult = await automation.triggerEmailCampaign()
        return NextResponse.json({
          success: true,
          data: emailResult
        })
      
      case 'health-check':
        const health = await automation.healthCheck()
        return NextResponse.json({
          success: true,
          data: health
        })
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    )
  }
}

// PUT /api/automation - Update automation settings
export async function PUT(request: NextRequest) {
  try {
    const { settings } = await request.json()
    
    // In a real implementation, you'd save these settings to database
    // and update the automation scheduler accordingly
    
    return NextResponse.json({
      success: true,
      message: 'Settings updated',
      data: settings
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}