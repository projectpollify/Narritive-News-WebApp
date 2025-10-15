import Parser from 'rss-parser'
import * as cheerio from 'cheerio'
import axios from 'axios'
import { DatabaseService } from '../db'
import { CacheService, CacheKeys } from '@/lib/cache/redis'
import crypto from 'crypto'
import nlp from 'compromise'

const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'contentSnippet']
  }
})

export interface RawArticle {
  title: string
  url: string
  content: string
  summary: string
  author?: string
  publishedAt: Date
  outlet: string
  bias: 'LEFT' | 'RIGHT' | 'CENTER'
}

export interface MatchScore {
  titleSimilarity: number // 0-40 points
  entityOverlap: number // 0-30 points
  temporalProximity: number // 0-20 points
  categoryMatch: number // 0-10 points
  totalScore: number // 0-100 points
}

export class NewsScraper {
  
  // Main automation function - called by cron job
  static async runAutomation() {
    console.log('🔄 Starting news automation cycle...')
    
    try {
      // Get active RSS feeds
      const feeds = await DatabaseService.getActiveRSSFeeds()
      console.log(`📰 Found ${feeds.length} active RSS feeds`)
      
      // Collect articles from all feeds
      const allArticles: RawArticle[] = []
      
      for (const feed of feeds) {
        try {
          const articles = await this.scrapeRSSFeed(feed.url, feed.outlet, feed.bias as any)
          allArticles.push(...articles)
          
          // Update last checked timestamp
          await DatabaseService.updateFeedLastChecked(feed.id)
          
          console.log(`✅ Scraped ${articles.length} articles from ${feed.outlet}`)
        } catch (error: any) {
          console.error(`❌ Error scraping ${feed.outlet}:`, error?.message || String(error))
          continue
        }
        
        // Rate limiting - be nice to news sites
        await this.sleep(2000) // 2 second delay between feeds
      }
      
      console.log(`📊 Total articles collected: ${allArticles.length}`)
      
      // Find matching stories across different outlets
      const matchedPairs = await this.findMatchingStories(allArticles)
      console.log(`🔗 Found ${matchedPairs.length} matching story pairs`)
      
      // Process matched pairs
      let processedCount = 0
      for (const pair of matchedPairs) {
        try {
          const success = await this.processArticlePair(pair.left, pair.right)
          if (success) processedCount++
        } catch (error: any) {
          console.error('❌ Error processing article pair:', error?.message || String(error))
        }
      }
      
      console.log(`✅ Automation complete: ${processedCount} new articles created`)
      return { success: true, processed: processedCount, total: matchedPairs.length }
      
    } catch (error: any) {
      console.error('❌ Automation cycle failed:', error)
      return { success: false, error: error?.message || String(error) }
    }
  }
  
  // Scrape articles from RSS feed
  static async scrapeRSSFeed(feedUrl: string, outlet: string, bias: 'LEFT' | 'RIGHT' | 'CENTER'): Promise<RawArticle[]> {
    // Try cache first (30 min TTL)
    const cacheKey = CacheKeys.rssFeed(feedUrl)
    const cached = await CacheService.get<RawArticle[]>(cacheKey)
    if (cached) {
      console.log(`📦 Using cached RSS feed for ${outlet}`)
      return cached
    }

    const feed = await parser.parseURL(feedUrl)
    const articles: RawArticle[] = []

    // Process only recent articles (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    for (const item of feed.items.slice(0, 10)) { // Limit to 10 most recent
      try {
        // Skip if no link
        if (!item.link) continue

        const publishedAt = new Date(item.pubDate || item.isoDate || Date.now())

        // Skip old articles
        if (publishedAt < oneDayAgo) continue

        // Skip if already processed
        if (await DatabaseService.isArticleProcessed(item.link)) continue

        // Extract full content from article URL
        const fullContent = await this.extractArticleContent(item.link)
        
        const article: RawArticle = {
          title: this.cleanText(item.title || ''),
          url: item.link || '',
          content: fullContent,
          summary: this.generateSummary(fullContent || item.contentSnippet || ''),
          author: (item as any).creator || (item as any).author,
          publishedAt,
          outlet,
          bias
        }
        
        articles.push(article)
        
        // Mark as processed to avoid duplicates
        await DatabaseService.markArticleAsProcessed(article.url, article.title, outlet)
        
      } catch (error: any) {
        console.error(`Error processing item from ${outlet}:`, error?.message || String(error))
        continue
      }
    }

    // Cache for 30 minutes (1800 seconds)
    if (articles.length > 0) {
      await CacheService.set(cacheKey, articles, 1800)
    }

    return articles
  }
  
  // Extract full article content from URL
  static async extractArticleContent(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      const $ = cheerio.load(response.data)
      
      // Remove unwanted elements
      $('script, style, nav, footer, .ad, .advertisement, .social-share').remove()
      
      // Try common article content selectors
      const selectors = [
        'article p',
        '.article-content p',
        '.story-content p',
        '.entry-content p',
        '[data-module="ArticleBody"] p',
        '.article-body p',
        'main p'
      ]
      
      let content = ''
      for (const selector of selectors) {
        const paragraphs = $(selector)
        if (paragraphs.length > 2) {
          content = paragraphs.map((_, el) => $(el).text()).get().join('\n\n')
          break
        }
      }
      
      // Fallback: get all paragraphs
      if (!content) {
        content = $('p').map((_, el) => $(el).text()).get().join('\n\n')
      }
      
      return this.cleanText(content).slice(0, 5000) // Limit content length
      
    } catch (error: any) {
      console.error(`Error extracting content from ${url}:`, error?.message || String(error))
      return ''
    }
  }
  
  // Find matching stories between left and right sources (enhanced with NER)
  static async findMatchingStories(articles: RawArticle[]): Promise<Array<{left: RawArticle, right: RawArticle, score?: MatchScore}>> {
    const leftArticles = articles.filter(a => a.bias === 'LEFT')
    const rightArticles = articles.filter(a => a.bias === 'RIGHT')

    const matches: Array<{left: RawArticle, right: RawArticle, score?: MatchScore}> = []

    for (const leftArticle of leftArticles) {
      let bestMatch: {article: RawArticle, score: MatchScore} | null = null

      for (const rightArticle of rightArticles) {
        const score = this.calculateEnhancedMatch(leftArticle, rightArticle)

        if (!bestMatch || score.totalScore > bestMatch.score.totalScore) {
          bestMatch = { article: rightArticle, score }
        }
      }

      // Threshold: 70+ points = same story (raised from 60%)
      if (bestMatch && bestMatch.score.totalScore >= 70) {
        matches.push({
          left: leftArticle,
          right: bestMatch.article,
          score: bestMatch.score
        })

        // Remove matched article to avoid duplicates
        const index = rightArticles.indexOf(bestMatch.article)
        rightArticles.splice(index, 1)
      }
    }

    return matches
  }

  // Enhanced matching with Named Entity Recognition and scoring
  static calculateEnhancedMatch(article1: RawArticle, article2: RawArticle): MatchScore {
    // 1. Title similarity (0-40 points) - weighted heavily
    const titleScore = this.calculateTitleSimilarity(article1.title, article2.title) * 40

    // 2. Named entity overlap (0-30 points)
    const entityScore = this.calculateEntityOverlap(article1, article2)

    // 3. Temporal proximity (0-20 points)
    const temporalScore = this.calculateTemporalProximity(
      article1.publishedAt,
      article2.publishedAt
    )

    // 4. Category match (0-10 points)
    const category1 = this.determineCategory(article1.title + ' ' + article1.content.slice(0, 200))
    const category2 = this.determineCategory(article2.title + ' ' + article2.content.slice(0, 200))
    const categoryScore = category1 === category2 ? 10 : 0

    const totalScore = Math.min(titleScore + entityScore + temporalScore + categoryScore, 100)

    return {
      titleSimilarity: Math.round(titleScore),
      entityOverlap: Math.round(entityScore),
      temporalProximity: Math.round(temporalScore),
      categoryMatch: categoryScore,
      totalScore: Math.round(totalScore)
    }
  }

  // Calculate title similarity score (returns 0-1)
  static calculateTitleSimilarity(title1: string, title2: string): number {
    const norm1 = this.normalizeForComparison(title1)
    const norm2 = this.normalizeForComparison(title2)

    // Use existing similarity calculation
    return this.calculateSimilarity(norm1, norm2)
  }

  // Calculate entity overlap using NLP (returns 0-30 points)
  static calculateEntityOverlap(article1: RawArticle, article2: RawArticle): number {
    try {
      // Extract named entities from both articles
      const text1 = nlp(article1.title + ' ' + article1.content.slice(0, 500))
      const text2 = nlp(article2.title + ' ' + article2.content.slice(0, 500))

      const entities1 = new Set([
        ...text1.people().out('array'),
        ...text1.places().out('array'),
        ...text1.organizations().out('array')
      ])

      const entities2 = new Set([
        ...text2.people().out('array'),
        ...text2.places().out('array'),
        ...text2.organizations().out('array')
      ])

      // Calculate Jaccard similarity
      const intersection = new Set(Array.from(entities1).filter(e => entities2.has(e)))
      const union = new Set([...Array.from(entities1), ...Array.from(entities2)])

      const similarity = union.size > 0 ? intersection.size / union.size : 0

      return Math.min(similarity * 30, 30) // Max 30 points
    } catch (error) {
      console.error('Error calculating entity overlap:', error)
      return 0
    }
  }

  // Calculate temporal proximity score (returns 0-20 points)
  static calculateTemporalProximity(date1: Date, date2: Date): number {
    const hoursDiff = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60)

    if (hoursDiff <= 6) return 20 // Within 6 hours: full points
    if (hoursDiff <= 12) return 15 // 6-12 hours: 15 points
    if (hoursDiff <= 24) return 10 // 12-24 hours: 10 points
    if (hoursDiff <= 48) return 5 // 24-48 hours: 5 points
    return 0 // > 48 hours: 0 points
  }
  
  // Find best matching article using title and content similarity
  static findBestMatch(targetArticle: RawArticle, candidateArticles: RawArticle[]): {article: RawArticle, similarity: number} | null {
    let bestMatch: {article: RawArticle, similarity: number} | null = null
    
    for (const candidate of candidateArticles) {
      const titleSimilarity = this.calculateSimilarity(
        this.normalizeForComparison(targetArticle.title),
        this.normalizeForComparison(candidate.title)
      )
      
      const contentSimilarity = this.calculateSimilarity(
        this.normalizeForComparison(targetArticle.content.slice(0, 500)),
        this.normalizeForComparison(candidate.content.slice(0, 500))
      )
      
      // Weighted similarity (title more important)
      const overallSimilarity = (titleSimilarity * 0.7) + (contentSimilarity * 0.3)
      
      if (!bestMatch || overallSimilarity > bestMatch.similarity) {
        bestMatch = { article: candidate, similarity: overallSimilarity }
      }
    }
    
    return bestMatch
  }
  
  // Calculate similarity between two strings using word overlap
  static calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 3))
    const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 3))

    const intersection = new Set(Array.from(words1).filter(w => words2.has(w)))
    const union = new Set([...Array.from(words1), ...Array.from(words2)])

    return union.size === 0 ? 0 : intersection.size / union.size
  }
  
  // Normalize text for comparison
  static normalizeForComparison(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }
  
  // Process a matched pair of articles
  static async processArticlePair(leftArticle: RawArticle, rightArticle: RawArticle): Promise<boolean> {
    try {
      // Generate AI analysis (will implement in next module)
      const aiAnalysis = await this.generateAIAnalysis(leftArticle, rightArticle)
      
      // Create unified title
      const unifiedTitle = this.generateUnifiedTitle(leftArticle.title, rightArticle.title)
      
      // Generate slug
      const slug = await DatabaseService.generateUniqueSlug(unifiedTitle)
      
      // Determine category
      const category = this.determineCategory(leftArticle.title + ' ' + rightArticle.title)
      
      // Save to database
      await DatabaseService.createArticle({
        title: unifiedTitle,
        slug,
        aiAnalysis,
        category,
        tags: this.extractTags(leftArticle.title + ' ' + rightArticle.title),
        publishedAt: new Date(),
        leftSource: {
          outlet: leftArticle.outlet,
          headline: leftArticle.title,
          summary: leftArticle.summary,
          fullContent: leftArticle.content,
          url: leftArticle.url,
          author: leftArticle.author,
          publishedAt: leftArticle.publishedAt,
          bias: leftArticle.bias
        },
        rightSource: {
          outlet: rightArticle.outlet,
          headline: rightArticle.title,
          summary: rightArticle.summary,
          fullContent: rightArticle.content,
          url: rightArticle.url,
          author: rightArticle.author,
          publishedAt: rightArticle.publishedAt,
          bias: rightArticle.bias
        }
      })
      
      return true
      
    } catch (error: any) {
      console.error('Error processing article pair:', error)
      return false
    }
  }
  
  // Generate unified title from both articles
  static generateUnifiedTitle(leftTitle: string, rightTitle: string): string {
    // Extract common keywords
    const leftWords = leftTitle.toLowerCase().split(/\s+/)
    const rightWords = rightTitle.toLowerCase().split(/\s+/)
    const commonWords = leftWords.filter(word => 
      rightWords.includes(word) && word.length > 3 && 
      !['says', 'after', 'amid', 'over', 'with', 'from'].includes(word)
    )
    
    if (commonWords.length > 0) {
      const mainTopic = commonWords[0]
      return `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Sparks Different Reactions`
    }
    
    // Fallback to extracting main subject
    const subjects = this.extractSubjects([leftTitle, rightTitle])
    return subjects.length > 0 ? `${subjects[0]} Draws Mixed Response` : 'Breaking News Analysis'
  }
  
  // Extract key subjects from titles
  static extractSubjects(titles: string[]): string[] {
    const subjects: string[] = []
    const capitalizedWords = titles.join(' ').match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || []

    for (const word of capitalizedWords) {
      if (word.length > 3 && !subjects.includes(word)) {
        subjects.push(word)
      }
    }

    return subjects.slice(0, 3)
  }
  
  // Determine article category
  static determineCategory(text: string): string {
    const categories = {
      'Politics': ['election', 'vote', 'congress', 'senate', 'president', 'government', 'policy', 'law', 'bill'],
      'Business': ['economy', 'market', 'stock', 'finance', 'trade', 'company', 'business', 'economic'],
      'Technology': ['tech', 'digital', 'internet', 'software', 'ai', 'artificial intelligence', 'cyber'],
      'Health': ['health', 'medical', 'disease', 'vaccine', 'hospital', 'doctor', 'medicine'],
      'International': ['china', 'russia', 'europe', 'international', 'foreign', 'global', 'world'],
      'Environment': ['climate', 'environment', 'energy', 'green', 'carbon', 'renewable']
    }
    
    const lowercaseText = text.toLowerCase()
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowercaseText.includes(keyword))) {
        return category
      }
    }
    
    return 'General'
  }
  
  // Extract tags from text
  static extractTags(text: string): string[] {
    const commonTags = ['Federal Reserve', 'Interest Rates', 'Climate Change', 'Election', 'Congress', 'Senate', 'Healthcare', 'Technology', 'Trade', 'Immigration']
    const found = []
    
    for (const tag of commonTags) {
      if (text.toLowerCase().includes(tag.toLowerCase())) {
        found.push(tag)
      }
    }
    
    return found.slice(0, 5)
  }
  
  // Generate summary from content
  static generateSummary(content: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20)
    return sentences.slice(0, 3).join('. ').trim() + (sentences.length > 3 ? '...' : '')
  }
  
  // Clean and normalize text
  static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?-]/g, '')
      .trim()
  }
  
  // Generate AI analysis using OpenAI
  static async generateAIAnalysis(leftArticle: RawArticle, rightArticle: RawArticle): Promise<string> {
    try {
      // Create content hash for caching
      const contentHash = crypto
        .createHash('md5')
        .update(leftArticle.url + rightArticle.url)
        .digest('hex')

      // Try cache first (24 hour TTL)
      const cacheKey = CacheKeys.aiAnalysis(contentHash)
      const cached = await CacheService.get<string>(cacheKey)
      if (cached) {
        console.log('📦 Using cached AI analysis')
        return cached
      }

      const { AIService } = await import('./ai')

      const result = await AIService.analyzeArticles(
        {
          title: leftArticle.title,
          content: leftArticle.content,
          outlet: leftArticle.outlet,
          summary: leftArticle.summary
        },
        {
          title: rightArticle.title,
          content: rightArticle.content,
          outlet: rightArticle.outlet,
          summary: rightArticle.summary
        }
      )

      // Cache for 24 hours (86400 seconds)
      await CacheService.set(cacheKey, result.analysis, 86400)

      return result.analysis

    } catch (error: any) {
      console.error('❌ AI analysis failed, using fallback:', error)
      return `Analysis reveals different perspectives on this story. ${leftArticle.outlet} emphasizes certain aspects while ${rightArticle.outlet} focuses on different elements. The framing and language choices reflect underlying editorial viewpoints that shape how readers understand the events.`
    }
  }
  
  // Utility function for delays
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}