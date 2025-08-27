import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data in development
  if (process.env.NODE_ENV === 'development') {
    await prisma.articleAnalytics.deleteMany()
    await prisma.emailCampaign.deleteMany()
    await prisma.processedArticle.deleteMany()
    await prisma.article.deleteMany()
    await prisma.newsSource.deleteMany()
    await prisma.subscriber.deleteMany()
    await prisma.rSSFeed.deleteMany()
    console.log('🧹 Cleared existing data')
  }

  // Seed RSS Feeds for automation
  const rssFeeds = [
    // Left-leaning sources
    {
      url: 'https://rss.cnn.com/rss/edition.rss',
      outlet: 'CNN',
      bias: 'LEFT' as const,
      category: 'General'
    },
    {
      url: 'https://www.theguardian.com/us/rss',
      outlet: 'The Guardian',
      bias: 'LEFT' as const,
      category: 'Politics'
    },
    {
      url: 'https://www.huffpost.com/section/front-page/feed',
      outlet: 'HuffPost',
      bias: 'LEFT' as const,
      category: 'General'
    },
    {
      url: 'https://www.washingtonpost.com/arcio/rss/politics/',
      outlet: 'Washington Post',
      bias: 'LEFT' as const,
      category: 'Politics'
    },

    // Right-leaning sources
    {
      url: 'https://feeds.foxnews.com/foxnews/politics',
      outlet: 'Fox News',
      bias: 'RIGHT' as const,
      category: 'Politics'
    },
    {
      url: 'https://www.nationalreview.com/rss.xml',
      outlet: 'National Review',
      bias: 'RIGHT' as const,
      category: 'Politics'
    },
    {
      url: 'https://www.wsj.com/xml/rss/3_7085.xml',
      outlet: 'Wall Street Journal',
      bias: 'RIGHT' as const,
      category: 'Business'
    },
    {
      url: 'https://nypost.com/feed/',
      outlet: 'New York Post',
      bias: 'RIGHT' as const,
      category: 'General'
    },

    // Center sources (for future balance)
    {
      url: 'https://rss.reuters.com/reuters/topNews',
      outlet: 'Reuters',
      bias: 'CENTER' as const,
      category: 'General'
    },
    {
      url: 'https://feeds.npr.org/1001/rss.xml',
      outlet: 'NPR',
      bias: 'CENTER' as const,
      category: 'General'
    }
  ]

  for (const feed of rssFeeds) {
    await prisma.rSSFeed.create({
      data: feed
    })
  }
  console.log(`📰 Created ${rssFeeds.length} RSS feeds`)

  // Seed sample articles for testing
  const sampleArticles = [
    {
      title: 'Federal Reserve Interest Rate Decision Sparks Debate',
      category: 'Business',
      tags: ['Federal Reserve', 'Interest Rates', 'Economy'],
      aiAnalysis: 'Analysis reveals significant differences in framing the Federal Reserve\'s interest rate decision. Liberal sources emphasize the positive impact on employment and economic growth, highlighting how lower rates will help working families and stimulate business investment. Conservative sources focus on inflation risks and fiscal responsibility, expressing concerns about potential economic overheating and the long-term consequences of monetary policy. The key difference lies in temporal focus: left-leaning outlets prioritize immediate economic relief, while right-leaning sources emphasize long-term economic stability. Both perspectives acknowledge the complexity of monetary policy but diverge on risk assessment and priority of economic outcomes.',
      leftSource: {
        outlet: 'CNN Business',
        headline: 'Fed Cuts Rates to Support Economic Recovery and Job Growth',
        summary: 'The Federal Reserve announced a quarter-point rate cut today, emphasizing the need to support continued economic recovery and maintain strong employment levels. Fed Chair Jerome Powell highlighted concerns about global economic headwinds and the importance of sustaining momentum in the job market. The decision reflects the central bank\'s commitment to supporting working families and ensuring broad-based economic prosperity.',
        fullContent: 'The Federal Reserve cut interest rates by 0.25 percentage points today...',
        url: 'https://cnn.com/business/fed-rate-cut-2024',
        author: 'Business Reporter',
        bias: 'LEFT',
        publishedAt: new Date('2024-01-15T14:30:00Z')
      },
      rightSource: {
        outlet: 'Fox Business',
        headline: 'Fed Rate Cut Risks Reigniting Dangerous Inflation Spiral',
        summary: 'In a controversial decision that has economists divided, the Federal Reserve slashed interest rates despite persistent inflation concerns. Critics argue this premature easing could undermine the progress made in controlling price increases and may force more aggressive action later. The move raises questions about the Fed\'s commitment to its dual mandate and prioritization of short-term political considerations over long-term economic stability.',
        fullContent: 'The Federal Reserve\'s decision to cut rates by 25 basis points...',
        url: 'https://foxbusiness.com/fed-inflation-concerns-2024',
        author: 'Economic Analysis Team',
        bias: 'RIGHT',
        publishedAt: new Date('2024-01-15T15:00:00Z')
      }
    },
    {
      title: 'Climate Summit Agreement Reaches Historic Milestone',
      category: 'Politics',
      tags: ['Climate Change', 'International Policy', 'Environment'],
      aiAnalysis: 'Coverage of the climate summit shows distinct narrative frameworks between outlets. Progressive sources celebrate the agreement as a breakthrough in international cooperation, emphasizing scientific necessity and moral imperatives for aggressive climate action. They highlight commitments from developing nations and frame the agreement as essential for planetary survival. Conservative sources question the economic feasibility and implementation challenges, focusing on costs to taxpayers and potential impacts on American competitiveness. The fundamental difference lies in problem prioritization: liberal outlets treat climate change as an existential threat requiring immediate sacrifice, while conservative sources view it through the lens of economic pragmatism and national interest.',
      leftSource: {
        outlet: 'The Guardian',
        headline: 'World Leaders Unite for Groundbreaking Climate Action Commitments',
        summary: 'Global leaders reached an unprecedented agreement at the international climate summit, with nations committing to accelerated emissions reductions and substantial investments in renewable energy infrastructure. Environmental advocates praised the deal as a crucial step toward limiting global warming to 1.5°C, with developing nations securing significant climate finance commitments. The agreement represents the most ambitious international climate action since the Paris Agreement.',
        fullContent: 'World leaders gathered at the climate summit announced...',
        url: 'https://theguardian.com/environment/climate-summit-2024',
        author: 'Environment Correspondent',
        bias: 'LEFT',
        publishedAt: new Date('2024-01-14T09:15:00Z')
      },
      rightSource: {
        outlet: 'Wall Street Journal',
        headline: 'Climate Deal\'s Trillion-Dollar Price Tag Raises Economic Concerns',
        summary: 'The new international climate agreement includes costly mandates that could burden American businesses and consumers with trillions in expenses over the coming decades. Industry analysts warn that aggressive emission targets may disadvantage U.S. manufacturers competing with countries that have less stringent environmental regulations. Questions remain about the feasibility of implementation and whether the economic sacrifices will achieve meaningful environmental results.',
        fullContent: 'The climate agreement finalized at this week\'s summit...',
        url: 'https://wsj.com/climate-economic-impact-2024',
        author: 'Economics Reporter',
        bias: 'RIGHT',
        publishedAt: new Date('2024-01-14T10:30:00Z')
      }
    }
  ]

  for (const articleData of sampleArticles) {
    const slug = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    await prisma.article.create({
      data: {
        title: articleData.title,
        slug,
        aiAnalysis: articleData.aiAnalysis,
        category: articleData.category,
        tags: articleData.tags,
        publishedAt: new Date(articleData.leftSource.publishedAt),
        isPublished: true,
        leftSource: {
          create: {
            ...articleData.leftSource,
            sourceType: 'LEFT'
          }
        },
        rightSource: {
          create: {
            ...articleData.rightSource,
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
  console.log(`📝 Created ${sampleArticles.length} sample articles`)

  // Seed test subscribers
  const testSubscribers = [
    {
      email: 'test@example.com',
      preferences: {
        categories: ['Politics', 'Business'],
        frequency: 'daily',
        timezone: 'UTC'
      }
    },
    {
      email: 'demo@narrativenews.org',
      preferences: {
        categories: ['Politics', 'Business', 'Technology'],
        frequency: 'weekly',
        timezone: 'America/New_York'
      }
    }
  ]

  for (const subscriber of testSubscribers) {
    await prisma.subscriber.create({
      data: subscriber
    })
  }
  console.log(`📧 Created ${testSubscribers.length} test subscribers`)

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })