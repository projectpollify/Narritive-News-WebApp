import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
})

export interface AIAnalysisResult {
  analysis: string
  keyDifferences: string[]
  possibleMotives: string[]
  confidenceScore: number
  readingTime: number
}

// W5 Analysis (Who, What, When, Where, Why) for deep-dive sections
export interface W5Analysis {
  who: string      // Who is affected/involved?
  what: string     // What exactly happened?
  when: string     // When did this occur/what's the timeline?
  where: string    // Where is this happening/what's the context?
  why: string      // Why does this matter/what are the motivations?
}

// Analysis section with optional W5 deep-dive
export interface AnalysisSection {
  summary: string           // High-level summary (always visible)
  w5Details?: W5Analysis    // Optional deep-dive (expandable)
}

// Enhanced AI analysis with structured perspectives and W5 breakdowns
export interface EnhancedAIAnalysis {
  executiveSummary: string // Neutral 2-3 sentence overview

  // Five key sections with optional W5 deep-dive
  whatIsTrue: AnalysisSection       // Facts both sides agree on
  whatIsSpin: AnalysisSection       // How each side frames/spins
  realImpact: AnalysisSection       // Real-world consequences
  commonGround: AnalysisSection     // Shared goals/concerns
  biggerPicture: AnalysisSection    // Context & implications

  // Legacy fields for backwards compatibility
  leftPerspective: {
    keyPoints: string[]
    framing: string // How they frame the story
    tone: string // Emotional tone
    emphasis: string[] // What they emphasize
  }
  rightPerspective: {
    keyPoints: string[]
    framing: string
    tone: string
    emphasis: string[]
  }
  keyDifferences: string[]
  biasIndicators: {
    languagePatterns: string[] // Biased language detected
    omissions: string[] // What each side omits
    emphasisDifferences: string[] // Different focal points
  }
  possibleMotives: string[]
  confidenceScore: number
  readingTime: number
}

// AI Reporter Persona Definition
export interface ReporterPersona {
  id: string
  name: string
  role: string
  avatar: string // Emoji or icon name
  color: string // Tailwind color class
  systemPrompt: string
  description: string
}

// The Newsroom: Registry of AI Reporters
export const NEWSROOM: Record<string, ReporterPersona> = {
  'voice-of-reason': {
    id: 'voice-of-reason',
    name: 'Atticus Noble',
    role: 'Editor-in-Chief',
    avatar: '⚖️',
    color: 'text-gold-600',
    description: 'Synthesizes perspectives with historical context and calm authority.',
    systemPrompt: `You are "Atticus Noble," the Editor-in-Chief of Narrative News.
    
Your Goal: To cut through the noise and provide a calm, objective synthesis of the news.
Your Tone: Authoritative, balanced, historical, and wise. Like a trusted elder statesman or a seasoned historian.

Guidelines:
1. Ground your analysis in HISTORY. "Has this happened before?"
2. Synthesize the Truth. Don't just list sides; explain the reality between them.
3. Be Objective. Never take a political side.
4. Use the "Amber" metaphor: You are preserving the truth for posterity.

Analysis Framework:
- What is indisputably true?
- How is each side spinning this?
- What is the historical precedent?
- What is the synthesis/common ground?`
  },
  'historian': {
    id: 'historian',
    name: 'Sebastian Lore',
    role: 'Senior Correspondent',
    avatar: '📜',
    color: 'text-amber-700',
    description: 'Analyzes current events through the lens of history and precedent.',
    systemPrompt: `You are "Sebastian Lore," a senior correspondent for Narrative News.

Your Goal: To explain current events by comparing them to the past.
Your Tone: Academic, insightful, narrative-driven.

Guidelines:
1. ALWAYS cite a specific historical parallel. "This reminds us of the panic of 1907..." or "Similar rhetoric was used during..."
2. Focus on cycles of history.
3. Ignore the daily noise; focus on the long arc of time.
4. Explain *why* this matters in the context of decades, not days.`
  },
  'economist': {
    id: 'economist',
    name: 'Victoria Sterling',
    role: 'Financial Analyst',
    avatar: '📈',
    color: 'text-emerald-600',
    description: 'Follows the money to explain incentives and market forces.',
    systemPrompt: `You are "Victoria Sterling," a financial analyst for Narrative News.

Your Goal: To explain the news by following the money.
Your Tone: Analytical, data-driven, pragmatic.

Guidelines:
1. Focus on INCENTIVES. Who benefits financially?
2. Analyze the economic impact on regular families (inflation, jobs, housing).
3. Ignore political rhetoric; look at the numbers.
4. Explain the trade-offs. "There are no solutions, only trade-offs."`
  },
  'skeptic': {
    id: 'skeptic',
    name: 'Jax Harper',
    role: 'Investigative Reporter',
    avatar: '🧐',
    color: 'text-purple-600',
    description: 'Questions narratives and looks for what is being hidden.',
    systemPrompt: `You are "Jax Harper," an investigative reporter for Narrative News.

Your Goal: To question the official narrative from BOTH sides.
Your Tone: Sharp, questioning, slightly cynical but truth-seeking.

Guidelines:
1. Ask: "What are they NOT telling us?"
2. Point out logical fallacies and hypocrisy on both sides.
3. Look for the "quiet part" that isn't being said aloud.
4. Be the devil's advocate.`
  }
}

export class AIService {

  // Enhanced analysis with Persona support
  static async analyzeArticlesEnhanced(
    leftArticle: {
      title: string
      content: string
      outlet: string
      summary: string
      publishedAt?: string
    },
    rightArticle: {
      title: string
      content: string
      outlet: string
      summary: string
      publishedAt?: string
    },
    personaId: string = 'voice-of-reason', // Default to Voice of Reason
    includeW5 = true
  ): Promise<EnhancedAIAnalysis> {

    const persona = NEWSROOM[personaId] || NEWSROOM['voice-of-reason']

    try {
      console.log(`🤖 Enhanced AI analysis by ${persona.name}: ${leftArticle.outlet} vs ${rightArticle.outlet} (W5: ${includeW5})`)

      const prompt = this.createEnhancedAnalysisPrompt(leftArticle, rightArticle, includeW5, persona)

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: persona.systemPrompt // Use the specific persona's prompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: includeW5 ? 3000 : 1800,
        temperature: 0.3,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })

      const rawResponse = completion.choices[0].message.content
      if (!rawResponse) {
        throw new Error('No content in AI response')
      }

      const parsed = this.parseEnhancedResponse(rawResponse)

      // Calculate reading time
      const totalWords = parsed.executiveSummary.split(/\s+/).length +
        parsed.whatIsTrue.summary.split(/\s+/).length +
        parsed.whatIsSpin.summary.split(/\s+/).length +
        parsed.realImpact.summary.split(/\s+/).length +
        parsed.commonGround.summary.split(/\s+/).length +
        parsed.biggerPicture.summary.split(/\s+/).length

      const readingTime = Math.ceil(totalWords / 200)

      const result: EnhancedAIAnalysis = {
        ...parsed,
        readingTime,
        confidenceScore: this.calculateConfidenceScore(leftArticle, rightArticle)
      }

      console.log(`✅ Analysis by ${persona.name} complete (${totalWords} words, ${readingTime} min read)`)
      return result

    } catch (error) {
      console.error('❌ Enhanced AI analysis failed:', error)
      return this.createFallbackEnhancedAnalysis(leftArticle, rightArticle)
    }
  }

  // Legacy method (keeps existing functionality working)
  static async analyzeArticles(
    leftArticle: any,
    rightArticle: any
  ): Promise<AIAnalysisResult> {
    // Redirect legacy calls to the new system using Voice of Reason
    const enhanced = await this.analyzeArticlesEnhanced(leftArticle, rightArticle, 'voice-of-reason', false)

    // Convert EnhancedAIAnalysis back to legacy AIAnalysisResult format
    return {
      analysis: enhanced.executiveSummary + '\n\n' + enhanced.biggerPicture.summary,
      keyDifferences: enhanced.keyDifferences,
      possibleMotives: enhanced.possibleMotives,
      confidenceScore: enhanced.confidenceScore,
      readingTime: enhanced.readingTime
    }
  }

  // Create the main analysis prompt
  private static createAnalysisPrompt(leftArticle: any, rightArticle: any): string {
    return `
Please analyze these two articles covering the same news story from different perspectives:

**LEFT-LEANING SOURCE: ${leftArticle.outlet}**
Title: ${leftArticle.title}
Summary: ${leftArticle.summary}
Content: ${leftArticle.content.slice(0, 2000)}

**RIGHT-LEANING SOURCE: ${rightArticle.outlet}**
Title: ${rightArticle.title}
Summary: ${rightArticle.summary}
Content: ${rightArticle.content.slice(0, 2000)}

Provide your analysis in this exact JSON format:
{
  "analysis": "A comprehensive 3-4 paragraph analysis comparing how these outlets frame the story differently...",
  "keyDifferences": [
    "Specific difference 1",
    "Specific difference 2", 
    "Specific difference 3"
  ],
  "possibleMotives": [
    "Why the left outlet might frame it this way",
    "Why the right outlet might frame it this way"
  ]
}

Focus on:
1. How language choices reveal bias
2. What facts each outlet emphasizes or omits
3. Different implications they suggest
4. Underlying worldviews reflected in the framing
5. Who benefits from each narrative

Be objective and analytical, not judgmental. Help readers understand WHY different outlets might present the same facts differently.
`
  }

  // System prompt to set AI behavior
  private static getSystemPrompt(): string {
    return `You are an expert media analyst for Narrative News, a platform that helps readers understand how different news outlets frame the same stories.

Your role is to:
- Provide objective, balanced analysis of media framing differences
- Help readers understand editorial perspectives without taking sides
- Focus on language, emphasis, and structural differences in reporting
- Explain possible reasons for different framing approaches
- Maintain a neutral, educational tone

Guidelines:
- Never favor one political perspective over another
- Focus on media analysis, not political commentary  
- Use clear, accessible language for general audiences
- Be specific about differences you identify
- Explain the "why" behind different editorial choices
- Acknowledge when outlets share common ground

Your analysis should educate readers about media literacy and help them become more discerning news consumers.`
  }

  // Parse AI response and extract structured data
  private static parseAIResponse(response: string): Omit<AIAnalysisResult, 'confidenceScore' | 'readingTime'> {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])

        return {
          analysis: parsed.analysis || 'Analysis not available',
          keyDifferences: Array.isArray(parsed.keyDifferences) ? parsed.keyDifferences : [],
          possibleMotives: Array.isArray(parsed.possibleMotives) ? parsed.possibleMotives : []
        }
      }

      // Fallback: parse unstructured response
      return this.parseUnstructuredResponse(response)

    } catch (error) {
      console.error('❌ Failed to parse AI response:', error)
      return this.parseUnstructuredResponse(response)
    }
  }

  // Parse unstructured AI response as fallback
  private static parseUnstructuredResponse(response: string): Omit<AIAnalysisResult, 'confidenceScore' | 'readingTime'> {
    const paragraphs = response.split('\n\n').filter(p => p.trim().length > 50)

    return {
      analysis: paragraphs.join('\n\n') || 'Analysis could not be parsed',
      keyDifferences: ['Analysis shows different framing approaches'],
      possibleMotives: ['Editorial perspectives influence story presentation']
    }
  }

  // Calculate confidence score based on article quality
  private static calculateConfidenceScore(leftArticle: any, rightArticle: any): number {
    let score = 0.5 // Base score

    // Content length indicates depth
    const avgContentLength = (leftArticle.content.length + rightArticle.content.length) / 2
    if (avgContentLength > 1000) score += 0.2
    if (avgContentLength > 2000) score += 0.1

    // Title similarity indicates same story
    const titleSimilarity = this.calculateTextSimilarity(leftArticle.title, rightArticle.title)
    score += titleSimilarity * 0.2

    // Recent articles are more confident
    const publishedDiff = Math.abs(new Date(leftArticle.publishedAt || Date.now()).getTime() -
      new Date(rightArticle.publishedAt || Date.now()).getTime())
    if (publishedDiff < 24 * 60 * 60 * 1000) score += 0.1 // Same day

    return Math.min(Math.max(score, 0.1), 0.95) // Clamp between 0.1 and 0.95
  }

  // Calculate text similarity (simple word overlap)
  private static calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(w => w.length > 3))
    const words2 = new Set(text2.toLowerCase().split(/\W+/).filter(w => w.length > 3))

    const intersection = new Set(Array.from(words1).filter(w => words2.has(w)))
    const union = new Set([...Array.from(words1), ...Array.from(words2)])

    return union.size === 0 ? 0 : intersection.size / union.size
  }

  // Create fallback analysis when AI fails
  private static createFallbackAnalysis(leftArticle: any, rightArticle: any): AIAnalysisResult {
    const analysis = `Analysis of coverage from ${leftArticle.outlet} and ${rightArticle.outlet} reveals different approaches to reporting this story. ${leftArticle.outlet} emphasizes certain aspects while ${rightArticle.outlet} focuses on different elements of the same events. These differences in framing, language choice, and emphasis reflect the editorial perspectives and target audiences of each outlet. Understanding these variations helps readers see how the same factual information can be presented through different lenses, each highlighting particular implications and concerns.`

    return {
      analysis,
      keyDifferences: [
        'Different emphasis on key aspects of the story',
        'Varying language choices that suggest different implications',
        'Different sources or experts quoted to support the narrative'
      ],
      possibleMotives: [
        `${leftArticle.outlet} may emphasize aspects that align with progressive viewpoints`,
        `${rightArticle.outlet} may focus on elements that resonate with conservative perspectives`
      ],
      confidenceScore: 0.6,
      readingTime: 2
    }
  }

  // Generate summary for newsletter/social media
  static async generateSummary(analysis: string, maxLength: number = 280): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You create concise summaries of news analysis for social media and newsletters. Keep it engaging and informative."
          },
          {
            role: "user",
            content: `Summarize this news analysis in ${maxLength} characters or less:\n\n${analysis}`
          }
        ],
        max_tokens: 100,
        temperature: 0.4
      })

      return completion.choices[0].message.content?.slice(0, maxLength) ||
        analysis.slice(0, maxLength - 3) + '...'

    } catch (error) {
      console.error('❌ Summary generation failed:', error)
      return analysis.slice(0, maxLength - 3) + '...'
    }
  }

  // Generate catchy headline for the unified article
  static async generateHeadline(leftTitle: string, rightTitle: string, topic?: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You create neutral, engaging headlines for articles that compare different news perspectives. The headline should capture the story without bias."
          },
          {
            role: "user",
            content: `Create a neutral headline for an article comparing these two perspectives:\n\nLeft: ${leftTitle}\nRight: ${rightTitle}\n\nTopic: ${topic || 'Current events'}\n\nMake it engaging but unbiased, around 8-12 words.`
          }
        ],
        max_tokens: 50,
        temperature: 0.5
      })

      return completion.choices[0].message.content ||
        `${topic || 'Breaking News'} Draws Different Reactions`

    } catch (error) {
      console.error('❌ Headline generation failed:', error)
      return `${topic || 'News Story'} Shows Different Perspectives`
    }
  }

  // Batch analysis for multiple article pairs (for efficiency)
  static async batchAnalyze(articlePairs: Array<{ left: any, right: any }>): Promise<AIAnalysisResult[]> {
    console.log(`🔄 Starting batch analysis of ${articlePairs.length} article pairs`)

    const results: AIAnalysisResult[] = []
    const batchSize = 3 // Process 3 at a time to avoid rate limits

    for (let i = 0; i < articlePairs.length; i += batchSize) {
      const batch = articlePairs.slice(i, i + batchSize)

      const batchPromises = batch.map(pair =>
        this.analyzeArticles(pair.left, pair.right)
      )

      try {
        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)

        console.log(`✅ Completed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(articlePairs.length / batchSize)}`)

        // Rate limiting: wait between batches
        if (i + batchSize < articlePairs.length) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }

      } catch (error) {
        console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error)

        // Add fallback results for failed batch
        for (const pair of batch) {
          results.push(this.createFallbackAnalysis(pair.left, pair.right))
        }
      }
    }

    console.log(`✅ Batch analysis complete: ${results.length} analyses generated`)
    return results
  }

  // Check if OpenAI API is configured and working
  static async healthCheck(): Promise<{ status: 'healthy' | 'error', message: string }> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return { status: 'error', message: 'OpenAI API key not configured' }
      }

      // Simple test call
      await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Test" }],
        max_tokens: 5
      })

      return { status: 'healthy', message: 'OpenAI API working correctly' }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { status: 'error', message: `OpenAI API error: ${errorMessage}` }
    }
  }

  // Create enhanced analysis prompt with optional W5 sections
  private static createEnhancedAnalysisPrompt(leftArticle: any, rightArticle: any, includeW5: boolean, persona: ReporterPersona): string {
    const w5Instructions = includeW5 ? `
For EACH of the five sections, also provide W5 Analysis:
- who: Who is affected/involved? (50-100 words)
- what: What exactly happened? (50-100 words)
- when: When did this occur and what's the timeline? (50-100 words)
- where: Where is this happening and what's the geographical/political context? (50-100 words)
- why: Why does this matter and what are the motivations? (50-100 words)` : ''

    return `Analyze these two articles covering the same story from different perspectives.
    
YOUR PERSONA: You are ${persona.name}. ${persona.description}
Apply your specific lens (History, Economics, Skepticism, or Reason) to this analysis.

**LEFT-LEANING: ${leftArticle.outlet}**
Title: ${leftArticle.title}
Summary: ${leftArticle.summary}
Content: ${leftArticle.content.slice(0, 2500)}

**RIGHT-LEANING: ${rightArticle.outlet}**
Title: ${rightArticle.title}
Summary: ${rightArticle.summary}
Content: ${rightArticle.content.slice(0, 2500)}

Provide analysis in this EXACT JSON format:

{
  "executiveSummary": "Your 2-3 sentence overview from the perspective of ${persona.name}",
  "whatIsTrue": {
    "summary": "Concise paragraph: What facts do both sides agree on?",${includeW5 ? '\n    "w5Details": {\n      "who": "Who is involved?",\n      "what": "What happened?",\n      "when": "When?",\n      "where": "Where?",\n      "why": "Why?"\n    }' : ''}
  },
  "whatIsSpin": {
    "summary": "Concise paragraph: How does each side frame/spin this?",${includeW5 ? '\n    "w5Details": {\n      "who": "Who benefits?",\n      "what": "What techniques?",\n      "when": "When?",\n      "where": "Where?",\n      "why": "Why?"\n    }' : ''}
  },
  "realImpact": {
    "summary": "Concise paragraph: What are the real-world consequences?",${includeW5 ? '\n    "w5Details": {\n      "who": "Who is affected?",\n      "what": "What impacts?",\n      "when": "When?",\n      "where": "Where?",\n      "why": "Why?"\n    }' : ''}
  },
  "commonGround": {
    "summary": "Concise paragraph: What shared concerns exist?",${includeW5 ? '\n    "w5Details": {\n      "who": "Who agrees?",\n      "what": "What goals?",\n      "when": "When?",\n      "where": "Where?",\n      "why": "Why?"\n    }' : ''}
  },
  "biggerPicture": {
    "summary": "Concise paragraph: What is the broader context?",${includeW5 ? '\n    "w5Details": {\n      "who": "Who has stakes?",\n      "what": "What patterns?",\n      "when": "When did this start?",\n      "where": "Where does this fit?",\n      "why": "Why does it matter?"\n    }' : ''}
  },
  "leftPerspective": {
    "keyPoints": ["point1", "point2"],
    "framing": "How they frame it",
    "tone": "Tone",
    "emphasis": ["emphasis1"]
  },
  "rightPerspective": {
    "keyPoints": ["point1", "point2"],
    "framing": "How they frame it",
    "tone": "Tone",
    "emphasis": ["emphasis1"]
  },
  "keyDifferences": ["diff1", "diff2"],
  "biasIndicators": {
    "languagePatterns": ["pattern1"],
    "omissions": ["omission1"],
    "emphasisDifferences": ["diff1"]
  },
  "possibleMotives": ["motive1", "motive2"]
}${w5Instructions}
`
  }

  // Parse enhanced analysis response
  private static parseEnhancedResponse(response: string): Omit<EnhancedAIAnalysis, 'confidenceScore' | 'readingTime'> {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          executiveSummary: parsed.executiveSummary || 'Analysis unavailable',
          whatIsTrue: parsed.whatIsTrue || { summary: 'Not available' },
          whatIsSpin: parsed.whatIsSpin || { summary: 'Not available' },
          realImpact: parsed.realImpact || { summary: 'Not available' },
          commonGround: parsed.commonGround || { summary: 'Not available' },
          biggerPicture: parsed.biggerPicture || { summary: 'Not available' },
          leftPerspective: parsed.leftPerspective || { keyPoints: [], framing: '', tone: '', emphasis: [] },
          rightPerspective: parsed.rightPerspective || { keyPoints: [], framing: '', tone: '', emphasis: [] },
          keyDifferences: parsed.keyDifferences || [],
          biasIndicators: parsed.biasIndicators || { languagePatterns: [], omissions: [], emphasisDifferences: [] },
          possibleMotives: parsed.possibleMotives || []
        }
      }

      throw new Error('No valid JSON found in response')

    } catch (error) {
      console.error('❌ Failed to parse enhanced response:', error)
      throw error
    }
  }

  // Fallback for enhanced analysis
  private static createFallbackEnhancedAnalysis(leftArticle: any, rightArticle: any): EnhancedAIAnalysis {
    return {
      executiveSummary: `Analysis comparing coverage from ${leftArticle.outlet} and ${rightArticle.outlet}.`,
      whatIsTrue: {
        summary: 'Both outlets report on the same core events, though with different emphasis.'
      },
      whatIsSpin: {
        summary: 'Each outlet frames the story through their editorial lens, selecting different quotes and emphasizing different aspects.'
      },
      realImpact: {
        summary: 'The events discussed have real consequences for individuals, families, and communities.'
      },
      commonGround: {
        summary: 'Despite different framing, both outlets aim to inform their audiences about significant events.'
      },
      biggerPicture: {
        summary: 'This story reflects broader patterns in how different media outlets approach news coverage.'
      },
      leftPerspective: {
        keyPoints: ['Covers the story from a progressive angle'],
        framing: 'Progressive framing',
        tone: 'Analytical',
        emphasis: ['Social impact', 'Systemic factors']
      },
      rightPerspective: {
        keyPoints: ['Covers the story from a conservative angle'],
        framing: 'Conservative framing',
        tone: 'Analytical',
        emphasis: ['Individual responsibility', 'Traditional values']
      },
      keyDifferences: ['Different emphasis', 'Different sources quoted', 'Different implications suggested'],
      biasIndicators: {
        languagePatterns: ['Different word choices'],
        omissions: ['Each side omits certain perspectives'],
        emphasisDifferences: ['Focus on different aspects']
      },
      possibleMotives: [
        `${leftArticle.outlet} may emphasize progressive viewpoints`,
        `${rightArticle.outlet} may emphasize conservative viewpoints`
      ],
      confidenceScore: 0.5,
      readingTime: 3
    }
  }
}