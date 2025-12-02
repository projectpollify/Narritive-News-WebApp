import Link from 'next/link'
import Image from 'next/image'
import { ArticleCard } from '@/components/features/article-card'
import { Newsletter } from '@/components/features/newsletter'
import { ArweaveTooltip } from '@/components/features/arweave-tooltip'

// Mock data for development - will be replaced with real data later
const mockArticles = [
  {
    id: '1',
    title: 'Federal Reserve Announces Interest Rate Decision',
    aiAnalysis: 'Analysis reveals significant differences in how outlets frame the economic impact, with conservative sources emphasizing inflation concerns while liberal sources focus on employment effects.',
    leftSource: {
      outlet: 'CNN Business',
      headline: 'Fed Cuts Rates to Boost Struggling Economy',
      summary: 'The Federal Reserve announced a quarter-point rate cut today, citing concerns about slowing economic growth and the need to support American workers...',
      url: 'https://www.cnn.com/business/economy/federal-reserve',
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop',
      author: 'Matt Egan'
    },
    rightSource: {
      outlet: 'Fox Business',
      headline: 'Fed Rate Cut Risks Reigniting Dangerous Inflation',
      summary: 'In a controversial move, the Federal Reserve slashed interest rates despite persistent inflation concerns, potentially undermining economic stability...',
      url: 'https://www.foxbusiness.com/economy/federal-reserve-rates',
      imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=400&fit=crop',
      author: 'Edward Lawrence'
    },
    publishedAt: '2024-01-15T14:30:00Z',
    category: 'Business'
  },
  {
    id: '2',
    title: 'Defense Secretary Under Fire Over Alleged "Kill Order"',
    aiAnalysis: 'Reports of a controversial order to eliminate survivors of a drug boat strike have ignited a firestorm. Liberal outlets frame this as a potential war crime and a failure of command, while conservative sources defend the Secretary against what they call a fabricated smear campaign designed to undermine national security efforts.',
    leftSource: {
      outlet: 'Washington Post',
      headline: 'Defense Secretary Accused of Ordering Massacre of Survivors',
      summary: 'A bombshell report alleges Defense Secretary Hegseth ordered a second strike to "kill everybody" on a disabled drug boat, raising serious questions about legality and morality...',
      url: '#',
      imageUrl: '/images/hegseth-left.png',
      author: 'Investigative Team'
    },
    rightSource: {
      outlet: 'Fox News',
      headline: 'Hegseth Slams "Fabricated" Hit Piece; Defends Action Against Narco-Terrorists',
      summary: 'Pete Hegseth vehemently denies the allegations, calling them "fake news" and asserting that the operation was a lawful strike against dangerous criminals threatening American security...',
      url: '#',
      imageUrl: '/images/hegseth_right_v2.png',
      author: 'Defense Correspondent'
    },
    publishedAt: '2025-12-01T08:00:00Z',
    category: 'Politics'
  },
  {
    id: '3',
    title: 'Tech Companies Face New Regulation Proposals',
    aiAnalysis: 'Liberal outlets emphasize consumer protection benefits while conservative sources warn of innovation stifling and government overreach.',
    leftSource: {
      outlet: 'Washington Post',
      headline: 'New Tech Rules Could Protect Consumer Privacy',
      summary: 'Proposed regulations would give users more control over their data and limit how tech giants can collect and use personal information...',
      url: 'https://www.washingtonpost.com/technology/tech-regulations',
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=400&fit=crop',
      author: 'Cat Zakrzewski'
    },
    rightSource: {
      outlet: 'National Review',
      headline: 'Big Government Targets Innovation with Tech Crackdown',
      summary: 'Heavy-handed regulatory proposals threaten American tech leadership and could stifle the innovation that drives economic growth...',
      url: 'https://www.nationalreview.com/tech-regulations',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop',
      author: 'Dominic Pino'
    },
    publishedAt: '2024-01-13T16:45:00Z',
    category: 'Business'
  }
]

export default function Homepage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section - Editorial Grid */}
      <section className="mb-16">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Feature (Left) */}
          <div className="lg:col-span-8">
            <Link href="/article/1">
              <div className="relative h-[500px] rounded-sm overflow-hidden group cursor-pointer shadow-card">
                <Image
                  src="/hero-image.png"
                  alt="Media Polarization Illustration"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 max-w-3xl">
                  <span className="inline-block px-3 py-1 bg-gold-500 text-navy-900 text-xs font-bold uppercase tracking-widest mb-4">
                    Deep Dive
                  </span>
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
                    The Great Divide: How Media Polarization is Reshaping Reality
                  </h1>
                  <p className="text-gray-200 text-lg mb-6 max-w-2xl font-light">
                    An in-depth analysis of how the same events are portrayed as completely different realities across the political spectrum.
                  </p>
                  <div className="flex items-center text-white/80 text-sm">
                    <span className="font-medium text-gold-500">Atticus Noble</span>
                    <span className="mx-2">•</span>
                    <span>5 min read</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Trending / Top Stories (Right) */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            <div className="border-b-2 border-navy-900 pb-2 flex justify-between items-end">
              <h3 className="font-serif font-bold text-2xl text-navy-900">Trending Analysis</h3>
              <a href="/all" className="text-sm font-medium text-gold-600 hover:text-navy-900 transition-colors uppercase tracking-wide">View All</a>
            </div>

            <div className="flex-1 flex flex-col justify-between space-y-6">
              {mockArticles.map((article, index) => (
                <Link key={article.id} href={`/article/${article.id}`}>
                  <div className="group cursor-pointer">
                    <div className="flex space-x-4">
                      <span className="text-4xl font-serif font-bold text-gray-200 group-hover:text-gold-500 transition-colors">0{index + 1}</span>
                      <div>
                        <span className="text-xs font-bold text-gold-600 uppercase tracking-wider">{article.category}</span>
                        <h4 className="font-serif font-bold text-lg text-navy-900 group-hover:text-gold-600 transition-colors leading-snug mt-1">
                          {article.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {article.aiAnalysis}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition - Redesigned */}
      <section className="bg-white border border-gray-100 shadow-soft rounded-sm p-12 mb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-100 rounded-full opacity-20 -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-navy-100 rounded-full opacity-20 -ml-32 -mb-32 blur-3xl"></div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-navy-900 mb-6">
            Why We Built Narrative News
          </h2>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed">
            In an era of echo chambers, we believe the truth often lies somewhere in the middle.
            Our AI analyzes thousands of articles daily to show you how different outlets frame the same story,
            giving you the complete picture.
          </p>
        </div>

        <div className="relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            <div className="p-6 bg-paper rounded-sm border border-gray-100 hover:border-gold-500/30 transition-colors">
              <div className="w-10 h-10 bg-navy-900 text-white rounded-sm flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-serif font-bold text-lg text-navy-900 mb-2">Unbiased AI</h3>
              <p className="text-sm text-gray-500">Algorithms that don't have a political agenda, just data analysis.</p>
            </div>
            <div className="p-6 bg-paper rounded-sm border border-gray-100 hover:border-gold-500/30 transition-colors">
              <div className="w-10 h-10 bg-navy-900 text-white rounded-sm flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <h3 className="font-serif font-bold text-lg text-navy-900 mb-2">Full Context</h3>
              <p className="text-sm text-gray-500">See the whole story, not just the parts that fit a specific narrative.</p>
            </div>
            <div className="p-6 bg-paper rounded-sm border border-gray-100 hover:border-gold-500/30 transition-colors">
              <div className="w-10 h-10 bg-navy-900 text-white rounded-sm flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h3 className="font-serif font-bold text-lg text-navy-900 mb-2">Media Literacy</h3>
              <p className="text-sm text-gray-500">Learn to spot bias and framing techniques used by modern media.</p>
            </div>
            <div className="p-6 bg-paper rounded-sm border border-gray-100 hover:border-gold-500/30 transition-colors">
              <div className="w-10 h-10 bg-navy-900 text-white rounded-sm flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <h3 className="font-serif font-bold text-lg text-navy-900 mb-2">Immutable Records</h3>
              <p className="text-sm text-gray-500">Permanently archiving history on <ArweaveTooltip /> to prevent censorship and revisionism.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Stories Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-3xl font-serif font-bold text-navy-900">Latest Analysis</h2>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-navy-900 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <button className="p-2 text-navy-900 bg-gray-100 rounded-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
          </div>
        </div>

        <div className="grid gap-8">
          {mockArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="btn-secondary text-navy-900 border border-gray-300 hover:border-navy-900 px-8 py-3 rounded-sm font-medium transition-all">
            Load More Stories
          </button>
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />
    </div>
  )
}