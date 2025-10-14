# Section 4: Performance Optimizations

**Time Estimate:** 2-3 hours
**Complexity:** MEDIUM-HIGH
**Dependencies:** Section 1 & 2 complete
**Risk Level:** Medium (system changes, caching logic)

---

## 🎯 Objectives

Optimize application performance for better user experience and scalability:

1. **Redis Caching** - Cache database queries and API responses
2. **Enhanced Story Matching** - Improve accuracy and speed
3. **Structured AI Output** - Better organized analysis
4. **Database Optimization** - Indexes and query improvements
5. **Asset Optimization** - Images, code splitting, lazy loading

---

## 🚀 Performance Goals

### Current Baseline (Estimate)
- API response time: 500-1000ms
- Homepage load: 2-3 seconds
- AI analysis: 5-10 seconds per pair
- RSS scraping: 2-5 minutes per cycle

### Target Performance
- API response time: **< 200ms** (with caching)
- Homepage load: **< 1 second**
- AI analysis: **< 5 seconds** (with optimized prompts)
- RSS scraping: **< 3 minutes** (with parallel processing)

---

## 📋 Tasks Checklist

### Task 4.1: Implement Redis Caching Layer
**Time: 1-1.5 hours**

#### A. Install Redis
```bash
npm install ioredis
npm install -D @types/ioredis
```

#### B. Create Redis Service (`lib/cache/redis.ts`)
```typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export class CacheService {
  // Get cached value
  static async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key)
    return value ? JSON.parse(value) : null
  }

  // Set cache with TTL
  static async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    await redis.setex(key, ttlSeconds, JSON.stringify(value))
  }

  // Delete cache
  static async del(key: string): Promise<void> {
    await redis.del(key)
  }

  // Clear pattern
  static async clearPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }
}
```

#### C. Caching Strategy

**What to cache:**
- ✅ Article listings (15 min TTL)
- ✅ Individual articles (1 hour TTL)
- ✅ RSS feed responses (30 min TTL)
- ✅ AI analysis results (24 hours TTL)
- ✅ Analytics data (5 min TTL)
- ✅ Processed article URLs (permanent)

**Cache keys structure:**
```
articles:list:{category}:{limit}:{offset}
articles:detail:{slug}
rss:feed:{feedUrl}
ai:analysis:{contentHash}
analytics:stats:{date}
processed:url:{urlHash}
```

#### D. Update Database Service with Caching

Update `lib/db/index.ts`:
```typescript
import { CacheService } from '@/lib/cache/redis'

static async getArticles(filters) {
  const cacheKey = `articles:list:${JSON.stringify(filters)}`

  // Try cache first
  const cached = await CacheService.get(cacheKey)
  if (cached) return cached

  // Query database
  const articles = await prisma.article.findMany({ /* ... */ })

  // Cache for 15 minutes
  await CacheService.set(cacheKey, articles, 900)

  return articles
}
```

#### E. Cache Invalidation

Create hooks to clear cache when data changes:
```typescript
// When article is created/updated
await CacheService.clearPattern('articles:*')

// When RSS feed is updated
await CacheService.del(`rss:feed:${feedUrl}`)
```

**Files to create:**
- `lib/cache/redis.ts` (NEW)

**Files to modify:**
- `lib/db/index.ts` (ADD caching)
- `lib/services/scraper.ts` (ADD caching)
- `app/api/articles/route.ts` (ADD caching)
- `.env.example` (ADD REDIS_URL)

---

### Task 4.2: Enhanced Story Matching Algorithm
**Time: 1-1.5 hours**

Improve the simple word overlap algorithm with more sophisticated matching:

#### A. Add Named Entity Recognition

Install library:
```bash
npm install compromise
```

#### B. Create Enhanced Matching Service

Update `lib/services/scraper.ts`:

```typescript
import nlp from 'compromise'

interface MatchScore {
  titleSimilarity: number      // 0-40 points
  entityOverlap: number         // 0-30 points
  temporalProximity: number     // 0-20 points
  categoryMatch: number         // 0-10 points
  totalScore: number            // 0-100 points
}

static calculateEnhancedMatch(article1: RawArticle, article2: RawArticle): MatchScore {
  // 1. Title similarity with Levenshtein distance
  const titleScore = this.calculateTitleSimilarity(article1.title, article2.title)

  // 2. Named entity overlap (people, places, organizations)
  const entityScore = this.calculateEntityOverlap(article1, article2)

  // 3. Temporal proximity (published within hours)
  const temporalScore = this.calculateTemporalProximity(
    article1.publishedAt,
    article2.publishedAt
  )

  // 4. Category match
  const categoryScore = article1.category === article2.category ? 10 : 0

  const totalScore = titleScore + entityScore + temporalScore + categoryScore

  return {
    titleSimilarity: titleScore,
    entityOverlap: entityScore,
    temporalProximity: temporalScore,
    categoryMatch: categoryScore,
    totalScore
  }
}

static calculateEntityOverlap(article1: RawArticle, article2: RawArticle): number {
  // Extract named entities
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
  const intersection = new Set([...entities1].filter(e => entities2.has(e)))
  const union = new Set([...entities1, ...entities2])

  const similarity = union.size > 0 ? intersection.size / union.size : 0

  return Math.min(similarity * 30, 30) // Max 30 points
}

static calculateTemporalProximity(date1: Date, date2: Date): number {
  const hoursDiff = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60)

  if (hoursDiff <= 6) return 20      // Within 6 hours: full points
  if (hoursDiff <= 12) return 15     // 6-12 hours: 15 points
  if (hoursDiff <= 24) return 10     // 12-24 hours: 10 points
  if (hoursDiff <= 48) return 5      // 24-48 hours: 5 points
  return 0                            // > 48 hours: 0 points
}

static findMatchingStories(articles: RawArticle[]): Array<{left: RawArticle, right: RawArticle, score: MatchScore}> {
  const leftArticles = articles.filter(a => a.bias === 'LEFT')
  const rightArticles = articles.filter(a => a.bias === 'RIGHT')

  const matches: Array<{left: RawArticle, right: RawArticle, score: MatchScore}> = []

  for (const leftArticle of leftArticles) {
    let bestMatch: {article: RawArticle, score: MatchScore} | null = null

    for (const rightArticle of rightArticles) {
      const score = this.calculateEnhancedMatch(leftArticle, rightArticle)

      if (!bestMatch || score.totalScore > bestMatch.score.totalScore) {
        bestMatch = { article: rightArticle, score }
      }
    }

    // Threshold: 70+ points = same story
    if (bestMatch && bestMatch.score.totalScore >= 70) {
      matches.push({
        left: leftArticle,
        right: bestMatch.article,
        score: bestMatch.score
      })

      // Remove matched article
      const index = rightArticles.indexOf(bestMatch.article)
      rightArticles.splice(index, 1)
    }
  }

  return matches
}
```

**Files to modify:**
- `lib/services/scraper.ts` (MAJOR UPDATE)
- `types/article.ts` (ADD MatchScore interface)

---

### Task 4.3: Structured AI Analysis Output
**Time: 45 minutes**

Enhance AI analysis to return more structured data:

Update `lib/services/ai.ts`:

```typescript
export interface EnhancedAIAnalysis {
  executiveSummary: string           // Neutral 2-3 sentence overview
  leftPerspective: {
    keyPoints: string[]
    framing: string                   // How they frame the story
    tone: string                      // Emotional tone
    emphasis: string[]                // What they emphasize
  }
  rightPerspective: {
    keyPoints: string[]
    framing: string
    tone: string
    emphasis: string[]
  }
  keyDifferences: string[]
  commonGround: string[]              // Facts both agree on
  biasIndicators: {
    languagePatterns: string[]        // Biased language detected
    omissions: string[]               // What each side omits
    emphasisDifferences: string[]     // Different focal points
  }
  possibleMotives: string[]
  confidenceScore: number
  readingTime: number
}
```

Update prompts to return this structure.

---

### Task 4.4: Database Query Optimization
**Time: 30 minutes**

#### A. Add Database Indexes

Update `prisma/schema.prisma`:
```prisma
model Article {
  // ... existing fields

  @@index([category])
  @@index([publishedAt])
  @@index([isPublished])
  @@index([category, publishedAt])
}

model NewsSource {
  // ... existing fields

  @@index([bias])
  @@index([outlet])
  @@index([publishedAt])
}

model Subscriber {
  // ... existing fields

  @@index([isActive])
  @@index([subscribedAt])
}
```

Run migration:
```bash
npx prisma migrate dev --name add_indexes
```

#### B. Optimize Queries

Use Prisma's `select` to fetch only needed fields:
```typescript
// Instead of fetching everything:
const articles = await prisma.article.findMany({
  include: { leftSource: true, rightSource: true }
})

// Fetch only what you need:
const articles = await prisma.article.findMany({
  select: {
    id: true,
    title: true,
    slug: true,
    category: true,
    publishedAt: true,
    leftSource: {
      select: {
        outlet: true,
        headline: true,
        summary: true
      }
    },
    rightSource: {
      select: {
        outlet: true,
        headline: true,
        summary: true
      }
    }
  }
})
```

---

### Task 4.5: Frontend Performance Optimizations
**Time: 30-45 minutes**

#### A. Image Optimization

Update `next.config.js`:
```javascript
module.exports = {
  images: {
    domains: ['localhost', 'yourdomain.com'],
    formats: ['image/avif', 'image/webp'],
  },
}
```

Use Next.js Image component in components.

#### B. Code Splitting & Lazy Loading

Lazy load heavy components:
```typescript
import dynamic from 'next/dynamic'

const AdminDashboard = dynamic(() => import('@/components/admin/dashboard'), {
  loading: () => <p>Loading...</p>,
  ssr: false
})
```

#### C. Bundle Analysis

Add script to `package.json`:
```json
"analyze": "ANALYZE=true next build"
```

Update `next.config.js`:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // ... existing config
})
```

---

## 📁 Files Summary

### New Files (1-2):
1. `lib/cache/redis.ts` - Redis caching service

### Modified Files (8-10):
1. `lib/services/scraper.ts` - Enhanced matching algorithm
2. `lib/services/ai.ts` - Structured AI output
3. `lib/db/index.ts` - Add caching layer
4. `app/api/articles/route.ts` - Add caching
5. `prisma/schema.prisma` - Add indexes
6. `types/article.ts` - New interfaces
7. `next.config.js` - Performance config
8. `.env.example` - Redis URL
9. `package.json` - New dependencies
10. Multiple components - Image optimization

---

## 📊 Success Criteria

After completing Section 4:

✅ **Caching:**
- Redis configured and working
- API responses cached
- Cache invalidation working
- Cache hit rate > 60%

✅ **Matching:**
- More accurate story matching
- Named entity recognition working
- Match confidence scores available
- Fewer false positives

✅ **Performance:**
- API response < 200ms (cached)
- Homepage load < 1.5s
- Database queries optimized
- Bundle size reduced

✅ **AI Analysis:**
- Structured output format
- More detailed breakdowns
- Common ground identified
- Bias indicators highlighted

---

## 🔄 Next Steps

After Section 4:

**Your app is fast!** Performance improvements:
- Cached responses for speed
- Better story matching accuracy
- Optimized database queries
- Faster page loads

**Move to Section 5:** Admin Dashboard Enhancements

---

## ⏱️ Time Breakdown

| Task | Estimated Time |
|------|----------------|
| 4.1 Redis Caching | 1-1.5 hours |
| 4.2 Enhanced Matching | 1-1.5 hours |
| 4.3 Structured AI Output | 45 minutes |
| 4.4 Database Optimization | 30 minutes |
| 4.5 Frontend Optimization | 30-45 minutes |
| **Total** | **3.5-4.5 hours** |

---

**Performance optimizations are optional but highly recommended for scalability!**
