import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from './rate-limit'

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
    totalPages: number
    currentPage: number
  }
}

// CORS headers for API routes
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

// Standard error handler for API routes
export function handleAPIError(error: any, context?: string): NextResponse<APIResponse> {
  console.error(`❌ API Error ${context ? `(${context})` : ''}:`, error)
  
  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  let statusCode = 500
  let message = 'Internal server error'
  
  // Handle specific error types
  if (error.code === 'P2002') {
    statusCode = 409
    message = 'Duplicate entry'
  } else if (error.code === 'P2025') {
    statusCode = 404
    message = 'Record not found'
  } else if (error.message === 'Email already subscribed') {
    statusCode = 409
    message = error.message
  } else if (isDevelopment) {
    message = error.message
  }
  
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(isDevelopment && { stack: error.stack })
    },
    { 
      status: statusCode,
      headers: corsHeaders()
    }
  )
}

// Rate limiting middleware
export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  identifier?: string
): Promise<NextResponse> {
  try {
    const limitKey = identifier || getClientIdentifier(request)
    const { success, limit, remaining, reset } = await rateLimit(limitKey)
    
    if (!success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded',
          retryAfter: reset
        },
        { 
          status: 429,
          headers: {
            ...corsHeaders(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString()
          }
        }
      )
    }
    
    const response = await handler()
    
    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', limit.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', reset.toString())
    
    return response
    
  } catch (error) {
    return handleAPIError(error, 'Rate Limiting')
  }
}

// Get client identifier for rate limiting
function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  const remote = request.headers.get('remote-addr')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (real) {
    return real
  }
  
  if (remote) {
    return remote
  }
  
  // Fallback for development
  return 'anonymous'
}

// Validation middleware
export function validateRequired<T>(
  data: any,
  requiredFields: (keyof T)[]
): { valid: boolean; missing?: string[] } {
  const missing = requiredFields.filter(field => 
    data[field] === undefined || data[field] === null || data[field] === ''
  ) as string[]
  
  return {
    valid: missing.length === 0,
    missing: missing.length > 0 ? missing : undefined
  }
}

// Cache headers helper
export function cacheHeaders(seconds: number = 300) {
  return {
    'Cache-Control': `public, s-maxage=${seconds}, stale-while-revalidate=${seconds * 2}`,
    'CDN-Cache-Control': `public, s-maxage=${seconds}`,
    'Vary': 'Accept-Encoding'
  }
}

// Success response helper
export function successResponse<T>(
  data: T,
  message?: string,
  pagination?: any
): NextResponse<APIResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    ...(message && { message }),
    ...(pagination && { pagination })
  }, {
    headers: corsHeaders()
  })
}

// Error response helper
export function errorResponse(
  error: string,
  status: number = 400
): NextResponse<APIResponse> {
  return NextResponse.json({
    success: false,
    error
  }, {
    status,
    headers: corsHeaders()
  })
}

// Async handler wrapper with error handling
export function withErrorHandling(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      return await handler(request, ...args)
    } catch (error) {
      return handleAPIError(error, 'API Handler')
    }
  }
}

// Request logging middleware
export function logRequest(request: NextRequest) {
  const timestamp = new Date().toISOString()
  const method = request.method
  const url = request.url
  const userAgent = request.headers.get('user-agent') || 'Unknown'
  const ip = getClientIdentifier(request)
  
  console.log(`📍 ${timestamp} | ${method} ${url} | IP: ${ip} | UA: ${userAgent}`)
}

// Health check response
export function healthResponse(checks: Record<string, boolean> = {}) {
  const allHealthy = Object.values(checks).every(Boolean)
  
  return NextResponse.json({
    success: true,
    data: {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks
    }
  }, {
    status: allHealthy ? 200 : 503,
    headers: corsHeaders()
  })
}