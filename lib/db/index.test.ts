import { DatabaseService, prisma } from './index'

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    article: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    subscriber: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    rSSFeed: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    processedArticle: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    articleAnalytics: {
      upsert: jest.fn(),
      aggregate: jest.fn(),
    },
  }

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  }
})

describe('DatabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Article operations', () => {
    describe('createArticle', () => {
      it('should create an article with left and right sources', async () => {
        const mockArticleData = {
          title: 'Climate Bill Sparks Debate',
          slug: 'climate-bill-sparks-debate',
          aiAnalysis: 'Analysis content here',
          category: 'Politics',
          tags: ['Climate', 'Politics'],
          publishedAt: new Date('2024-01-15'),
          leftSource: {
            outlet: 'NYT',
            headline: 'Climate Bill Passes',
            summary: 'Summary',
            fullContent: 'Content',
            url: 'https://nyt.com/article',
            author: 'John Doe',
            publishedAt: new Date('2024-01-15'),
            bias: 'LEFT' as const,
          },
          rightSource: {
            outlet: 'Fox News',
            headline: 'Expensive Bill Approved',
            summary: 'Summary',
            fullContent: 'Content',
            url: 'https://fox.com/article',
            author: 'Jane Smith',
            publishedAt: new Date('2024-01-15'),
            bias: 'RIGHT' as const,
          },
        }

        const mockCreatedArticle = {
          id: 'article-123',
          ...mockArticleData,
          isPublished: true,
          viewCount: 0,
          leftSource: { id: 'left-123', ...mockArticleData.leftSource, sourceType: 'LEFT' },
          rightSource: { id: 'right-123', ...mockArticleData.rightSource, sourceType: 'RIGHT' },
        }

        ;(prisma.article.create as jest.Mock).mockResolvedValue(mockCreatedArticle)

        const result = await DatabaseService.createArticle(mockArticleData)

        expect(prisma.article.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              title: mockArticleData.title,
              slug: mockArticleData.slug,
              aiAnalysis: mockArticleData.aiAnalysis,
              category: mockArticleData.category,
              isPublished: true,
            }),
            include: {
              leftSource: true,
              rightSource: true,
            },
          })
        )

        expect(result.id).toBe('article-123')
        expect(result.leftSource).toBeDefined()
        expect(result.rightSource).toBeDefined()
      })
    })

    describe('getArticles', () => {
      it('should fetch articles with default filters', async () => {
        const mockArticles = [
          {
            id: '1',
            title: 'Article 1',
            slug: 'article-1',
            isPublished: true,
            leftSource: {},
            rightSource: {},
          },
        ]

        ;(prisma.article.findMany as jest.Mock).mockResolvedValue(mockArticles)

        const result = await DatabaseService.getArticles()

        expect(prisma.article.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { isPublished: true },
            take: 10,
            skip: 0,
            orderBy: { publishedAt: 'desc' },
          })
        )

        expect(result).toEqual(mockArticles)
      })

      it('should apply category filter', async () => {
        ;(prisma.article.findMany as jest.Mock).mockResolvedValue([])

        await DatabaseService.getArticles({ category: 'Politics', limit: 20, offset: 10 })

        expect(prisma.article.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { category: 'Politics', isPublished: true },
            take: 20,
            skip: 10,
          })
        )
      })
    })

    describe('getArticleBySlug', () => {
      it('should fetch article and increment view count', async () => {
        const mockArticle = {
          id: 'article-123',
          title: 'Test Article',
          slug: 'test-article',
          viewCount: 5,
        }

        ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)
        ;(prisma.article.update as jest.Mock).mockResolvedValue({
          ...mockArticle,
          viewCount: 6,
        })

        const result = await DatabaseService.getArticleBySlug('test-article')

        expect(prisma.article.findUnique).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { slug: 'test-article' },
          })
        )

        expect(prisma.article.update).toHaveBeenCalledWith({
          where: { id: 'article-123' },
          data: { viewCount: { increment: 1 } },
        })

        expect(result).toBeDefined()
      })

      it('should return null and not increment count if article not found', async () => {
        ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(null)

        const result = await DatabaseService.getArticleBySlug('non-existent')

        expect(prisma.article.update).not.toHaveBeenCalled()
        expect(result).toBeNull()
      })
    })

    describe('getArticlesCount', () => {
      it('should count articles with filters', async () => {
        ;(prisma.article.count as jest.Mock).mockResolvedValue(42)

        const result = await DatabaseService.getArticlesCount({
          category: 'Politics',
          published: true,
        })

        expect(prisma.article.count).toHaveBeenCalledWith({
          where: { category: 'Politics', isPublished: true },
        })

        expect(result).toBe(42)
      })
    })

    describe('getTopArticles', () => {
      it('should fetch top articles by view count', async () => {
        const mockTopArticles = [
          { id: '1', viewCount: 100 },
          { id: '2', viewCount: 80 },
        ]

        ;(prisma.article.findMany as jest.Mock).mockResolvedValue(mockTopArticles)

        const result = await DatabaseService.getTopArticles(10)

        expect(prisma.article.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { isPublished: true },
            orderBy: { viewCount: 'desc' },
            take: 10,
          })
        )

        expect(result).toEqual(mockTopArticles)
      })
    })

    describe('generateUniqueSlug', () => {
      it('should generate slug from title', async () => {
        ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(null)

        const result = await DatabaseService.generateUniqueSlug('Climate Bill Passes Senate')

        expect(result).toBe('climate-bill-passes-senate')
      })

      it('should add counter if slug already exists', async () => {
        ;(prisma.article.findUnique as jest.Mock)
          .mockResolvedValueOnce({ id: '1' }) // First slug exists
          .mockResolvedValueOnce({ id: '2' }) // Second slug exists
          .mockResolvedValueOnce(null) // Third slug is unique

        const result = await DatabaseService.generateUniqueSlug('Test Article')

        expect(result).toBe('test-article-2')
        expect(prisma.article.findUnique).toHaveBeenCalledTimes(3)
      })

      it('should handle special characters in title', async () => {
        ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(null)

        const result = await DatabaseService.generateUniqueSlug('Test @#$% Article!')

        expect(result).toBe('test-article')
        expect(result).not.toContain('@')
        expect(result).not.toContain('%')
      })
    })
  })

  describe('Subscriber operations', () => {
    describe('addSubscriber', () => {
      it('should create a new subscriber with preferences', async () => {
        const mockSubscriber = {
          id: 'sub-123',
          email: 'test@example.com',
          isActive: true,
          preferences: {
            categories: ['Politics', 'Technology'],
            frequency: 'weekly',
            timezone: 'America/New_York',
          },
        }

        ;(prisma.subscriber.create as jest.Mock).mockResolvedValue(mockSubscriber)

        const result = await DatabaseService.addSubscriber('test@example.com', {
          categories: ['Politics', 'Technology'],
          frequency: 'weekly',
          timezone: 'America/New_York',
        })

        expect(prisma.subscriber.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: {
              email: 'test@example.com',
              preferences: expect.objectContaining({
                categories: ['Politics', 'Technology'],
                frequency: 'weekly',
              }),
            },
          })
        )

        expect(result.email).toBe('test@example.com')
      })

      it('should throw error for duplicate email', async () => {
        const duplicateError = { code: 'P2002', message: 'Unique constraint failed' }

        ;(prisma.subscriber.create as jest.Mock).mockRejectedValue(duplicateError)

        await expect(
          DatabaseService.addSubscriber('existing@example.com')
        ).rejects.toThrow('Email already subscribed')
      })

      it('should use default preferences if none provided', async () => {
        const mockSubscriber = {
          id: 'sub-123',
          email: 'test@example.com',
          preferences: {
            categories: ['Politics', 'Business'],
            frequency: 'daily',
            timezone: 'UTC',
          },
        }

        ;(prisma.subscriber.create as jest.Mock).mockResolvedValue(mockSubscriber)

        const result = await DatabaseService.addSubscriber('test@example.com')

        expect(prisma.subscriber.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: {
              email: 'test@example.com',
              preferences: {
                categories: ['Politics', 'Business'],
                frequency: 'daily',
                timezone: 'UTC',
              },
            },
          })
        )
      })
    })

    describe('getActiveSubscribers', () => {
      it('should fetch only active subscribers', async () => {
        const mockSubscribers = [
          { id: '1', email: 'test1@example.com', isActive: true },
          { id: '2', email: 'test2@example.com', isActive: true },
        ]

        ;(prisma.subscriber.findMany as jest.Mock).mockResolvedValue(mockSubscribers)

        const result = await DatabaseService.getActiveSubscribers()

        expect(prisma.subscriber.findMany).toHaveBeenCalledWith({
          where: { isActive: true },
        })

        expect(result).toHaveLength(2)
      })
    })

    describe('unsubscribeEmail', () => {
      it('should deactivate subscriber', async () => {
        const mockUnsubscribed = {
          id: 'sub-123',
          email: 'test@example.com',
          isActive: false,
        }

        ;(prisma.subscriber.update as jest.Mock).mockResolvedValue(mockUnsubscribed)

        const result = await DatabaseService.unsubscribeEmail('test@example.com')

        expect(prisma.subscriber.update).toHaveBeenCalledWith({
          where: { email: 'test@example.com' },
          data: { isActive: false },
        })

        expect(result.isActive).toBe(false)
      })
    })

    describe('getNewsletterStats', () => {
      it('should calculate newsletter statistics', async () => {
        ;(prisma.subscriber.count as jest.Mock)
          .mockResolvedValueOnce(450) // active
          .mockResolvedValueOnce(500) // total
          .mockResolvedValueOnce(25) // recent signups

        const result = await DatabaseService.getNewsletterStats()

        expect(result).toEqual({
          activeSubscribers: 450,
          totalSubscribers: 500,
          recentSignups: 25,
          unsubscribeRate: 10, // (500 - 450) / 500 * 100
        })
      })
    })
  })

  describe('RSS Feed operations', () => {
    describe('addRSSFeed', () => {
      it('should create a new RSS feed', async () => {
        const feedData = {
          url: 'https://example.com/rss',
          outlet: 'Example News',
          bias: 'LEFT' as const,
          category: 'Politics',
        }

        const mockFeed = { id: 'feed-123', ...feedData }

        ;(prisma.rSSFeed.create as jest.Mock).mockResolvedValue(mockFeed)

        const result = await DatabaseService.addRSSFeed(feedData)

        expect(prisma.rSSFeed.create).toHaveBeenCalledWith({ data: feedData })
        expect(result.id).toBe('feed-123')
      })
    })

    describe('getActiveRSSFeeds', () => {
      it('should fetch only active feeds', async () => {
        const mockFeeds = [
          { id: '1', url: 'https://feed1.com', isActive: true },
          { id: '2', url: 'https://feed2.com', isActive: true },
        ]

        ;(prisma.rSSFeed.findMany as jest.Mock).mockResolvedValue(mockFeeds)

        const result = await DatabaseService.getActiveRSSFeeds()

        expect(prisma.rSSFeed.findMany).toHaveBeenCalledWith({
          where: { isActive: true },
        })

        expect(result).toHaveLength(2)
      })
    })

    describe('updateFeedLastChecked', () => {
      it('should update feed timestamp', async () => {
        const mockUpdatedFeed = {
          id: 'feed-123',
          lastChecked: new Date(),
        }

        ;(prisma.rSSFeed.update as jest.Mock).mockResolvedValue(mockUpdatedFeed)

        const result = await DatabaseService.updateFeedLastChecked('feed-123')

        expect(prisma.rSSFeed.update).toHaveBeenCalledWith({
          where: { id: 'feed-123' },
          data: { lastChecked: expect.any(Date) },
        })

        expect(result.lastChecked).toBeDefined()
      })
    })
  })

  describe('Processed articles tracking', () => {
    describe('markArticleAsProcessed', () => {
      it('should mark article as processed', async () => {
        const mockProcessed = {
          id: 'proc-123',
          url: 'https://example.com/article',
          title: 'Test Article',
          outlet: 'Example News',
        }

        ;(prisma.processedArticle.create as jest.Mock).mockResolvedValue(mockProcessed)

        const result = await DatabaseService.markArticleAsProcessed(
          'https://example.com/article',
          'Test Article',
          'Example News'
        )

        expect(prisma.processedArticle.create).toHaveBeenCalledWith({
          data: {
            url: 'https://example.com/article',
            title: 'Test Article',
            outlet: 'Example News',
          },
        })

        expect(result.id).toBe('proc-123')
      })
    })

    describe('isArticleProcessed', () => {
      it('should return true if article exists', async () => {
        ;(prisma.processedArticle.findUnique as jest.Mock).mockResolvedValue({
          id: 'proc-123',
          url: 'https://example.com/article',
        })

        const result = await DatabaseService.isArticleProcessed(
          'https://example.com/article'
        )

        expect(result).toBe(true)
      })

      it('should return false if article does not exist', async () => {
        ;(prisma.processedArticle.findUnique as jest.Mock).mockResolvedValue(null)

        const result = await DatabaseService.isArticleProcessed(
          'https://example.com/new-article'
        )

        expect(result).toBe(false)
      })
    })
  })

  describe('Analytics operations', () => {
    describe('recordArticleView', () => {
      it('should increment view count for existing analytics', async () => {
        ;(prisma.articleAnalytics.upsert as jest.Mock).mockResolvedValue({
          articleId: 'article-123',
          views: 6,
        })

        await DatabaseService.recordArticleView('article-123')

        expect(prisma.articleAnalytics.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              articleId_date: {
                articleId: 'article-123',
                date: expect.any(Date),
              },
            },
            update: {
              views: { increment: 1 },
            },
            create: expect.objectContaining({
              articleId: 'article-123',
              views: 1,
            }),
          })
        )
      })
    })

    describe('recordSourceClick', () => {
      it('should record left source click', async () => {
        ;(prisma.articleAnalytics.upsert as jest.Mock).mockResolvedValue({})

        await DatabaseService.recordSourceClick('article-123', 'left')

        expect(prisma.articleAnalytics.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            update: {
              leftClicks: { increment: 1 },
            },
          })
        )
      })

      it('should record right source click', async () => {
        ;(prisma.articleAnalytics.upsert as jest.Mock).mockResolvedValue({})

        await DatabaseService.recordSourceClick('article-123', 'right')

        expect(prisma.articleAnalytics.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            update: {
              rightClicks: { increment: 1 },
            },
          })
        )
      })
    })

    describe('getSourceClickStats', () => {
      it('should aggregate click statistics', async () => {
        ;(prisma.articleAnalytics.aggregate as jest.Mock).mockResolvedValue({
          _sum: {
            leftClicks: 120,
            rightClicks: 80,
          },
        })

        const result = await DatabaseService.getSourceClickStats()

        expect(result).toEqual({
          leftClicks: 120,
          rightClicks: 80,
          total: 200,
        })
      })

      it('should handle null values', async () => {
        ;(prisma.articleAnalytics.aggregate as jest.Mock).mockResolvedValue({
          _sum: {
            leftClicks: null,
            rightClicks: null,
          },
        })

        const result = await DatabaseService.getSourceClickStats()

        expect(result).toEqual({
          leftClicks: 0,
          rightClicks: 0,
          total: 0,
        })
      })
    })
  })
})
