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
      url: 'https://example.com/cnn-article'
    },
    rightSource: {
      outlet: 'Fox Business',
      headline: 'Fed Rate Cut Risks Reigniting Dangerous Inflation',
      summary: 'In a controversial move, the Federal Reserve slashed interest rates despite persistent inflation concerns, potentially undermining economic stability...',
      url: 'https://example.com/fox-article'
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
      url: 'https://example.com/guardian-article'
    },
    rightSource: {
      outlet: 'Wall Street Journal',
      headline: 'Climate Deal Could Cost Trillions, Hurt Economic Growth',
      summary: 'The new climate agreement includes costly mandates that could burden businesses and consumers, raising questions about economic feasibility...',
      url: 'https://example.com/wsj-article'
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
      url: 'https://example.com/wapo-article'
    },
    rightSource: {
      outlet: 'National Review',
      headline: 'Big Government Targets Innovation with Tech Crackdown',
      summary: 'Heavy-handed regulatory proposals threaten American tech leadership and could stifle the innovation that drives economic growth...',
      url: 'https://example.com/nr-article'
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            See News From 
            <span className="text-blue-600"> Both Sides</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Our AI analyzes the same story from different news outlets, 
            revealing how perspective shapes the narrative. Get the full picture.
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Two Perspectives</h3>
            <p className="text-gray-600">
              Every story shows how left and right-leaning sources cover the same event
            </p>
          </div>
          
          <div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
            <p className="text-gray-600">
              Our AI identifies key differences and explains why outlets frame stories differently
            </p>
          </div>
          
          <div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Unbiased Truth</h3>
            <p className="text-gray-600">
              No agenda, just facts and analysis to help you form your own opinion
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
              <h3 className="font-semibold mb-2">We Scan</h3>
              <p className="text-gray-600">
                Our system automatically finds the same story across different news sources
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">AI Analyzes</h3>
              <p className="text-gray-600">
                Our AI compares how each outlet frames the story and identifies key differences
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">You Decide</h3>
              <p className="text-gray-600">
                Read both perspectives and our unbiased analysis, then form your own opinion
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}