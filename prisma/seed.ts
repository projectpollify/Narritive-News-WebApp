import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data in development
  if (process.env.NODE_ENV !== 'production') {
    await prisma.analytics.deleteMany()
    await prisma.article.deleteMany()
    await prisma.newsSource.deleteMany()
    await prisma.subscriber.deleteMany()
    await prisma.rSSFeed.deleteMany()
    await prisma.user.deleteMany()
    console.log('🧹 Cleared existing data')
  }

  // Create default admin user
  const adminPassword = await hashPassword('admin123')
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@narrativenews.org',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })
  console.log(`👤 Created admin user: ${adminUser.email}`)

  // Create editor user
  const editorPassword = await hashPassword('editor123')
  const editorUser = await prisma.user.create({
    data: {
      email: 'editor@narrativenews.org',
      name: 'Editor User',
      password: editorPassword,
      role: 'EDITOR',
      isActive: true,
    },
  })
  console.log(`👤 Created editor user: ${editorUser.email}`)

  // Seed RSS Feeds for automation
  const rssFeeds = [
    // Left-leaning sources
    {
      name: 'CNN Politics',
      url: 'https://rss.cnn.com/rss/cnn_allpolitics.rss',
      outlet: 'CNN',
      bias: 'LEFT',
      isActive: true,
    },
    {
      name: 'The Guardian US Politics',
      url: 'https://www.theguardian.com/us/rss',
      outlet: 'The Guardian',
      bias: 'LEFT',
      isActive: true,
    },
    {
      name: 'HuffPost',
      url: 'https://www.huffpost.com/section/front-page/feed',
      outlet: 'HuffPost',
      bias: 'LEFT',
      isActive: true,
    },
    {
      name: 'MSNBC',
      url: 'https://www.msnbc.com/feeds/latest',
      outlet: 'MSNBC',
      bias: 'LEFT',
      isActive: true,
    },

    // Right-leaning sources
    {
      name: 'Fox News Politics',
      url: 'https://feeds.foxnews.com/foxnews/politics',
      outlet: 'Fox News',
      bias: 'RIGHT',
      isActive: true,
    },
    {
      name: 'National Review',
      url: 'https://www.nationalreview.com/feed/',
      outlet: 'National Review',
      bias: 'RIGHT',
      isActive: true,
    },
    {
      name: 'Daily Caller',
      url: 'https://dailycaller.com/feed/',
      outlet: 'Daily Caller',
      bias: 'RIGHT',
      isActive: true,
    },
    {
      name: 'New York Post',
      url: 'https://nypost.com/feed/',
      outlet: 'New York Post',
      bias: 'RIGHT',
      isActive: true,
    },

    // Center sources (for future balance)
    {
      name: 'Reuters Top News',
      url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best',
      outlet: 'Reuters',
      bias: 'CENTER',
      isActive: true,
    },
    {
      name: 'AP News',
      url: 'https://apnews.com/apf-topnews',
      outlet: 'Associated Press',
      bias: 'CENTER',
      isActive: true,
    },
  ]

  for (const feed of rssFeeds) {
    await prisma.rSSFeed.create({
      data: feed as any,
    })
  }
  console.log(`📰 Created ${rssFeeds.length} RSS feeds`)

  // Seed sample articles for testing
  const leftSource1 = await prisma.newsSource.create({
    data: {
      outlet: 'CNN Business',
      headline: 'Fed Cuts Rates to Support Economic Recovery and Job Growth',
      summary:
        "The Federal Reserve announced a quarter-point rate cut today, emphasizing the need to support continued economic recovery and maintain strong employment levels. Fed Chair Jerome Powell highlighted concerns about global economic headwinds and the importance of sustaining momentum in the job market. The decision reflects the central bank's commitment to supporting working families and ensuring broad-based economic prosperity.",
      fullContent:
        'The Federal Reserve cut interest rates by 0.25 percentage points today, signaling confidence in the ongoing economic recovery while acknowledging persistent challenges...',
      url: 'https://cnn.com/business/fed-rate-cut-2024',
      author: 'Business Reporter',
      bias: 'LEFT',
      sourceType: 'RSS',
      publishedAt: new Date('2024-01-15T14:30:00Z'),
    },
  })

  const rightSource1 = await prisma.newsSource.create({
    data: {
      outlet: 'Fox Business',
      headline: 'Fed Rate Cut Risks Reigniting Dangerous Inflation Spiral',
      summary:
        'In a controversial decision that has economists divided, the Federal Reserve slashed interest rates despite persistent inflation concerns. Critics argue this premature easing could undermine the progress made in controlling price increases and may force more aggressive action later. The move raises questions about the Fed\'s commitment to its dual mandate and prioritization of short-term political considerations over long-term economic stability.',
      fullContent:
        "The Federal Reserve's decision to cut rates by 25 basis points has sparked intense debate among economists and market analysts...",
      url: 'https://foxbusiness.com/fed-inflation-concerns-2024',
      author: 'Economic Analysis Team',
      bias: 'RIGHT',
      sourceType: 'RSS',
      publishedAt: new Date('2024-01-15T15:00:00Z'),
    },
  })

  await prisma.article.create({
    data: {
      title: 'Federal Reserve Interest Rate Decision Sparks Debate',
      slug: 'federal-reserve-interest-rate-decision-sparks-debate',
      aiAnalysis:
        "Analysis reveals significant differences in framing the Federal Reserve's interest rate decision. Liberal sources emphasize the positive impact on employment and economic growth, highlighting how lower rates will help working families and stimulate business investment. Conservative sources focus on inflation risks and fiscal responsibility, expressing concerns about potential economic overheating and the long-term consequences of monetary policy. The key difference lies in temporal focus: left-leaning outlets prioritize immediate economic relief, while right-leaning sources emphasize long-term economic stability. Both perspectives acknowledge the complexity of monetary policy but diverge on risk assessment and priority of economic outcomes.",
      category: 'Business',
      tags: ['Federal Reserve', 'Interest Rates', 'Economy'],
      publishedAt: new Date('2024-01-15T14:30:00Z'),
      isPublished: true,
      leftSourceId: leftSource1.id,
      rightSourceId: rightSource1.id,
    },
  })

  const leftSource2 = await prisma.newsSource.create({
    data: {
      outlet: 'The Guardian',
      headline: 'World Leaders Unite for Groundbreaking Climate Action Commitments',
      summary:
        'Global leaders reached an unprecedented agreement at the international climate summit, with nations committing to accelerated emissions reductions and substantial investments in renewable energy infrastructure. Environmental advocates praised the deal as a crucial step toward limiting global warming to 1.5°C, with developing nations securing significant climate finance commitments. The agreement represents the most ambitious international climate action since the Paris Agreement.',
      fullContent:
        'World leaders gathered at the climate summit announced historic commitments to accelerate the transition to clean energy...',
      url: 'https://theguardian.com/environment/climate-summit-2024',
      author: 'Environment Correspondent',
      bias: 'LEFT',
      sourceType: 'RSS',
      publishedAt: new Date('2024-01-14T09:15:00Z'),
    },
  })

  const rightSource2 = await prisma.newsSource.create({
    data: {
      outlet: 'Wall Street Journal',
      headline: "Climate Deal's Trillion-Dollar Price Tag Raises Economic Concerns",
      summary:
        'The new international climate agreement includes costly mandates that could burden American businesses and consumers with trillions in expenses over the coming decades. Industry analysts warn that aggressive emission targets may disadvantage U.S. manufacturers competing with countries that have less stringent environmental regulations. Questions remain about the feasibility of implementation and whether the economic sacrifices will achieve meaningful environmental results.',
      fullContent:
        "The climate agreement finalized at this week's summit commits signatory nations to ambitious emissions reductions...",
      url: 'https://wsj.com/climate-economic-impact-2024',
      author: 'Economics Reporter',
      bias: 'RIGHT',
      sourceType: 'RSS',
      publishedAt: new Date('2024-01-14T10:30:00Z'),
    },
  })

  await prisma.article.create({
    data: {
      title: 'Climate Summit Agreement Reaches Historic Milestone',
      slug: 'climate-summit-agreement-reaches-historic-milestone',
      aiAnalysis:
        'Coverage of the climate summit shows distinct narrative frameworks between outlets. Progressive sources celebrate the agreement as a breakthrough in international cooperation, emphasizing scientific necessity and moral imperatives for aggressive climate action. They highlight commitments from developing nations and frame the agreement as essential for planetary survival. Conservative sources question the economic feasibility and implementation challenges, focusing on costs to taxpayers and potential impacts on American competitiveness. The fundamental difference lies in problem prioritization: liberal outlets treat climate change as an existential threat requiring immediate sacrifice, while conservative sources view it through the lens of economic pragmatism and national interest.',
      category: 'Politics',
      tags: ['Climate Change', 'International Policy', 'Environment'],
      publishedAt: new Date('2024-01-14T09:15:00Z'),
      isPublished: true,
      leftSourceId: leftSource2.id,
      rightSourceId: rightSource2.id,
    },
  })

  console.log(`📝 Created 2 sample articles`)

  // Seed test subscribers
  const testSubscribers = [
    {
      email: 'test@example.com',
      name: 'Test User',
      isActive: true,
    },
    {
      email: 'demo@narrativenews.org',
      name: 'Demo User',
      isActive: true,
    },
  ]

  for (const subscriber of testSubscribers) {
    await prisma.subscriber.create({
      data: subscriber,
    })
  }
  console.log(`📧 Created ${testSubscribers.length} test subscribers`)

  console.log('✅ Database seeded successfully!')
  console.log('\n📋 Login credentials:')
  console.log('   Admin: admin@narrativenews.org / admin123')
  console.log('   Editor: editor@narrativenews.org / editor123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
