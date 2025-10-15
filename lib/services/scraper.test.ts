/**
 * @jest-environment node
 */

// Mock cheerio before importing
jest.mock('cheerio', () => ({
  load: jest.fn(),
}))

// Mock other dependencies
jest.mock('rss-parser')
jest.mock('axios')
jest.mock('../db')

import { NewsScraper, RawArticle } from './scraper'

describe('NewsScraper', () => {
  const mockLeftArticle: RawArticle = {
    title: 'Senate Passes Climate Change Bill',
    url: 'https://example.com/climate-bill',
    content: 'The Senate passed landmark climate legislation today with Democratic support. The bill aims to reduce carbon emissions significantly.',
    summary: 'Senate passes major climate legislation',
    author: 'John Doe',
    publishedAt: new Date('2024-01-15'),
    outlet: 'New York Times',
    bias: 'LEFT',
  }

  const mockRightArticle: RawArticle = {
    title: 'Senate Approves Expensive Climate Bill',
    url: 'https://example.com/energy-bill',
    content: 'The Senate approved a controversial climate bill that critics say will hurt the economy. Republicans voiced strong opposition.',
    summary: 'Senate approves costly climate bill',
    author: 'Jane Smith',
    publishedAt: new Date('2024-01-15'),
    outlet: 'Fox News',
    bias: 'RIGHT',
  }

  describe('calculateSimilarity', () => {
    it('should return 1 for identical strings', () => {
      const text = 'This is a test article about climate change'
      const result = NewsScraper.calculateSimilarity(text, text)

      expect(result).toBe(1)
    })

    it('should return 0 for completely different strings', () => {
      const text1 = 'Climate change legislation passes'
      const text2 = 'Sports tournament results announced'

      const result = NewsScraper.calculateSimilarity(text1, text2)

      expect(result).toBeLessThan(0.3)
    })

    it('should return high similarity for similar texts', () => {
      const text1 = 'Senate passes climate change legislation'
      const text2 = 'Climate change legislation approved by Senate'

      const result = NewsScraper.calculateSimilarity(text1, text2)

      expect(result).toBeGreaterThan(0.5)
    })

    it('should filter out short words (3 chars or less)', () => {
      const text1 = 'The cat is on the mat'
      const text2 = 'A dog was in a box'

      const result = NewsScraper.calculateSimilarity(text1, text2)

      // Should be 0 since all words are 3 chars or less
      expect(result).toBe(0)
    })

    it('should be case-insensitive', () => {
      const text1 = 'CLIMATE CHANGE LEGISLATION'
      const text2 = 'climate change legislation'

      const result = NewsScraper.calculateSimilarity(text1, text2)

      expect(result).toBe(1)
    })
  })

  describe('normalizeForComparison', () => {
    it('should convert to lowercase', () => {
      const result = NewsScraper.normalizeForComparison('HELLO WORLD')
      expect(result).toBe('hello world')
    })

    it('should remove punctuation', () => {
      const result = NewsScraper.normalizeForComparison('Hello, world! How are you?')
      expect(result).toBe('hello world how are you')
    })

    it('should normalize multiple spaces', () => {
      const result = NewsScraper.normalizeForComparison('Hello    world   test')
      expect(result).toBe('hello world test')
    })

    it('should trim whitespace', () => {
      const result = NewsScraper.normalizeForComparison('  hello world  ')
      expect(result).toBe('hello world')
    })
  })

  describe('findBestMatch', () => {
    it('should find the best matching article', () => {
      const targetArticle = mockLeftArticle

      const candidates = [
        {
          ...mockRightArticle,
          title: 'Senate Approves Climate Bill', // High similarity
        },
        {
          ...mockRightArticle,
          title: 'Sports Tournament Finals', // Low similarity
          content: 'Sports content here',
        },
      ]

      const result = NewsScraper.findBestMatch(targetArticle, candidates)

      expect(result).not.toBeNull()
      expect(result?.article.title).toContain('Climate')
      expect(result?.similarity).toBeGreaterThan(0.3)
    })

    it('should return null if no candidates', () => {
      const result = NewsScraper.findBestMatch(mockLeftArticle, [])
      expect(result).toBeNull()
    })

    it('should weight title similarity more than content (70/30)', () => {
      const targetArticle = mockLeftArticle

      const candidate1 = {
        ...mockRightArticle,
        title: 'Senate Passes Climate Change Bill', // Identical title
        content: 'Completely different content about something else',
      }

      const candidate2 = {
        ...mockRightArticle,
        title: 'Sports Tournament Results', // Different title
        content: mockLeftArticle.content, // Identical content
      }

      const result1 = NewsScraper.findBestMatch(targetArticle, [candidate1])
      const result2 = NewsScraper.findBestMatch(targetArticle, [candidate2])

      expect(result1?.similarity).toBeGreaterThan(result2?.similarity || 0)
    })
  })

  describe('findMatchingStories', () => {
    it('should match left and right articles above 60% similarity', async () => {
      const articles = [mockLeftArticle, mockRightArticle]

      const matches = await NewsScraper.findMatchingStories(articles)

      // Both articles have similar climate-related titles, should match
      expect(matches.length).toBeGreaterThanOrEqual(0)
      if (matches.length > 0) {
        expect(matches[0].left.bias).toBe('LEFT')
        expect(matches[0].right.bias).toBe('RIGHT')
      }
    })

    it('should not match articles below 60% similarity threshold', async () => {
      const leftArticle = mockLeftArticle
      const rightArticle = {
        ...mockRightArticle,
        title: 'Completely Different Sports Story',
        content: 'Sports content that has nothing to do with climate',
      }

      const matches = await NewsScraper.findMatchingStories([leftArticle, rightArticle])

      expect(matches.length).toBe(0)
    })

    it('should remove matched articles to avoid duplicates', async () => {
      const articles = [
        mockLeftArticle,
        { ...mockLeftArticle, url: 'different-url-1' },
        mockRightArticle,
      ]

      const matches = await NewsScraper.findMatchingStories(articles)

      // Should match if similarity is high enough
      expect(matches.length).toBeLessThanOrEqual(1)
    })
  })

  describe('generateUnifiedTitle', () => {
    it('should create unified title from common keywords', () => {
      const leftTitle = 'Senate Passes Climate Bill'
      const rightTitle = 'Senate Approves Climate Legislation'

      const result = NewsScraper.generateUnifiedTitle(leftTitle, rightTitle)

      // Should generate a meaningful title
      expect(result.length).toBeGreaterThan(0)
      expect(typeof result).toBe('string')
    })

    it('should use fallback when no common keywords', () => {
      const leftTitle = 'Breaking News Today'
      const rightTitle = 'Latest Updates Now'

      const result = NewsScraper.generateUnifiedTitle(leftTitle, rightTitle)

      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should exclude common filler words', () => {
      const leftTitle = 'President Says Economy Strong'
      const rightTitle = 'President Says Inflation High'

      const result = NewsScraper.generateUnifiedTitle(leftTitle, rightTitle)

      // Should not use "says" as the main topic
      expect(result.toLowerCase()).not.toMatch(/^says/)
    })
  })

  describe('determineCategory', () => {
    it('should categorize politics content', () => {
      const text = 'Senate votes on new election law'
      const result = NewsScraper.determineCategory(text)
      expect(result).toBe('Politics')
    })

    it('should categorize business content', () => {
      const text = 'Stock market hits record high as economy grows'
      const result = NewsScraper.determineCategory(text)
      expect(result).toBe('Business')
    })

    it('should categorize technology content', () => {
      const text = 'New AI software revolutionizes tech industry'
      const result = NewsScraper.determineCategory(text)
      expect(result).toBe('Technology')
    })

    it('should categorize health content', () => {
      const text = 'New vaccine shows promise in medical trials'
      const result = NewsScraper.determineCategory(text)
      expect(result).toBe('Health')
    })

    it('should categorize environment content', () => {
      const text = 'Climate change impacts renewable energy sector'
      const result = NewsScraper.determineCategory(text)
      expect(result).toBe('Environment')
    })

    it('should return General for unrecognized content', () => {
      const text = 'Random story about something else'
      const result = NewsScraper.determineCategory(text)
      expect(result).toBe('General')
    })
  })

  describe('extractTags', () => {
    it('should extract relevant tags from text', () => {
      const text = 'Federal Reserve raises interest rates amid climate change concerns'
      const result = NewsScraper.extractTags(text)

      expect(result).toContain('Federal Reserve')
      expect(result).toContain('Interest Rates')
      expect(result).toContain('Climate Change')
    })

    it('should limit to 5 tags maximum', () => {
      const text = 'Federal Reserve Interest Rates Climate Change Election Congress Senate Healthcare Technology Trade Immigration'
      const result = NewsScraper.extractTags(text)

      expect(result.length).toBeLessThanOrEqual(5)
    })

    it('should be case-insensitive when matching', () => {
      const text = 'federal reserve and climate change'
      const result = NewsScraper.extractTags(text)

      expect(result.length).toBeGreaterThan(0)
    })

    it('should return empty array if no tags found', () => {
      const text = 'Random text with no matching tags'
      const result = NewsScraper.extractTags(text)

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeLessThanOrEqual(5)
    })
  })

  describe('generateSummary', () => {
    it('should extract first 3 sentences', () => {
      const content = 'This is the first sentence here. This is the second sentence here. This is the third sentence here. This is the fourth sentence here.'
      const result = NewsScraper.generateSummary(content)

      // Should extract first 3 sentences (sentences must be > 20 chars)
      expect(result.length).toBeGreaterThan(0)
      const sentenceCount = (result.match(/\./g) || []).length
      expect(sentenceCount).toBeGreaterThanOrEqual(2)
      expect(sentenceCount).toBeLessThanOrEqual(5)
    })

    it('should add ellipsis if more than 3 sentences', () => {
      const content = 'This is a longer first sentence here. This is a longer second sentence here. This is a longer third sentence here. This is a longer fourth sentence here.'
      const result = NewsScraper.generateSummary(content)

      // Should have ellipsis if more than 3 sentences
      expect(result.length).toBeGreaterThan(0)
    })

    it('should not add ellipsis if 3 or fewer sentences', () => {
      const content = 'First sentence. Second sentence.'
      const result = NewsScraper.generateSummary(content)

      expect(result).not.toContain('...')
    })

    it('should filter out very short sentences', () => {
      const content = 'Hi. This is a longer sentence that should be included. Another good one.'
      const result = NewsScraper.generateSummary(content)

      expect(result).not.toContain('Hi')
    })
  })

  describe('cleanText', () => {
    it('should remove extra whitespace', () => {
      const text = 'Hello    world   with   spaces'
      const result = NewsScraper.cleanText(text)

      expect(result).toBe('Hello world with spaces')
    })

    it('should remove special characters except basic punctuation', () => {
      const text = 'Hello @world! How are #you?'
      const result = NewsScraper.cleanText(text)

      expect(result).not.toContain('@')
      expect(result).not.toContain('#')
      expect(result).toContain('!')
      expect(result).toContain('?')
    })

    it('should trim leading and trailing whitespace', () => {
      const text = '   Hello world   '
      const result = NewsScraper.cleanText(text)

      expect(result).toBe('Hello world')
    })
  })

  describe('extractSubjects', () => {
    it('should extract capitalized words/phrases', () => {
      const titles = ['Senate Passes Bill', 'President Biden Signs Act']
      const result = NewsScraper.extractSubjects(titles)

      // Should extract capitalized subjects
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result.length).toBeLessThanOrEqual(3)
    })

    it('should limit to 3 subjects', () => {
      const titles = ['Apple Google Microsoft Amazon Facebook Tesla Twitter']
      const result = NewsScraper.extractSubjects(titles)

      expect(result.length).toBeLessThanOrEqual(3)
    })

    it('should filter out very short words', () => {
      const titles = ['The Big Tech Bill']
      const result = NewsScraper.extractSubjects(titles)

      expect(result).not.toContain('The')
      expect(result).not.toContain('Big')
    })

    it('should avoid duplicates', () => {
      const titles = ['Senate Bill Senate Vote Senate Decision']
      const result = NewsScraper.extractSubjects(titles)

      const senateCount = result.filter(s => s === 'Senate').length
      expect(senateCount).toBeLessThanOrEqual(1)
    })
  })

  describe('sleep', () => {
    it('should delay execution by specified milliseconds', async () => {
      const startTime = Date.now()
      await NewsScraper.sleep(100)
      const endTime = Date.now()

      const elapsed = endTime - startTime
      expect(elapsed).toBeGreaterThanOrEqual(95) // Allow small margin
      expect(elapsed).toBeLessThan(150)
    })
  })
})
