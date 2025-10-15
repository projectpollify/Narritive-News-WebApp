import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// Type definitions
interface NewsSource {
  outlet: string
  headline: string
  summary: string
  url: string
  imageUrl?: string
  author?: string
  fullContent?: string
}

interface EnhancedAnalysis {
  summary: string // Quick overview shown on cards
  truthCheck?: string // What facts both sides agree on
  spinDetection?: string // How each side is framing/omitting
  realImpact?: string // Who this actually affects
  commonGround?: string // Where both sides agree
  biggerPicture?: string // Why this matters
}

interface Article {
  id: string
  title: string
  aiAnalysis: string | EnhancedAnalysis // Support both old and new format
  leftSource: NewsSource
  rightSource: NewsSource
  publishedAt: string
  category: string
}

// Mock data - same as homepage (will be replaced with API/database later)
const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Federal Reserve Announces Interest Rate Decision',
    aiAnalysis: {
      summary: 'Analysis reveals significant differences in how outlets frame the economic impact, with conservative sources emphasizing inflation concerns while liberal sources focus on employment effects.',
      truthCheck: 'Both sides agree: The Fed cut rates by 0.25%, inflation has cooled to 2.4% from peak levels, and unemployment ticked up to 4.1%. These are facts.',
      spinDetection: 'CNN frames this as "supporting struggling workers" while Fox calls it "slashing rates" and "reigniting dangerous inflation." Notice the word choices: struggling vs dangerous, support vs slash. CNN emphasizes job losses; Fox emphasizes inflation risks. Both are cherry-picking which economic indicator to focus on.',
      realImpact: 'For your family: Lower mortgage and credit card rates if you\'re borrowing. For your savings: Lower returns on savings accounts. For small business owners: Easier to get loans to expand. For retirees on fixed income: Could hurt if inflation returns. The tradeoff is real—cheaper borrowing now vs potential inflation later.',
      commonGround: 'Both sides actually want the same thing: a strong economy with stable prices and good jobs. They just disagree on which risk is bigger right now—recession or inflation. Even the Fed is divided (one member dissented).',
      biggerPicture: 'This isn\'t really about left vs right—it\'s about competing economic priorities. The Fed is trying to thread a needle between two risks. Your family feels both: job security matters, but so does the cost of groceries. Both perspectives highlight real concerns. The question isn\'t who\'s right, but which risk you\'re more worried about for your household.'
    },
    leftSource: {
      outlet: 'CNN Business',
      headline: 'Fed Cuts Rates to Boost Struggling Economy',
      summary: 'The Federal Reserve announced a quarter-point rate cut today, citing concerns about slowing economic growth and the need to support American workers...',
      url: 'https://www.cnn.com/business/economy/federal-reserve',
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop',
      author: 'Matt Egan',
      fullContent: 'The Federal Reserve announced a quarter-point interest rate cut today, marking a significant shift in monetary policy as officials seek to support an economy showing signs of weakness. The decision, which brings the federal funds rate to a range of 4.5% to 4.75%, comes amid growing concerns about slowing job growth and declining consumer confidence.\n\nFederal Reserve Chair Jerome Powell emphasized the need to support American workers during the post-meeting press conference. "We are seeing softness in the labor market that warrants a more accommodative stance," Powell said. "Our dual mandate requires us to support maximum employment while maintaining price stability."\n\nEconomists generally welcomed the move, with many noting that inflation has cooled considerably from its peak last year. Consumer prices rose just 2.4% over the past 12 months, approaching the Fed\'s 2% target. This progress on inflation has given the central bank room to shift its focus toward supporting employment.\n\nThe rate cut is expected to provide relief to borrowers, potentially lowering costs for mortgages, auto loans, and credit cards. Small businesses, which have struggled with high borrowing costs, may also benefit from easier access to credit.\n\nHowever, the Fed signaled that future rate cuts would depend on incoming economic data. "We\'re not on a preset course," Powell noted. "Each decision will be made meeting by meeting based on the totality of the data and the evolving outlook."\n\nThe labor market has shown clear signs of cooling in recent months. Job growth has slowed to an average of 150,000 per month, down from over 250,000 earlier in the year. The unemployment rate has ticked up to 4.1%, still low by historical standards but rising from its recent lows.\n\nConsumer spending, which drives about 70% of economic activity, has also moderated. Retail sales growth has slowed, and surveys show consumers becoming more cautious about major purchases. Many economists believe the Fed\'s previous rate hikes, which brought rates to a 23-year high, have begun to weigh on economic activity.\n\nThe decision was not unanimous, with one Fed official preferring to hold rates steady, citing concerns about financial stability. But the majority of the Federal Open Market Committee supported the cut, viewing it as an appropriate response to the evolving economic landscape.'
    },
    rightSource: {
      outlet: 'Fox Business',
      headline: 'Fed Rate Cut Risks Reigniting Dangerous Inflation',
      summary: 'In a controversial move, the Federal Reserve slashed interest rates despite persistent inflation concerns, potentially undermining economic stability...',
      url: 'https://www.foxbusiness.com/economy/federal-reserve-rates',
      imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=400&fit=crop',
      author: 'Edward Lawrence',
      fullContent: 'The Federal Reserve cut interest rates by a quarter percentage point today, a decision that has sparked concerns among economists who warn the move could reignite the inflation that has plagued the economy for the past two years. The rate cut brings the federal funds rate to 4.5%-4.75%, down from the peak of 5.5% that Fed officials had maintained to combat rising prices.\n\nCritics argue that the central bank is moving too quickly to ease monetary policy while inflation remains above the Fed\'s 2% target. Despite recent progress, consumer prices are still rising at an annual rate of 2.4%, and core inflation—which excludes volatile food and energy prices—stands at 2.8%.\n\n"This is a premature move that could undermine the progress we\'ve made on inflation," said former Fed advisor John Taylor. "The Fed should be holding steady until we see inflation consistently at target."\n\nThe decision comes as the federal government continues to run massive deficits, with spending far outpacing revenues. This fiscal profligacy, combined with easier monetary policy, creates a dangerous cocktail that could lead to renewed price pressures. Government spending has added approximately $2 trillion to the national debt in the past year alone.\n\nBusiness leaders have expressed mixed reactions to the rate cut. While some welcome the prospect of lower borrowing costs, others worry about the long-term implications for price stability. "We need predictable monetary policy, not political pressure driving decisions," said one manufacturing CEO who requested anonymity.\n\nThe Fed\'s decision appears to be influenced by concerns about the labor market, but unemployment remains relatively low at 4.1%. Historically, this level of unemployment has been associated with a healthy economy, not one requiring emergency monetary stimulus.\n\nMoreover, cutting rates now could limit the Fed\'s ability to respond to future economic downturns. With rates already substantially lower than the peak, the central bank has less ammunition to combat a recession if one emerges. This "running out of runway" problem has concerned monetary policy experts.\n\nEnergy markets have already begun to react to the looser monetary policy, with oil prices rising in anticipation of stronger demand and a weaker dollar. This could translate into higher gasoline prices for consumers, further complicating the inflation picture.\n\nThe Fed\'s decision also raises questions about political independence. With an election year approaching, some observers suggest the timing of the rate cut is suspicious, potentially designed to boost economic activity ahead of the vote. Fed Chair Jerome Powell has denied any political motivation, but the optics remain problematic.\n\nLooking ahead, the Fed has indicated it will proceed cautiously with future rate adjustments, but markets are already pricing in additional cuts. This expectation could become self-fulfilling, further loosening financial conditions and potentially reigniting the inflation cycle that the Fed spent two years trying to break.'
    },
    publishedAt: '2024-01-15T14:30:00Z',
    category: 'Business'
  },
  {
    id: '2',
    title: 'Climate Summit Reaches Historic Agreement',
    aiAnalysis: 'Coverage shows stark differences in emphasis: progressive outlets celebrate breakthrough commitments while conservative sources question economic costs and implementation feasibility. The climate agreement represents a major diplomatic achievement, but the two perspectives highlight fundamental disagreements about priorities and trade-offs.',
    leftSource: {
      outlet: 'The Guardian',
      headline: 'World Leaders Commit to Ambitious Climate Action Plan',
      summary: 'Global leaders reached a groundbreaking agreement at the climate summit, with unprecedented commitments to reduce emissions and invest in renewable energy...',
      url: 'https://www.theguardian.com/environment/climate-summit',
      imageUrl: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&h=400&fit=crop',
      author: 'Fiona Harvey',
      fullContent: 'World leaders have reached a historic agreement at the international climate summit, committing to unprecedented action to combat global warming and transition to clean energy. The accord, signed by representatives from 195 countries, sets ambitious targets for emissions reductions and renewable energy investment over the next decade.\n\nThe agreement includes a commitment to triple renewable energy capacity by 2030 and phase down fossil fuel use "in line with science." Developed nations also pledged $300 billion annually to help developing countries transition to clean energy and adapt to climate impacts—a significant increase from previous commitments.\n\n"This is a turning point in our fight against climate change," said summit president Amina Rahman. "For the first time, we have universal agreement on the need for rapid, comprehensive action."\n\nEnvironmental groups largely praised the agreement, though many noted it doesn\'t go far enough. "This is real progress, but we need to move even faster," said Greenpeace International Director Jennifer Morgan. "Every fraction of a degree of warming matters."\n\nThe agreement also establishes a new mechanism for tracking and verifying emissions reductions, addressing a longstanding concern about accountability. Countries will report their progress annually, with independent verification to ensure compliance.'
    },
    rightSource: {
      outlet: 'Wall Street Journal',
      headline: 'Climate Deal Could Cost Trillions, Hurt Economic Growth',
      summary: 'The new climate agreement includes costly mandates that could burden businesses and consumers, raising questions about economic feasibility...',
      url: 'https://www.wsj.com/articles/climate-agreement',
      imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=400&fit=crop',
      author: 'Timothy Puko',
      fullContent: 'The climate agreement reached at this week\'s international summit could cost the global economy trillions of dollars and significantly impact economic growth, according to analysis from leading economists and industry groups. While supporters tout the environmental benefits, the deal\'s ambitious targets raise serious questions about feasibility and economic consequences.\n\nThe agreement commits signatories to tripling renewable energy capacity by 2030—a goal that would require massive infrastructure investments estimated at $4-5 trillion globally. This spending would need to come from a combination of public and private sources at a time when many countries are already struggling with high debt levels.\n\n"These are aspirational goals that don\'t account for economic reality," said energy economist Robert Bryce. "You can\'t simply mandate a energy transition without considering the costs and disruptions involved."\n\nIndustry representatives expressed concern about the pace of change required. The fossil fuel phasedown timeline could strand trillions in existing energy infrastructure and disrupt energy markets. "We support cleaner energy, but this needs to be a realistic transition that maintains energy security and affordability," said a spokesperson for the American Petroleum Institute.\n\nDeveloping nations secured $300 billion in annual climate finance from wealthy countries, but questions remain about how this money will be raised and distributed. Taxpayers in developed countries may face higher taxes to fund these commitments, while governance concerns plague international climate finance mechanisms.'
    },
    publishedAt: '2024-01-14T09:15:00Z',
    category: 'Politics'
  },
  {
    id: '3',
    title: 'Tech Companies Face New Regulation Proposals',
    aiAnalysis: 'Liberal outlets emphasize consumer protection benefits while conservative sources warn of innovation stifling and government overreach. The regulatory proposals reflect ongoing debates about the proper role of government in the technology sector.',
    leftSource: {
      outlet: 'Washington Post',
      headline: 'New Tech Rules Could Protect Consumer Privacy',
      summary: 'Proposed regulations would give users more control over their data and limit how tech giants can collect and use personal information...',
      url: 'https://www.washingtonpost.com/technology/tech-regulations',
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=400&fit=crop',
      author: 'Cat Zakrzewski',
      fullContent: 'A sweeping set of technology regulations proposed by lawmakers this week could fundamentally reshape how tech companies collect and use consumer data, giving individuals unprecedented control over their personal information. The bipartisan proposal represents the most significant attempt to regulate big tech in years.\n\nThe proposed rules would require companies to obtain explicit consent before collecting personal data, allow users to access and delete their information on demand, and impose strict limits on data sharing with third parties. Companies would face substantial fines for violations—up to 4% of global revenue.\n\n"For too long, tech companies have operated in a regulatory vacuum, treating user data as their property," said Senator Maria Hernandez, the bill\'s lead sponsor. "These reforms put consumers back in control."\n\nConsumer advocates strongly support the proposals. "This is exactly the kind of meaningful privacy protection Americans deserve," said Consumer Reports policy director Justin Brookman. "Europe has shown that strong privacy rules are both feasible and beneficial."\n\nThe regulations would also address concerns about algorithmic bias and content moderation, requiring transparency about how platforms make decisions and giving users recourse when they believe they\'ve been treated unfairly.'
    },
    rightSource: {
      outlet: 'National Review',
      headline: 'Big Government Targets Innovation with Tech Crackdown',
      summary: 'Heavy-handed regulatory proposals threaten American tech leadership and could stifle the innovation that drives economic growth...',
      url: 'https://www.nationalreview.com/tech-regulations',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop',
      author: 'Dominic Pino',
      fullContent: 'Congressional lawmakers unveiled sweeping technology regulations this week that threaten to undermine American innovation and hand competitive advantages to foreign rivals. The proposals represent a dangerous expansion of government power into the technology sector, potentially stifling the entrepreneurship and innovation that have made American tech companies global leaders.\n\nThe regulations would impose onerous compliance requirements on technology companies, forcing them to navigate complex bureaucratic processes before launching new products or features. This regulatory burden would disproportionately impact startups and smaller companies that lack the resources to hire compliance teams.\n\n"This is government overreach disguised as consumer protection," said technology policy expert Adam Thierer. "We\'re risking American competitiveness to address problems that are largely theoretical."\n\nThe proposed data rules are particularly concerning, as they would require companies to restructure their entire business models. Many free services that consumers enjoy depend on targeted advertising funded by data collection. Restricting these practices could force companies to charge for currently free services.\n\nMoreover, the regulations could advantage foreign competitors, particularly Chinese tech companies that don\'t face similar restrictions. "While we tie our companies up in red tape, China is racing ahead in AI, quantum computing, and other critical technologies," noted former FTC Commissioner Maureen Ohlhausen.'
    },
    publishedAt: '2024-01-13T16:45:00Z',
    category: 'Business'
  }
]

// Get article by ID
function getArticle(id: string): Article | undefined {
  return mockArticles.find(article => article.id === id)
}

// Generate metadata for SEO
export async function generateMetadata({
  params
}: {
  params: { id: string }
}): Promise<Metadata> {
  const article = getArticle(params.id)

  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  const description = typeof article.aiAnalysis === 'string'
    ? article.aiAnalysis
    : article.aiAnalysis.summary

  return {
    title: `${article.title} | Narrative News`,
    description,
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      publishedTime: article.publishedAt,
    },
  }
}

export default function ArticlePage({
  params
}: {
  params: { id: string }
}) {
  const article = getArticle(params.id)

  // Handle 404
  if (!article) {
    notFound()
  }

  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
  const publishedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const analysisSummary = typeof article.aiAnalysis === 'string'
    ? article.aiAnalysis
    : article.aiAnalysis.summary

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 group"
        >
          <svg
            className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Articles
        </Link>

        {/* Header Section */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="source-badge bg-gray-100 text-gray-700">
              {article.category}
            </span>
            <span className="text-gray-500">•</span>
            <time className="text-gray-600" dateTime={article.publishedAt}>
              {publishedDate} ({timeAgo})
            </time>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>
        </header>

        {/* Truth & Impact Analysis Section - Prominent at top */}
        <section className="ai-analysis rounded-xl p-6 md:p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-900">Truth & Impact Analysis</h2>
          </div>

          {typeof article.aiAnalysis === 'string' ? (
            // Simple string format (legacy)
            <div className="news-content">
              <p className="text-lg text-green-800 leading-relaxed">
                {article.aiAnalysis}
              </p>
            </div>
          ) : (
            // Enhanced structured format
            <div className="space-y-6">
              {article.aiAnalysis.truthCheck && (
                <div>
                  <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    What's True
                  </h3>
                  <p className="text-green-800 leading-relaxed pl-7">
                    {article.aiAnalysis.truthCheck}
                  </p>
                </div>
              )}

              {article.aiAnalysis.spinDetection && (
                <div>
                  <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    What's Spin
                  </h3>
                  <p className="text-green-800 leading-relaxed pl-7">
                    {article.aiAnalysis.spinDetection}
                  </p>
                </div>
              )}

              {article.aiAnalysis.realImpact && (
                <div>
                  <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Real Impact
                  </h3>
                  <p className="text-green-800 leading-relaxed pl-7">
                    {article.aiAnalysis.realImpact}
                  </p>
                </div>
              )}

              {article.aiAnalysis.commonGround && (
                <div>
                  <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Common Ground
                  </h3>
                  <p className="text-green-800 leading-relaxed pl-7">
                    {article.aiAnalysis.commonGround}
                  </p>
                </div>
              )}

              {article.aiAnalysis.biggerPicture && (
                <div>
                  <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    The Bigger Picture
                  </h3>
                  <p className="text-green-800 leading-relaxed pl-7">
                    {article.aiAnalysis.biggerPicture}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Two-Column Comparison */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Perspective */}
          <article className="perspective-left rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-blue-100 px-6 py-4 border-b border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="source-left source-badge font-bold">
                  {article.leftSource.outlet}
                </span>
                {article.leftSource.author && (
                  <span className="text-sm text-blue-700 font-medium">
                    By {article.leftSource.author}
                  </span>
                )}
              </div>
            </div>

            {/* Image */}
            {article.leftSource.imageUrl && (
              <div className="relative h-64 md:h-80 w-full bg-gray-200">
                <Image
                  src={article.leftSource.imageUrl}
                  alt={article.leftSource.headline}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-8 bg-white">
              <h3 className="text-2xl font-bold text-blue-900 mb-4 leading-tight">
                {article.leftSource.headline}
              </h3>

              <div className="news-content text-blue-800 space-y-4 mb-6">
                {article.leftSource.fullContent ? (
                  article.leftSource.fullContent.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="leading-relaxed">{article.leftSource.summary}</p>
                )}
              </div>

              <a
                href={article.leftSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Read Original Article
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </article>

          {/* Right Perspective */}
          <article className="perspective-right rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-red-100 px-6 py-4 border-b border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="source-right source-badge font-bold">
                  {article.rightSource.outlet}
                </span>
                {article.rightSource.author && (
                  <span className="text-sm text-red-700 font-medium">
                    By {article.rightSource.author}
                  </span>
                )}
              </div>
            </div>

            {/* Image */}
            {article.rightSource.imageUrl && (
              <div className="relative h-64 md:h-80 w-full bg-gray-200">
                <Image
                  src={article.rightSource.imageUrl}
                  alt={article.rightSource.headline}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-8 bg-white">
              <h3 className="text-2xl font-bold text-red-900 mb-4 leading-tight">
                {article.rightSource.headline}
              </h3>

              <div className="news-content text-red-800 space-y-4 mb-6">
                {article.rightSource.fullContent ? (
                  article.rightSource.fullContent.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="leading-relaxed">{article.rightSource.summary}</p>
                )}
              </div>

              <a
                href={article.rightSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Read Original Article
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </article>
        </div>

        {/* Share Section */}
        <section className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Found this comparison helpful?
              </h3>
              <p className="text-gray-600">
                Share it with others who value balanced news coverage
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(`Check out this article comparison: ${article.title}\n\n${analysisSummary}\n\nRead more at Narrative News`)}`}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </a>

              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Save
              </Link>
            </div>
          </div>
        </section>

        {/* Related Articles - Placeholder for future */}
        <section className="mt-12 bg-white rounded-xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            More Comparisons
          </h3>
          <p className="text-gray-600 mb-4">
            Explore other stories where we compare different perspectives
          </p>
          <Link href="/" className="btn-primary inline-block">
            View All Stories
          </Link>
        </section>
      </div>
    </div>
  )
}
