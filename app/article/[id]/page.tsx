import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { NEWSROOM } from '@/lib/services/ai'

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
  contentHash?: string
  onChainTx?: string
  onChainTimestamp?: string
  personaId?: string // New field for the reporter
}

// Mock data - same as homepage (will be replaced with API/database later)
const mockArticles: Article[] = [
  {
    id: '1',
    title: 'The Great Divide: How Media Polarization is Reshaping Reality',
    aiAnalysis: `There's a peculiar phenomenon happening in living rooms, coffee shops, and dinner tables across the country. Two people can witness the same event, read about the same news story, and walk away with entirely different understandings of what actually happened. This isn't a failure of perception—it's the predictable outcome of a media landscape that has fractured into parallel universes, each with its own version of truth.

### The Same Story, Two Worlds

Consider how a single policy announcement plays out across the media spectrum. On one channel, it's framed as a bold step toward progress, supported by expert analysis and hopeful projections. Switch to another, and the same announcement becomes a reckless overreach, dissected by different experts who predict dire consequences. The facts remain identical. The reality presented does not.

This divergence goes beyond traditional editorial bias. We've entered an era where media outlets don't just interpret events differently—they increasingly select which events matter at all. A protest that dominates one network's coverage for days may receive only a passing mention on another. A scandal that consumes one media ecosystem might be entirely absent from another. The result is that consumers of different media don't just disagree on opinions; they disagree on what is happening in the world.

### The Architecture of Division

How did we arrive here? The answer lies in a combination of technological disruption, economic incentives, and human psychology.

The collapse of local news created a vacuum that national, partisan outlets rushed to fill. When your local paper folded, it took with it coverage of school boards, city councils, and community events—the shared civic experiences that gave neighbors common ground. What replaced it was national programming that sorted audiences not by geography but by ideology.

The economics of attention accelerated this sorting. In a fragmented media market, the surest path to audience loyalty is emotional engagement. Outrage, fear, and tribal validation keep viewers watching and clicking. Nuance and complexity, by contrast, send them searching for clearer narratives elsewhere. Media organizations didn't conspire to divide the public—they simply followed the incentives, and the incentives rewarded polarization.

Social media amplified these dynamics exponentially. Algorithms designed to maximize engagement learned quickly that conflict performs better than consensus. The platforms became sorting machines, serving users content that confirmed their existing beliefs while hiding perspectives that might challenge them. Each scroll reinforced the user's worldview while making opposing views seem not just wrong but incomprehensible.

### Living in Different Realities

The consequences extend far beyond political disagreement. When communities consume entirely different information diets, they lose the shared foundation necessary for democratic deliberation. Compromise becomes impossible when each side believes the other is operating from fabricated facts. Trust erodes—not just in institutions but in the very possibility of objective truth.

Families fracture along these lines. Thanksgiving dinners become minefields not because relatives hold different values but because they literally cannot agree on what has happened in the world. One family member's reliable news source is another's propaganda outlet. The argument isn't about interpretation; it's about reality itself.

Perhaps most troubling is how this polarization reshapes perception itself. Psychological research consistently shows that partisan identity now influences how people process basic factual information. Show partisans the same economic data, and their assessment of whether the economy is improving or declining tracks almost perfectly with whether their preferred party holds power. The facts haven't changed. The filter through which facts are processed has.

### The Feedback Loop of Distrust

Media polarization creates its own self-reinforcing cycle. As trust in mainstream sources declines, audiences seek alternatives that confirm their suspicions about institutional bias. These alternatives, often operating with fewer journalistic standards, provide the validation audiences crave while deepening their distrust of traditional media. Each side points to the other's media diet as evidence of manipulation, never considering that the same accusation is being leveled in reverse.

This feedback loop has proven remarkably resistant to correction. Fact-checking, once hoped to be a remedy, has itself become polarized. Audiences dismiss fact-checks that contradict their beliefs as further evidence of bias. The very act of attempting to establish shared facts is now viewed through partisan lenses.

### Finding Common Ground

Is there a path forward? Some observers place hope in generational change, noting that younger audiences consume media differently and may develop new norms around information evaluation. Others point to emerging platforms designed to bridge divides by exposing users to diverse perspectives.

But perhaps the most important step is the most personal: cultivating awareness of our own information environments. This means actively seeking sources that challenge comfortable assumptions. It means sitting with the discomfort of encountering perspectives that seem wrong or even offensive. It means distinguishing between disagreeing with someone's conclusions and dismissing their entire information diet as illegitimate.

The media landscape will continue evolving, shaped by technologies and incentives we cannot fully predict. What remains within our control is how we navigate it—whether we allow ourselves to be sorted into separate realities or insist on the difficult work of maintaining shared ground.

The divide is real. Whether it continues to widen depends on choices we make not just as citizens and consumers but as neighbors still capable of recognizing each other across the gap.`,
    leftSource: {
      outlet: 'Progressive Lens',
      headline: 'Policy Hailed as Historic Step Forward',
      summary: 'Coverage emphasizes the benefits of the new policy, citing expert support and projecting positive long-term outcomes for the community.',
      url: '#',
      imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=400&fit=crop',
      author: 'Sarah Jenkins'
    },
    rightSource: {
      outlet: 'Conservative View',
      headline: 'New Policy Called Reckless Overreach',
      summary: 'Coverage focuses on the potential risks and costs of the policy, featuring critics who warn of unintended consequences and government excess.',
      url: '#',
      imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5963631df?w=800&h=400&fit=crop',
      author: 'Michael Stone'
    },
    publishedAt: '2024-01-20T09:00:00Z',
    category: 'Deep Dive',
    contentHash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    onChainTx: '0x123abc456def7890123abc456def7890123abc456def7890',
    onChainTimestamp: '2024-01-20T09:05:00Z',
    personaId: 'voice-of-reason'
  },
  {
    id: '2',
    title: 'Climate Summit Reaches Historic Agreement',
    aiAnalysis: 'Coverage shows stark differences in emphasis: progressive outlets celebrate breakthrough commitments while conservative sources question economic costs and implementation feasibility. The climate agreement represents a major diplomatic achievement, but the two perspectives highlight fundamental disagreements about priorities and trade-offs.',
    personaId: 'historian',
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

  // Get the reporter persona (default to Voice of Reason if missing)
  const persona = article.personaId ? NEWSROOM[article.personaId] : NEWSROOM['voice-of-reason']

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Navigation */}
        <Link
          href="/"
          className="inline-flex items-center text-gold-600 hover:text-navy-900 mb-8 group font-medium tracking-wide uppercase text-xs transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Analysis
        </Link>

        {/* Header Section */}
        <header className="mb-12 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block px-3 py-1 bg-navy-900 text-white text-xs font-bold uppercase tracking-widest rounded-sm">
              {article.category}
            </span>
            <span className="text-gray-400">•</span>
            <time className="text-gray-500 text-sm font-medium uppercase tracking-wide" dateTime={article.publishedAt}>
              {publishedDate}
            </time>
          </div>

          <h1 className="text-4xl md:text-6xl font-serif font-bold text-navy-900 mb-6 leading-tight">
            {article.title}
          </h1>
        </header>

        {/* Blockchain Verification Badge */}
        {(article.contentHash || article.id === '1') && (
          <div className="mb-12 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full w-fit border border-gray-100">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-navy-900">Truth Chain Verified:</span>
            <span className="font-mono text-xs text-gray-400">
              {article.contentHash ? `${article.contentHash.substring(0, 8)}...` : '0x7f9a...e8f9'}
            </span>
            <a href="#" className="text-gold-600 hover:text-navy-900 underline decoration-gold-500/30 hover:decoration-gold-600 transition-all ml-1 text-xs uppercase tracking-wide font-bold">
              Verify Record
            </a>
          </div>
        )}

        {/* Truth & Impact Analysis Section - Prominent at top */}
        <section className={`bg-white rounded-sm shadow-card border-t-4 ${persona.color.replace('text-', 'border-')} p-8 md:p-10 mb-12 relative overflow-hidden`}>
          <div className={`absolute top-0 right-0 w-64 h-64 ${persona.color.replace('text-', 'bg-').replace('600', '100').replace('700', '100')} rounded-full opacity-10 -mr-32 -mt-32 blur-3xl`}></div>

          <div className="relative z-10">
            <div className="flex items-center mb-8 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 bg-navy-900 rounded-sm flex items-center justify-center mr-4 shadow-sm text-2xl">
                {persona.avatar}
              </div>
              <div>
                <h2 className={`text-2xl font-serif font-bold text-navy-900 flex items-center gap-2`}>
                  Analysis by <span className={persona.color}>{persona.name}</span>
                </h2>
                <p className="text-sm text-gray-500">{persona.role} • {persona.description}</p>
              </div>
            </div>

            {typeof article.aiAnalysis === 'string' ? (
              // Simple string format (legacy) - now with better formatting
              <div className="news-content space-y-6">
                {article.aiAnalysis.split('\n\n').map((block, index) => {
                  // Handle Headers
                  if (block.startsWith('###')) {
                    return (
                      <h3 key={index} className="text-2xl font-serif font-bold text-navy-900 mt-8 mb-4">
                        {block.replace('###', '').trim()}
                      </h3>
                    )
                  }
                  // Handle Subtitles (lines that start with "An in-depth analysis")
                  if (block.startsWith('An in-depth analysis')) {
                    return (
                      <p key={index} className="text-xl text-gray-600 font-light leading-relaxed italic mb-8">
                        {block}
                      </p>
                    )
                  }
                  // Handle Standard Paragraphs
                  return (
                    <p key={index} className="text-lg text-gray-800 leading-relaxed font-serif">
                      {block}
                    </p>
                  )
                })}
              </div>
            ) : (
              // Enhanced structured format
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  {article.aiAnalysis.truthCheck && (
                    <div>
                      <h3 className="text-sm font-bold text-navy-900 uppercase tracking-widest mb-3 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        What's True
                      </h3>
                      <p className="text-gray-700 leading-relaxed bg-green-50/50 p-4 rounded-sm border-l-2 border-green-500">
                        {article.aiAnalysis.truthCheck}
                      </p>
                    </div>
                  )}

                  {article.aiAnalysis.spinDetection && (
                    <div>
                      <h3 className="text-sm font-bold text-navy-900 uppercase tracking-widest mb-3 flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Spin Detection
                      </h3>
                      <p className="text-gray-700 leading-relaxed bg-red-50/50 p-4 rounded-sm border-l-2 border-red-500">
                        {article.aiAnalysis.spinDetection}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  {article.aiAnalysis.realImpact && (
                    <div>
                      <h3 className="text-sm font-bold text-navy-900 uppercase tracking-widest mb-3 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        Real Impact
                      </h3>
                      <p className="text-gray-700 leading-relaxed bg-blue-50/50 p-4 rounded-sm border-l-2 border-blue-500">
                        {article.aiAnalysis.realImpact}
                      </p>
                    </div>
                  )}

                  {article.aiAnalysis.commonGround && (
                    <div>
                      <h3 className="text-sm font-bold text-navy-900 uppercase tracking-widest mb-3 flex items-center">
                        <span className="w-2 h-2 bg-gold-500 rounded-full mr-2"></span>
                        Common Ground
                      </h3>
                      <p className="text-gray-700 leading-relaxed bg-gold-50/30 p-4 rounded-sm border-l-2 border-gold-500">
                        {article.aiAnalysis.commonGround}
                      </p>
                    </div>
                  )}
                </div>

                {article.aiAnalysis.biggerPicture && (
                  <div className="md:col-span-2 mt-4 pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-serif font-bold text-navy-900 mb-3">
                      The Bigger Picture
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed italic">
                      {article.aiAnalysis.biggerPicture}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Two-Column Comparison */}
        <div className="grid lg:grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-sm overflow-hidden shadow-card">
          {/* Left Perspective */}
          <article className="bg-white relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-democrat"></div>

            {/* Header */}
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-democrat uppercase tracking-wider flex items-center">
                  <span className="w-2 h-2 bg-democrat rounded-full mr-2"></span>
                  {article.leftSource.outlet}
                </span>
                {article.leftSource.author && (
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    By {article.leftSource.author}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-serif font-bold text-navy-900 leading-tight group-hover:text-democrat transition-colors">
                {article.leftSource.headline}
              </h3>
            </div>

            {/* Image */}
            {article.leftSource.imageUrl && (
              <div className="relative h-64 w-full bg-gray-200 grayscale group-hover:grayscale-0 transition-all duration-500">
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
            <div className="p-8">
              <div className="news-content text-gray-700 space-y-4 mb-8 font-serif leading-relaxed">
                {article.leftSource.fullContent ? (
                  article.leftSource.fullContent.split('\n\n').map((paragraph, index) => (
                    <p key={index}>
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p>{article.leftSource.summary}</p>
                )}
              </div>

              <a
                href={article.leftSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-bold text-democrat hover:text-navy-900 uppercase tracking-wide transition-colors"
              >
                Read Original Article
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </article>

          {/* Right Perspective */}
          <article className="bg-white relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-republican"></div>

            {/* Header */}
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-republican uppercase tracking-wider flex items-center">
                  <span className="w-2 h-2 bg-republican rounded-full mr-2"></span>
                  {article.rightSource.outlet}
                </span>
                {article.rightSource.author && (
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    By {article.rightSource.author}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-serif font-bold text-navy-900 leading-tight group-hover:text-republican transition-colors">
                {article.rightSource.headline}
              </h3>
            </div>

            {/* Image */}
            {article.rightSource.imageUrl && (
              <div className="relative h-64 w-full bg-gray-200 grayscale group-hover:grayscale-0 transition-all duration-500">
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
            <div className="p-8">
              <div className="news-content text-gray-700 space-y-4 mb-8 font-serif leading-relaxed">
                {article.rightSource.fullContent ? (
                  article.rightSource.fullContent.split('\n\n').map((paragraph, index) => (
                    <p key={index}>
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p>{article.rightSource.summary}</p>
                )}
              </div>

              <a
                href={article.rightSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-bold text-republican hover:text-navy-900 uppercase tracking-wide transition-colors"
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
        <section className="mt-16 pt-12 border-t border-gray-200 text-center">
          <h3 className="text-xl font-serif font-bold text-navy-900 mb-4">
            Share this analysis
          </h3>
          <div className="flex items-center justify-center gap-4">
            <a
              href={`mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(`Check out this article comparison: ${article.title}\n\n${analysisSummary}\n\nRead more at Narrative News`)}`}
              className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 hover:border-gold-500 text-navy-900 rounded-sm transition-colors shadow-sm font-medium"
            >
              <svg className="w-5 h-5 mr-2 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>

            {/* Preserved in Amber Badge */}
            {article.onChainTx && (
              <a
                href={`https://gateway.irys.xyz/${article.onChainTx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-sm hover:bg-amber-200 transition-colors"
              >
                <span>🔒</span>
                <span className="font-serif italic">Preserved in Amber</span>
              </a>
            )}
            <button
              className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 hover:border-gold-500 text-navy-900 rounded-sm transition-colors shadow-sm font-medium"
            >
              <svg className="w-5 h-5 mr-2 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Copy Link
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
