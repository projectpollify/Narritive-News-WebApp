import { AIService, AIAnalysisResult } from './ai'

// Mock OpenAI module
jest.mock('openai', () => {
  const mockCreate = jest.fn()

  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
    mockCreate,
  }
})

describe('AIService', () => {
  const mockCreate = require('openai').mockCreate

  const mockLeftArticle = {
    title: 'Climate Bill Passes Senate',
    content: 'The Senate passed landmark climate legislation today with strong Democratic support. The bill aims to reduce carbon emissions by 40% by 2030.',
    outlet: 'New York Times',
    summary: 'Major climate legislation passes with Democratic backing',
    publishedAt: new Date('2024-01-15'),
  }

  const mockRightArticle = {
    title: 'Senate Approves Controversial Energy Bill',
    content: 'The Senate approved an expensive energy bill that critics say will hurt the economy. Republicans raised concerns about job losses.',
    outlet: 'Fox News',
    summary: 'Energy bill passes despite economic concerns',
    publishedAt: new Date('2024-01-15'),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreate.mockClear()
  })

  describe('analyzeArticles', () => {
    it('should successfully analyze two articles with structured response', async () => {
      const mockAnalysisResponse = JSON.stringify({
        analysis: 'The two outlets present starkly different framing of the climate legislation. The NYT emphasizes environmental benefits and Democratic support, while Fox News focuses on economic concerns and Republican opposition.',
        keyDifferences: [
          'NYT calls it "climate legislation" while Fox calls it "energy bill"',
          'NYT highlights emissions reduction goals, Fox emphasizes costs',
          'Different sources quoted to support narratives',
        ],
        possibleMotives: [
          'NYT audience values environmental action',
          'Fox audience concerned about economic impact',
        ],
      })

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: mockAnalysisResponse,
            },
          },
        ],
      })

      const result = await AIService.analyzeArticles(mockLeftArticle, mockRightArticle)

      expect(result).toBeDefined()
      expect(result.analysis).toContain('different framing')
      expect(result.keyDifferences).toHaveLength(3)
      expect(result.possibleMotives).toHaveLength(2)
      expect(result.confidenceScore).toBeGreaterThan(0)
      expect(result.confidenceScore).toBeLessThanOrEqual(0.95)
      expect(result.readingTime).toBeGreaterThan(0)
      expect(mockCreate).toHaveBeenCalledTimes(1)
    })

    it('should handle OpenAI API failure with fallback analysis', async () => {
      mockCreate.mockRejectedValue(
        new Error('OpenAI API rate limit exceeded')
      )

      const result = await AIService.analyzeArticles(mockLeftArticle, mockRightArticle)

      expect(result).toBeDefined()
      expect(result.analysis).toContain(mockLeftArticle.outlet)
      expect(result.analysis).toContain(mockRightArticle.outlet)
      expect(result.keyDifferences).toHaveLength(3)
      expect(result.possibleMotives).toHaveLength(2)
      expect(result.confidenceScore).toBe(0.6)
      expect(result.readingTime).toBe(2)
    })

    it('should calculate reading time correctly', async () => {
      const longAnalysis = 'word '.repeat(600) // 600 words

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                analysis: longAnalysis,
                keyDifferences: ['Diff 1'],
                possibleMotives: ['Motive 1'],
              }),
            },
          },
        ],
      })

      const result = await AIService.analyzeArticles(mockLeftArticle, mockRightArticle)

      // 600 words / 200 words per minute = 3 minutes
      expect(result.readingTime).toBeGreaterThanOrEqual(3)
      expect(result.readingTime).toBeLessThanOrEqual(4)
    })

    it('should calculate confidence score based on article quality', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                analysis: 'Test analysis',
                keyDifferences: ['Diff 1'],
                possibleMotives: ['Motive 1'],
              }),
            },
          },
        ],
      })

      // High-quality articles with long content and similar titles
      const highQualityLeft = {
        ...mockLeftArticle,
        content: 'a'.repeat(3000),
        title: 'Climate Bill Passes',
      }
      const highQualityRight = {
        ...mockRightArticle,
        content: 'b'.repeat(3000),
        title: 'Climate Bill Approved',
      }

      const result = await AIService.analyzeArticles(highQualityLeft, highQualityRight)

      expect(result.confidenceScore).toBeGreaterThan(0.7)
    })

    it('should handle unstructured AI response', async () => {
      // Return plain text instead of JSON
      const unstructuredResponse = `
      The two articles show different perspectives.

      They emphasize different aspects of the story.

      Each outlet has its own editorial approach.
      `

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: unstructuredResponse,
            },
          },
        ],
      })

      const result = await AIService.analyzeArticles(mockLeftArticle, mockRightArticle)

      expect(result).toBeDefined()
      expect(result.analysis).toBeDefined()
      expect(result.analysis.length).toBeGreaterThan(0)
      expect(result.keyDifferences).toHaveLength(1)
      expect(result.possibleMotives).toHaveLength(1)
    })
  })

  describe('generateSummary', () => {
    it('should generate a summary within character limit', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Brief summary of the analysis comparing two perspectives.',
            },
          },
        ],
      })

      const analysis = 'This is a long analysis of how two news outlets cover the same story differently. It includes many details about framing, language, and bias patterns.'
      const result = await AIService.generateSummary(analysis, 280)

      expect(result.length).toBeLessThanOrEqual(280)
      expect(mockCreate).toHaveBeenCalledTimes(1)
    })

    it('should use fallback summary on API failure', async () => {
      mockCreate.mockRejectedValue(
        new Error('API error')
      )

      const analysis = 'This is a long analysis. '.repeat(50)
      const result = await AIService.generateSummary(analysis, 280)

      expect(result.length).toBeLessThanOrEqual(280)
      expect(result).toContain('...')
    })
  })

  describe('generateHeadline', () => {
    it('should generate a neutral headline', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Climate Legislation Sparks Debate Over Environmental and Economic Priorities',
            },
          },
        ],
      })

      const result = await AIService.generateHeadline(
        mockLeftArticle.title,
        mockRightArticle.title,
        'Climate Policy'
      )

      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
      expect(mockCreate).toHaveBeenCalledTimes(1)
    })

    it('should use fallback headline on API failure', async () => {
      mockCreate.mockRejectedValue(
        new Error('API error')
      )

      const result = await AIService.generateHeadline(
        mockLeftArticle.title,
        mockRightArticle.title,
        'Climate Policy'
      )

      expect(result).toContain('Climate Policy')
      expect(result).toContain('Perspectives')
    })
  })

  describe('batchAnalyze', () => {
    it('should process multiple article pairs in batches', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                analysis: 'Test analysis',
                keyDifferences: ['Diff 1'],
                possibleMotives: ['Motive 1'],
              }),
            },
          },
        ],
      })

      const articlePairs = [
        { left: mockLeftArticle, right: mockRightArticle },
        { left: mockLeftArticle, right: mockRightArticle },
        { left: mockLeftArticle, right: mockRightArticle },
        { left: mockLeftArticle, right: mockRightArticle },
      ]

      const results = await AIService.batchAnalyze(articlePairs)

      expect(results).toHaveLength(4)
      expect(results[0].analysis).toBeDefined()
      // Should be called 4 times (one per pair)
      expect(mockCreate).toHaveBeenCalledTimes(4)
    })

    it('should handle batch failures with fallback', async () => {
      mockCreate.mockRejectedValue(
        new Error('API error')
      )

      const articlePairs = [
        { left: mockLeftArticle, right: mockRightArticle },
        { left: mockLeftArticle, right: mockRightArticle },
      ]

      const results = await AIService.batchAnalyze(articlePairs)

      expect(results).toHaveLength(2)
      // Fallback analysis should be used
      expect(results[0].confidenceScore).toBe(0.6)
    })
  })

  describe('healthCheck', () => {
    it('should return healthy status when API works', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Test',
            },
          },
        ],
      })

      const result = await AIService.healthCheck()

      expect(result.status).toBe('healthy')
      expect(result.message).toContain('working correctly')
    })

    it('should return error status when API fails', async () => {
      mockCreate.mockRejectedValue(
        new Error('Connection timeout')
      )

      const result = await AIService.healthCheck()

      expect(result.status).toBe('error')
      expect(result.message).toContain('error')
    })

    it('should return error when API key is missing', async () => {
      const originalKey = process.env.OPENAI_API_KEY
      delete process.env.OPENAI_API_KEY

      const result = await AIService.healthCheck()

      expect(result.status).toBe('error')
      expect(result.message).toContain('not configured')

      // Restore API key
      process.env.OPENAI_API_KEY = originalKey
    })
  })

  describe('calculateTextSimilarity', () => {
    it('should calculate similarity between texts', () => {
      // Access private method through any type assertion for testing
      const calculateTextSimilarity = (AIService as any).calculateTextSimilarity.bind(AIService)

      const text1 = 'Climate change legislation passes Senate'
      const text2 = 'Climate change bill approved by Senate'

      const similarity = calculateTextSimilarity(text1, text2)

      expect(similarity).toBeGreaterThan(0.3) // Moderate to high similarity
      expect(similarity).toBeLessThanOrEqual(1)
    })

    it('should return 0 for completely different texts', () => {
      const calculateTextSimilarity = (AIService as any).calculateTextSimilarity.bind(AIService)

      const text1 = 'Climate change legislation'
      const text2 = 'Sports tournament results'

      const similarity = calculateTextSimilarity(text1, text2)

      expect(similarity).toBeLessThan(0.3) // Low similarity
    })
  })
})
