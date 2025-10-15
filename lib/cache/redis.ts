import Redis from 'ioredis'

// Create Redis client with connection pooling
let redis: Redis | null = null

function getRedisClient(): Redis | null {
  // If Redis URL is not configured, return null (caching disabled)
  if (!process.env.REDIS_URL) {
    console.warn('⚠️ REDIS_URL not configured - caching disabled')
    return null
  }

  // Lazy initialization - create client only when needed
  if (!redis) {
    try {
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000)
          return delay
        },
        lazyConnect: true,
      })

      redis.on('error', (error) => {
        console.error('❌ Redis connection error:', error)
      })

      redis.on('connect', () => {
        console.log('✅ Redis connected successfully')
      })
    } catch (error) {
      console.error('❌ Failed to create Redis client:', error)
      return null
    }
  }

  return redis
}

export class CacheService {
  /**
   * Get cached value by key
   * Returns null if key doesn't exist or caching is disabled
   */
  static async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient()
    if (!client) return null

    try {
      const value = await client.get(key)
      if (!value) return null

      return JSON.parse(value) as T
    } catch (error) {
      console.error(`❌ Cache GET error for key "${key}":`, error)
      return null
    }
  }

  /**
   * Set cache with TTL (time-to-live) in seconds
   * Default TTL: 1 hour (3600 seconds)
   */
  static async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    const client = getRedisClient()
    if (!client) return

    try {
      const serialized = JSON.stringify(value)
      await client.setex(key, ttlSeconds, serialized)
    } catch (error) {
      console.error(`❌ Cache SET error for key "${key}":`, error)
    }
  }

  /**
   * Delete a specific cache key
   */
  static async del(key: string): Promise<void> {
    const client = getRedisClient()
    if (!client) return

    try {
      await client.del(key)
    } catch (error) {
      console.error(`❌ Cache DEL error for key "${key}":`, error)
    }
  }

  /**
   * Clear all keys matching a pattern
   * Example: clearPattern('articles:*') clears all article caches
   */
  static async clearPattern(pattern: string): Promise<void> {
    const client = getRedisClient()
    if (!client) return

    try {
      const keys = await client.keys(pattern)
      if (keys.length > 0) {
        await client.del(...keys)
        console.log(`🗑️ Cleared ${keys.length} cache keys matching "${pattern}"`)
      }
    } catch (error) {
      console.error(`❌ Cache CLEAR PATTERN error for pattern "${pattern}":`, error)
    }
  }

  /**
   * Check if a key exists in cache
   */
  static async exists(key: string): Promise<boolean> {
    const client = getRedisClient()
    if (!client) return false

    try {
      const result = await client.exists(key)
      return result === 1
    } catch (error) {
      console.error(`❌ Cache EXISTS error for key "${key}":`, error)
      return false
    }
  }

  /**
   * Get multiple keys at once
   */
  static async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const client = getRedisClient()
    if (!client || keys.length === 0) return []

    try {
      const values = await client.mget(...keys)
      return values.map((value) => (value ? JSON.parse(value) : null))
    } catch (error) {
      console.error('❌ Cache MGET error:', error)
      return []
    }
  }

  /**
   * Increment a counter in cache
   */
  static async incr(key: string, ttlSeconds?: number): Promise<number> {
    const client = getRedisClient()
    if (!client) return 0

    try {
      const value = await client.incr(key)
      if (ttlSeconds && value === 1) {
        // Set TTL only on first increment
        await client.expire(key, ttlSeconds)
      }
      return value
    } catch (error) {
      console.error(`❌ Cache INCR error for key "${key}":`, error)
      return 0
    }
  }

  /**
   * Close Redis connection (for graceful shutdown)
   */
  static async disconnect(): Promise<void> {
    if (redis) {
      await redis.quit()
      redis = null
      console.log('👋 Redis disconnected')
    }
  }

  /**
   * Check Redis health
   */
  static async healthCheck(): Promise<boolean> {
    const client = getRedisClient()
    if (!client) return false

    try {
      await client.ping()
      return true
    } catch (error) {
      console.error('❌ Redis health check failed:', error)
      return false
    }
  }
}

// Cache key builders for consistency
export const CacheKeys = {
  // Article caching
  articlesList: (category?: string, limit?: number, offset?: number) =>
    `articles:list:${category || 'all'}:${limit || 10}:${offset || 0}`,
  articleDetail: (slug: string) => `articles:detail:${slug}`,

  // RSS feed caching
  rssFeed: (feedUrl: string) => `rss:feed:${Buffer.from(feedUrl).toString('base64')}`,

  // AI analysis caching (using content hash)
  aiAnalysis: (contentHash: string) => `ai:analysis:${contentHash}`,

  // Analytics caching
  analyticsStats: (date: string) => `analytics:stats:${date}`,

  // Processed URLs tracking
  processedUrl: (urlHash: string) => `processed:url:${urlHash}`,

  // Newsletter caching
  newsletterLatest: () => `newsletter:latest`,
}
