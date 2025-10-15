// Simple in-memory rate limiting
// In production, you'd want to use Redis or similar

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export async function rateLimit(
  identifier: string,
  limit: number = 100, // requests per window
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): Promise<RateLimitResult> {
  const now = Date.now()
  const resetTime = Math.ceil(now / windowMs) * windowMs
  
  const existing = rateLimitMap.get(identifier)
  
  // Clean up expired entries periodically
  if (Math.random() < 0.1) { // 10% chance
    cleanupExpiredEntries(now)
  }
  
  if (!existing || existing.resetTime <= now) {
    // First request in window or window expired
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime
    })
    
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: resetTime
    }
  }
  
  if (existing.count >= limit) {
    // Rate limit exceeded
    return {
      success: false,
      limit,
      remaining: 0,
      reset: existing.resetTime
    }
  }
  
  // Increment count
  existing.count++
  rateLimitMap.set(identifier, existing)
  
  return {
    success: true,
    limit,
    remaining: limit - existing.count,
    reset: existing.resetTime
  }
}

// Clean up expired rate limit entries
function cleanupExpiredEntries(now: number) {
  for (const [key, entry] of Array.from(rateLimitMap.entries())) {
    if (entry.resetTime <= now) {
      rateLimitMap.delete(key)
    }
  }
}

// Different rate limits for different endpoints
export const rateLimitConfigs = {
  // General API endpoints
  default: { limit: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 min
  
  // Newsletter signup (prevent spam)
  newsletter: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 requests per hour
  
  // Search endpoints (prevent abuse)
  search: { limit: 50, windowMs: 15 * 60 * 1000 }, // 50 requests per 15 min
  
  // AI analysis (expensive operations)
  ai: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 requests per hour
  
  // Analytics tracking (high volume expected)
  analytics: { limit: 200, windowMs: 15 * 60 * 1000 }, // 200 requests per 15 min
  
  // Automation endpoints (admin only, but still limit)
  automation: { limit: 20, windowMs: 60 * 60 * 1000 } // 20 requests per hour
}

// Rate limit by endpoint type
export async function rateLimitByType(
  identifier: string,
  type: keyof typeof rateLimitConfigs
): Promise<RateLimitResult> {
  const config = rateLimitConfigs[type] || rateLimitConfigs.default
  return rateLimit(identifier, config.limit, config.windowMs)
}

// Get current rate limit status without incrementing
export function getRateLimitStatus(
  identifier: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000
): RateLimitResult {
  const now = Date.now()
  const resetTime = Math.ceil(now / windowMs) * windowMs
  
  const existing = rateLimitMap.get(identifier)
  
  if (!existing || existing.resetTime <= now) {
    return {
      success: true,
      limit,
      remaining: limit,
      reset: resetTime
    }
  }
  
  return {
    success: existing.count < limit,
    limit,
    remaining: Math.max(0, limit - existing.count),
    reset: existing.resetTime
  }
}

// Reset rate limit for a specific identifier (admin function)
export function resetRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier)
}

// Get all current rate limit entries (for monitoring)
export function getAllRateLimits(): Array<{
  identifier: string
  count: number
  resetTime: number
}> {
  return Array.from(rateLimitMap.entries()).map(([identifier, entry]) => ({
    identifier,
    count: entry.count,
    resetTime: entry.resetTime
  }))
}