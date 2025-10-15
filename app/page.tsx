import { ArticleCard } from '@/components/features/article-card'
import { Newsletter } from '@/components/features/newsletter'

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
    title: 'Climate Summit Reaches Historic Agreement',
    aiAnalysis: 'Coverage shows stark differences in emphasis: progressive outlets celebrate breakthrough commitments while conservative sources question economic costs and implementation feasibility.',
    leftSource: {
      outlet: 'The Guardian',
      headline: 'World Leaders Commit to Ambitious Climate Action Plan',
      summary: 'Global leaders reached a groundbreaking agreement at the climate summit, with unprecedented commitments to reduce emissions and invest in renewable energy...',
      url: 'https://www.theguardian.com/environment/climate-summit',
      imageUrl: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&h=400&fit=crop',
      author: 'Fiona Harvey'
    },
    rightSource: {
      outlet: 'Wall Street Journal',
      headline: 'Climate Deal Could Cost Trillions, Hurt Economic Growth',
      summary: 'The new climate agreement includes costly mandates that could burden businesses and consumers, raising questions about economic feasibility...',
      url: 'https://www.wsj.com/articles/climate-agreement',
      imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=400&fit=crop',
      author: 'Timothy Puko'
    },
    publishedAt: '2024-01-14T09:15:00Z',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            For the 80% in the Middle
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Beyond Left vs Right:
            <span className="text-blue-600"> What Actually Works</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Tired of partisan warfare? You're not alone. We serve the sensible majority who want truth over spin,
            solutions over blame, and real answers about how policies affect your family and freedom.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary text-lg px-8 py-3">
              Read Latest Analysis
            </button>
            <button className="btn-secondary text-lg px-8 py-3">
              Learn How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="bg-white rounded-2xl shadow-sm border p-8 mb-12">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Truth Over Spin</h3>
            <p className="text-gray-600">
              We show you what both sides say, then reveal what's actually true and what's missing
            </p>
          </div>

          <div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Real Impact Analysis</h3>
            <p className="text-gray-600">
              See how policies actually affect families, businesses, and your personal freedom
            </p>
          </div>

          <div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Solutions & Common Ground</h3>
            <p className="text-gray-600">
              Beyond partisan warfare—we highlight what works and where both sides agree
            </p>
          </div>
        </div>
      </section>

      {/* Latest Stories Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Latest Analysis</h2>
          <a href="/all" className="text-blue-600 hover:text-blue-700 font-medium">
            View All Stories →
          </a>
        </div>
        
        <div className="grid gap-8">
          {mockArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* Who This Is For Section */}
      <section className="bg-white rounded-2xl shadow-sm border p-8 mb-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">This Is For You If...</h2>
            <p className="text-lg text-gray-600">
              You're part of the sensible majority—the 80% who are tired of the extremes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700">
                <strong>You're exhausted by partisan warfare</strong> and just want to know what's actually true
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700">
                <strong>You care about your family and community</strong> more than scoring political points
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700">
                <strong>You want real solutions</strong> that work, not perfect ideology that doesn't
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700">
                <strong>You can hold two thoughts at once</strong> without your head exploding
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700">
                <strong>You think both sides have some good points</strong> and some terrible ones
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700">
                <strong>You're willing to change your mind</strong> when presented with good evidence
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-700 leading-relaxed">
              <strong>Welcome home.</strong> While the loudest 10% on each side dominate the conversation,
              we're here for the other 80%—the parents, workers, business owners, and thinkers who want
              substance over shouting matches. You're the silent majority, and it's time you had a news source
              that actually serves you.
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />

      {/* How It Works Section */}
      <section className="bg-gradient-news rounded-2xl p-8 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">How Narrative News Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Compare Both Sides</h3>
              <p className="text-gray-600">
                See how left and right-leaning outlets frame the exact same story
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Cut Through the Spin</h3>
              <p className="text-gray-600">
                We reveal what's true, what's exaggerated, and what both sides are leaving out
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">See Real Impact</h3>
              <p className="text-gray-600">
                Understand how it affects your family, your future, and your freedom
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}