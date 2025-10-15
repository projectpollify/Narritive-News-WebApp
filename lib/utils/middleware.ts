import { NextRequest, NextResponse } from 'next/server'
import { rateLimitByType, rateLimitConfigs } from './rate-limit'
import { rateLimitResponse } from './error-handler'

export { rateLimitConfigs }

// Middleware wrapper for rate limiting
export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  limitType: keyof typeof rateLimitConfigs = 'default'
): Promise<NextResponse> {
  // Get identifier (IP address or user ID)
  const identifier = request.ip || request.headers.get('x-forwarded-for') || 'anonymous'

  // Check rate limit
  const result = await rateLimitByType(identifier, limitType)

  // Add rate limit headers to response
  const addRateLimitHeaders = (response: NextResponse) => {
    response.headers.set('X-RateLimit-Limit', result.limit.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.reset.toString())
    return response
  }

  // If rate limit exceeded, return error
  if (!result.success) {
    return addRateLimitHeaders(rateLimitResponse())
  }

  // Execute handler
  const response = await handler()
  return addRateLimitHeaders(response)
}
