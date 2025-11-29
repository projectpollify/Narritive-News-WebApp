import { PrismaClient } from '@prisma/client'
import { CacheService, CacheKeys } from '@/lib/cache/redis'
import { BlockchainClient } from '@/lib/blockchain/client'

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Export as 'db' for backwards compatibility
export const db = prisma

// Database utility functions
export class DatabaseService {

  // Article operations
  static async createArticle(data: {
    title: string
    slug: string
    aiAnalysis: string
    category: string
    tags?: string[]
    publishedAt: Date
    leftSource: {
      outlet: string
      headline: string
      summary: string
      fullContent?: string
      url: string
      author?: string
      publishedAt?: Date
      bias: 'LEFT' | 'RIGHT' | 'CENTER'
    }
    rightSource: {
      outlet: string
      headline: string
      summary: string
      fullContent?: string
      url: string
      author?: string
      publishedAt?: Date
      bias: 'LEFT' | 'RIGHT' | 'CENTER'
    }
  }) {
    // Generate blockchain hash and anchor
    const contentHash = BlockchainClient.hashArticle({
      title: data.title,
      content: data.aiAnalysis,
      publishedAt: data.publishedAt
    })

    // In a real app, we might want to do this asynchronously or via a queue
    // to avoid delaying the response, but for now we'll await it
    const { transactionId, timestamp } = await BlockchainClient.anchorToBlockchain(contentHash)

    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        aiAnalysis: data.aiAnalysis,
        category: data.category,
        tags: data.tags || [],
        publishedAt: data.publishedAt,
        isPublished: true,
        contentHash,
        onChainTx: transactionId,
        onChainTimestamp: timestamp,
        leftSource: {
          create: {
            outlet: data.leftSource.outlet,
            headline: data.leftSource.headline,
            summary: data.leftSource.summary,
            fullContent: data.leftSource.fullContent,
            url: data.leftSource.url,
            author: data.leftSource.author,
            publishedAt: data.leftSource.publishedAt,
            bias: data.leftSource.bias as any,
            sourceType: 'RSS'
          }
        },
        rightSource: {
          create: {
            outlet: data.rightSource.outlet,
            headline: data.rightSource.headline,
            summary: data.rightSource.summary,
            fullContent: data.rightSource.fullContent,
            url: data.rightSource.url,
            author: data.rightSource.author,
            publishedAt: data.rightSource.publishedAt,
            bias: data.rightSource.bias as any,
            sourceType: 'RSS'
          }
        }
      },
      include: {
        leftSource: true,
        rightSource: true
      }
    })

    // Invalidate article list caches when new article is created
    await CacheService.clearPattern('articles:list:*')

    return article
  }

  static async getArticles(filters?: {
    category?: string
    limit?: number
    offset?: number
    published?: boolean
  }) {
    const { category, limit = 10, offset = 0, published = true } = filters || {}

    // Try cache first
    const cacheKey = CacheKeys.articlesList(category, limit, offset)
    const cached = await CacheService.get<any[]>(cacheKey)
    if (cached) {
      return cached
    }

    // Query database
    const articles = await prisma.article.findMany({
      where: {
        ...(category && { category }),
        isPublished: published
      },
      include: {
        leftSource: true,
        rightSource: true
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Cache for 15 minutes (900 seconds)
    await CacheService.set(cacheKey, articles, 900)

    return articles
  }

  static async getArticleBySlug(slug: string) {
    // Try cache first
    const cacheKey = CacheKeys.articleDetail(slug)
    const cached = await CacheService.get<any>(cacheKey)
    if (cached) {
      // Still increment view count even for cached responses
      await prisma.article.update({
        where: { id: (cached as any).id },
        data: { viewCount: { increment: 1 } }
      })
      return cached
    }

    // Query database
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        leftSource: true,
        rightSource: true
      }
    })

    if (article) {
      // Increment view count
      await prisma.article.update({
        where: { id: article.id },
        data: { viewCount: { increment: 1 } }
      })

      // Cache for 1 hour (3600 seconds)
      await CacheService.set(cacheKey, article, 3600)
    }

    return article
  }

  static async getArticleById(id: string) {
    return await prisma.article.findUnique({
      where: { id },
      include: {
        leftSource: true,
        rightSource: true
      }
    })
  }

  // Subscriber operations
  static async addSubscriber(email: string, name?: string) {
    try {
      return await prisma.subscriber.create({
        data: {
          email,
          name
        }
      })
    } catch (error: any) {
      // Handle duplicate email
      if (error?.code === 'P2002') {
        throw new Error('Email already subscribed')
      }
      throw error
    }
  }

  static async getActiveSubscribers() {
    return await prisma.subscriber.findMany({
      where: { isActive: true }
    })
  }

  static async unsubscribeEmail(email: string) {
    return await prisma.subscriber.update({
      where: { email },
      data: { isActive: false }
    })
  }

  // RSS Feed operations
  static async addRSSFeed(data: {
    name: string
    url: string
    outlet: string
    bias: 'LEFT' | 'RIGHT' | 'CENTER'
  }) {
    return await prisma.rSSFeed.create({
      data: {
        name: data.name,
        url: data.url,
        outlet: data.outlet,
        bias: data.bias as any
      }
    })
  }

  static async getActiveRSSFeeds() {
    return await prisma.rSSFeed.findMany({
      where: { isActive: true }
    })
  }

  static async updateFeedLastChecked(id: string) {
    // RSSFeed model doesn't have lastChecked field
    // Update the updatedAt timestamp instead
    return await prisma.rSSFeed.update({
      where: { id },
      data: { updatedAt: new Date() }
    })
  }

  // Processed articles (to avoid duplicates)
  static async markArticleAsProcessed(url: string, title: string, outlet: string) {
    return await prisma.processedArticle.create({
      data: { url, title, outlet }
    })
  }

  static async isArticleProcessed(url: string) {
    const existing = await prisma.processedArticle.findUnique({
      where: { url }
    })
    return !!existing
  }

  // Analytics
  static async recordArticleView(articleId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.articleAnalytics.upsert({
      where: {
        articleId_date: {
          articleId,
          date: today
        }
      },
      update: {
        views: { increment: 1 }
      },
      create: {
        articleId,
        views: 1,
        date: today
      }
    })
  }

  static async recordSourceClick(articleId: string, sourceType: 'left' | 'right') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const updateData = sourceType === 'left'
      ? { leftClicks: { increment: 1 } }
      : { rightClicks: { increment: 1 } }

    await prisma.articleAnalytics.upsert({
      where: {
        articleId_date: {
          articleId,
          date: today
        }
      },
      update: updateData,
      create: {
        articleId,
        [sourceType === 'left' ? 'leftClicks' : 'rightClicks']: 1,
        date: today
      }
    })
  }

  // Get subscriber by email
  static async getSubscriberByEmail(email: string) {
    return await prisma.subscriber.findUnique({
      where: { email }
    })
  }

  // Reactivate subscriber
  static async reactivateSubscriber(email: string, name?: string) {
    return await prisma.subscriber.update({
      where: { email },
      data: {
        isActive: true,
        ...(name && { name })
      }
    })
  }

  // Get newsletter stats
  static async getNewsletterStats() {
    const [activeCount, totalCount, recentSignups] = await Promise.all([
      prisma.subscriber.count({ where: { isActive: true } }),
      prisma.subscriber.count(),
      prisma.subscriber.count({
        where: {
          subscribedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ])

    return {
      activeSubscribers: activeCount,
      totalSubscribers: totalCount,
      recentSignups,
      unsubscribeRate: totalCount > 0 ? ((totalCount - activeCount) / totalCount) * 100 : 0
    }
  }

  // Get articles count with filters
  static async getArticlesCount(filters?: {
    category?: string
    published?: boolean
  }) {
    const { category, published = true } = filters || {}

    return await prisma.article.count({
      where: {
        ...(category && { category }),
        isPublished: published
      }
    })
  }

  // Get top articles by views
  static async getTopArticles(limit: number = 10, timeframe?: string) {
    return await prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { viewCount: 'desc' },
      take: limit,
      include: {
        leftSource: true,
        rightSource: true
      }
    })
  }

  // Get articles by category counts
  static async getArticlesByCategory() {
    const result = await prisma.article.groupBy({
      by: ['category'],
      where: { isPublished: true },
      _count: { category: true }
    })

    return result.map(item => ({
      category: item.category,
      count: item._count.category
    }))
  }

  // Get source click statistics
  static async getSourceClickStats() {
    const result = await prisma.articleAnalytics.aggregate({
      _sum: {
        leftClicks: true,
        rightClicks: true
      }
    })

    return {
      leftClicks: result._sum.leftClicks || 0,
      rightClicks: result._sum.rightClicks || 0,
      total: (result._sum.leftClicks || 0) + (result._sum.rightClicks || 0)
    }
  }

  // Generate unique slug
  static async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    let slug = baseSlug
    let counter = 1

    while (await prisma.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }

  // Get comprehensive stats
  static async getStats() {
    const [
      articlesCount,
      subscribersCount,
      rssCount,
      totalViews
    ] = await Promise.all([
      prisma.article.count({ where: { isPublished: true } }),
      prisma.subscriber.count({ where: { isActive: true } }),
      prisma.rSSFeed.count({ where: { isActive: true } }),
      prisma.article.aggregate({
        _sum: { viewCount: true }
      })
    ])

    return {
      articles: articlesCount,
      subscribers: subscribersCount,
      rssFeeds: rssCount,
      totalViews: totalViews._sum.viewCount || 0
    }
  }

  // Update subscriber last email timestamp
  static async updateSubscribersLastEmail(subscriberIds: string[]) {
    await prisma.subscriber.updateMany({
      where: {
        id: { in: subscriberIds }
      },
      data: {
        updatedAt: new Date()
      }
    })
  }

  // Get subscribers list with filtering and pagination
  static async getSubscribersList(options?: {
    status?: 'active' | 'inactive' | 'all'
    limit?: number
    offset?: number
    search?: string
  }) {
    const { status = 'all', limit = 50, offset = 0, search } = options || {}

    const where: any = {}

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [subscribers, total] = await Promise.all([
      prisma.subscriber.findMany({
        where,
        orderBy: { subscribedAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.subscriber.count({ where })
    ])

    return {
      subscribers,
      total,
      limit,
      offset
    }
  }

  // Bulk unsubscribe multiple subscribers
  static async bulkUnsubscribe(subscriberIds: string[]) {
    return await prisma.subscriber.updateMany({
      where: {
        id: { in: subscriberIds }
      },
      data: {
        isActive: false
      }
    })
  }
}