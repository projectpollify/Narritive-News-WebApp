import Link from 'next/link'
import { FeedbackControl } from '@/components/features/feedback-control'
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
    publishedAt: '2025-11-30T09:00:00Z',
    category: 'Deep Dive',
    contentHash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    onChainTx: '0x123abc456def7890123abc456def7890123abc456def7890',
    onChainTimestamp: '2025-11-30T09:05:00Z',
    personaId: 'voice-of-reason'
  },
  {
    id: '2',
    title: 'Defense Secretary Under Fire Over Alleged "Kill Order"',
    aiAnalysis: {
      summary: 'Reports of a controversial order to eliminate survivors of a drug boat strike have ignited a firestorm. Liberal outlets frame this as a potential war crime and a failure of command, while conservative sources defend the Secretary against what they call a fabricated smear campaign designed to undermine national security efforts.',
      truthCheck: 'Defense Secretary Hegseth has confirmed that a strike took place against a drug smuggling vessel. The Washington Post has published allegations based on anonymous sources claiming a "kill everybody" order was given. Hegseth has publicly denied giving such an order, calling the report "fabricated."',
      spinDetection: 'Liberal sources emphasize the term "massacre" and focus on the vulnerability of the survivors. Conservative sources focus on the "narco-terrorist" threat and use terms like "smear campaign" and "fake news" to discredit the allegations.',
      realImpact: 'This controversy could trigger congressional investigations and impact the administration\'s ability to conduct future anti-narcotics operations. It also deepens the rift between the military leadership and the press.',
      commonGround: 'Both sides agree that drug trafficking poses a significant national security threat and that military operations in the region are ongoing.',
      biggerPicture: `In the murky waters of the Caribbean, a new battlefront has opened—not just against drug cartels, but over the very nature of truth in modern warfare. The allegations against Defense Secretary Pete Hegseth represent a collision of two distinct worldviews: one that prioritizes strict adherence to international law and human rights, even in the heat of battle, and another that views such constraints as weaknesses exploited by ruthless enemies.

### The Fog of War vs. The Rule of Law

At the heart of this controversy is a specific, chilling allegation: that a high-ranking U.S. official ordered the execution of survivors who posed no immediate threat. If true, this would constitute a grave violation of the Geneva Conventions and U.S. military code. The liberal perspective, championed by outlets like The Washington Post, treats this possibility with appropriate gravity, demanding accountability and transparency. For them, the moral standing of the United States is at stake. If we become a nation that executes survivors, we lose the moral high ground that distinguishes us from the cartels we fight.

### The "Fake News" Defense

Conversely, the conservative defense, articulated by Hegseth and echoed by Fox News, frames this not as a legal question but as a political one. By labeling the report "fabricated" and "fake news," they shift the debate from *what happened* to *who is telling the story*. In this narrative, the mainstream media is an adversary as dangerous as the drug lords—a "fifth column" intent on undermining the administration's efforts to secure the border and protect the homeland. This defense resonates with a base that has long lost trust in institutional reporting, viewing every critical story as a partisan hit job.

### The Reality of "Kinetic" Operations

The term "kinetic strike"—used by Hegseth to describe the operation—is military shorthand for lethal force. It is a sterile term for a violent reality. The drug war has increasingly militarized, with cartels employing sophisticated weaponry and tactics. In this high-stakes environment, the line between law enforcement and combat blurs. Proponents of aggressive tactics argue that hesitation costs lives and that "narco-terrorists" should not be afforded the same protections as conventional soldiers. Critics argue that this slippery slope leads to barbarism.

### A fractured Public Trust

Ultimately, this story illustrates the profound fracture in public trust. One half of the country sees a potential war criminal running the Pentagon; the other sees a hero being persecuted by a dishonest press. Without an independent, universally trusted arbiter to establish the facts—video evidence, for instance, or a bipartisan investigation—these two realities will never converge. The truth of what happened on that boat may remain buried at sea, leaving only the political wake it created.`
    },
    personaId: 'historian',
    leftSource: {
      outlet: 'Washington Post',
      headline: 'Defense Secretary Accused of Ordering Massacre of Survivors',
      summary: 'A bombshell report alleges Defense Secretary Hegseth ordered a second strike to "kill everybody" on a disabled drug boat, raising serious questions about legality and morality...',
      url: '#',
      imageUrl: '/images/hegseth-left.png',
      author: 'Investigative Team',
      fullContent: 'In a revelation that has sent shockwaves through the Pentagon and Capitol Hill, The Washington Post has obtained classified information alleging that Defense Secretary Pete Hegseth personally ordered the execution of survivors following a military strike on a suspected drug smuggling vessel in the Caribbean.\n\nAccording to multiple whistleblowers with direct knowledge of the operation, a U.S. drone strike initially disabled the vessel, leaving at least two survivors clinging to the wreckage. Standard rules of engagement require that incapacitated combatants or suspects be offered quarter and taken into custody. However, the report alleges that when informed of the survivors, Secretary Hegseth issued a direct order to "kill everybody" and "leave no witnesses."\n\nA second strike was subsequently launched, obliterating the wreckage and killing the remaining individuals. "It was a massacre," said one official who spoke on the condition of anonymity. "They were sitting ducks. There was no threat. It was a straight-up execution."\n\nLegal experts warn that if these allegations are substantiated, they could constitute a war crime under the Geneva Conventions and U.S. law. "Ordering the death of a combatant who is hors de combat—out of the fight due to injury or wreckage—is a grave breach of international law," said human rights attorney Sarah Miller. "This goes beyond aggressive tactics; this is criminal conduct."\n\nDemocratic lawmakers are already calling for an immediate congressional investigation and Hegseth\'s resignation. "We cannot have a Defense Secretary who believes he is above the law," said Senator Chris Murphy. "The American military does not execute survivors. This is a stain on our national honor."'
    },
    rightSource: {
      outlet: 'Fox News',
      headline: 'Hegseth Slams "Fabricated" Hit Piece; Defends Action Against Narco-Terrorists',
      summary: 'Pete Hegseth vehemently denies the allegations, calling them "fake news" and asserting that the operation was a lawful strike against dangerous criminals threatening American security...',
      url: '#',
      imageUrl: '/images/hegseth-right.png',
      author: 'Defense Correspondent',
      fullContent: 'Defense Secretary Pete Hegseth is firing back at what he calls a "disgusting and completely fabricated" smear campaign by The Washington Post, following a report that accused him of ordering unlawful strikes on drug smugglers.\n\nIn a fiery press conference today, Hegseth categorically denied the allegation that he ordered the execution of survivors. "This is fake news, plain and simple," Hegseth declared, flanked by military leadership. "The Washington Post is acting as the propaganda arm for the cartels. They would rather attack our brave men and women in uniform than report the truth about the narco-terrorists threatening our border."\n\nHegseth clarified that the operation in question was a "lawful, kinetic strike" against a high-value target carrying tons of lethal fentanyl bound for American streets. He emphasized that the rules of engagement were followed strictly and that the vessel posed an imminent threat.\n\n"We are in a war," Hegseth stated. "These aren\'t innocent fishermen; these are paramilitary organizations that kill Americans every single day with their poison. We will not apologize for defending this country."\n\nSupporters have rallied around the Secretary, viewing the allegations as the latest attempt by the liberal media and the "Deep State" to undermine the Trump administration\'s tough-on-crime agenda. "They can\'t stand that we are finally taking the fight to the enemy," said a senior administration official. "This is just another hoax designed to weaken our military."'
    },
    publishedAt: '2025-12-01T08:00:00Z',
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

            {/* Feedback Control - Top of Article */}
            <div className="mb-8 flex justify-end">
              <FeedbackControl
                articleId={article.id}
                initialUpvotes={124}
                initialDownvotes={12}
                variant="minimal"
              />
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


              </div>
            )}
          </div>
        </section>

        {/* The Perspectives Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-serif font-bold text-navy-900 mb-10 text-center">The Perspectives</h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Source */}
            <article className="bg-white rounded-sm shadow-card overflow-hidden border-t-4 border-democrat">
              {article.leftSource.imageUrl && (
                <div className="relative h-64 w-full">
                  <Image
                    src={article.leftSource.imageUrl}
                    alt={article.leftSource.headline}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="bg-democrat px-2 py-1 text-xs font-bold uppercase tracking-widest rounded-sm mb-2 inline-block">
                      Left Perspective
                    </span>
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-democrat font-bold uppercase tracking-wider text-sm">
                    {article.leftSource.outlet}
                  </span>
                  {article.leftSource.author && (
                    <span className="text-gray-400 text-sm italic">by {article.leftSource.author}</span>
                  )}
                </div>

                <h3 className="text-2xl font-serif font-bold text-navy-900 mb-6 leading-tight">
                  {article.leftSource.headline}
                </h3>

                <div className="prose prose-lg text-gray-600">
                  {article.leftSource.fullContent ? (
                    article.leftSource.fullContent.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4 leading-relaxed">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p>{article.leftSource.summary}</p>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <a
                    href={article.leftSource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-democrat hover:text-navy-900 font-bold text-sm uppercase tracking-wide flex items-center group"
                  >
                    Read Original Article
                    <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>

            {/* Right Source */}
            <article className="bg-white rounded-sm shadow-card overflow-hidden border-t-4 border-republican">
              {article.rightSource.imageUrl && (
                <div className="relative h-64 w-full">
                  <Image
                    src={article.rightSource.imageUrl}
                    alt={article.rightSource.headline}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="bg-republican px-2 py-1 text-xs font-bold uppercase tracking-widest rounded-sm mb-2 inline-block">
                      Right Perspective
                    </span>
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-republican font-bold uppercase tracking-wider text-sm">
                    {article.rightSource.outlet}
                  </span>
                  {article.rightSource.author && (
                    <span className="text-gray-400 text-sm italic">by {article.rightSource.author}</span>
                  )}
                </div>

                <h3 className="text-2xl font-serif font-bold text-navy-900 mb-6 leading-tight">
                  {article.rightSource.headline}
                </h3>

                <div className="prose prose-lg text-gray-600">
                  {article.rightSource.fullContent ? (
                    article.rightSource.fullContent.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4 leading-relaxed">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p>{article.rightSource.summary}</p>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <a
                    href={article.rightSource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-republican hover:text-navy-900 font-bold text-sm uppercase tracking-wide flex items-center group"
                  >
                    Read Original Article
                    <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* The Bigger Picture Section - Moved here */}
        {typeof article.aiAnalysis !== 'string' && article.aiAnalysis.biggerPicture && (
          <section className="mb-20 max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-navy-900 mb-10 text-center">
              The Bigger Picture
            </h2>
            <div className="bg-white p-10 rounded-sm shadow-card border-t-4 border-navy-900">
              <div className="prose prose-lg text-gray-700 max-w-none">
                {article.aiAnalysis.biggerPicture.split('\n\n').map((block, index) => {
                  if (block.startsWith('###')) {
                    return (
                      <h4 key={index} className="text-2xl font-serif font-bold text-navy-900 mt-10 mb-4">
                        {block.replace('###', '').trim()}
                      </h4>
                    )
                  }
                  return (
                    <p key={index} className="mb-6 leading-relaxed text-lg font-serif">
                      {block}
                    </p>
                  )
                })}
              </div>
            </div>
          </section>
        )}

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

        {/* Bottom Feedback Control */}
        <section className="mt-12 mb-20 max-w-2xl mx-auto text-center">
          <div className="bg-white p-8 rounded-sm shadow-soft border border-gray-100">
            <h3 className="font-serif font-bold text-2xl text-navy-900 mb-2">
              What did you think of this analysis?
            </h3>
            <p className="text-gray-500 mb-6">
              Your anonymous vote helps us track the public sentiment on this narrative.
            </p>
            <div className="flex justify-center">
              <FeedbackControl
                articleId={article.id}
                initialUpvotes={124}
                initialDownvotes={12}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
