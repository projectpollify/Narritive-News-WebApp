import Parser from 'rss-parser'
import * as cheerio from 'cheerio'
import axios from 'axios'
import { DatabaseService } from './db'

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
        } catch (error) {
          console.error(`❌ Error scraping ${feed.outlet}:`, error.message)
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
        } catch (error) {
          console.error('❌ Error processing article pair:', error.message)
        }
      }
      
      console.log(`✅ Automation complete: ${processedCount} new articles created`)
      return { success: true, processed: processedCount, total: matchedPairs.length }
      
    } catch (error) {
      console.error('❌ Automation cycle failed:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Scrape articles from RSS feed
  static async scrapeRSSFeed(feedUrl: string, outlet: string, bias: 'LEFT' | 'RIGHT' | 'CENTER'): Promise<RawArticle[]> {
    const feed = await parser.parseURL(feedUrl)
    const articles: RawArticle[] = []
    
    // Process only recent articles (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    for (const item of feed.items.slice(0, 10)) { // Limit to 10 most recent
      try {
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
          author: item.creator || item.author,
          publishedAt,
          outlet,
          bias
        }
        
        articles.push(article)
        
        // Mark as processed to avoid duplicates
        await DatabaseService.markArticleAsProcessed(article.url, article.title, outlet)
        
      } catch (error) {
        console.error(`Error processing item from ${outlet}:`, error.message)
        continue
      }
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
      
    } catch (error) {
      console.error(`Error extracting content from ${url}:`, error.message)
      return ''
    }
  }
  
  // Find matching stories between left and right sources
  static async findMatchingStories(articles: RawArticle[]): Promise<Array<{left: RawArticle, right: RawArticle}>> {
    const leftArticles = articles.filter(a => a.bias === 'LEFT')
    const rightArticles = articles.filter(a => a.bias === 'RIGHT')
    
    const matches: Array<{left: RawArticle, right: RawArticle}> = []
    
    for (const leftArticle of leftArticles) {
      const bestMatch = this.findBestMatch(leftArticle, rightArticles)
      
      if (bestMatch && bestMatch.similarity > 0.6) { // 60% similarity threshold
        matches.push({
          left: leftArticle,
          right: bestMatch.article
        })
        
        // Remove matched article to avoid duplicates
        const index = rightArticles.indexOf(bestMatch.article)
        rightArticles.splice(index, 1)
      }
    }
    
    return matches
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
    
    const intersection = new Set([...words1].filter(w => words2.has(w)))
    const union = new Set([...words1, ...words2])
    
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
      
    } catch (error) {
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
    const subjects = []
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
      
      return result.analysis
      
    } catch (error) {
      console.error('❌ AI analysis failed, using fallback:', error)
      return `Analysis reveals different perspectives on this story. ${leftArticle.outlet} emphasizes certain aspects while ${rightArticle.outlet} focuses on different elements. The framing and language choices reflect underlying editorial viewpoints that shape how readers understand the events.`
    }
  }
  
  // Utility function for delays
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}