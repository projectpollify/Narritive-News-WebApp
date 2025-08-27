import { PrismaClient } from '@prisma/client'

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

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
    return await prisma.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        aiAnalysis: data.aiAnalysis,
        category: data.category,
        tags: data.tags || [],
        publishedAt: data.publishedAt,
        isPublished: true,
        leftSource: {
          create: {
            ...data.leftSource,
            sourceType: 'LEFT'
          }
        },
        rightSource: {
          create: {
            ...data.rightSource,
            sourceType: 'RIGHT'
          }
        }
      },
      include: {
        leftSource: true,
        rightSource: true
      }
    })
  }

  static async getArticles(filters?: {
    category?: string
    limit?: number
    offset?: number
    published?: boolean
  }) {
    const { category, limit = 10, offset = 0, published = true } = filters || {}
    
    return await prisma.article.findMany({
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
  }

  static async getArticleBySlug(slug: string) {
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
  static async addSubscriber(email: string, preferences?: {
    categories?: string[]
    frequency?: string
    timezone?: string
  }) {
    try {
      return await prisma.subscriber.create({
        data: {
          email,
          preferences: {
            categories: preferences?.categories || ['Politics', 'Business'],
            frequency: preferences?.frequency || 'daily',
            timezone: preferences?.timezone || 'UTC'
          }
        }
      })
    } catch (error) {
      // Handle duplicate email
      if (error.code === 'P2002') {
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
    url: string
    outlet: string
    bias: 'LEFT' | 'RIGHT' | 'CENTER'
    category?: string
  }) {
    return await prisma.rSSFeed.create({
      data
    })
  }

  static async getActiveRSSFeeds() {
    return await prisma.rSSFeed.findMany({
      where: { isActive: true }
    })
  }

  static async updateFeedLastChecked(id: string) {
    return await prisma.rSSFeed.update({
      where: { id },
      data: { lastChecked: new Date() }
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
  static async reactivateSubscriber(email: string, preferences?: any) {
    return await prisma.subscriber.update({
      where: { email },
      data: { 
        isActive: true,
        ...(preferences && { preferences })
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
}