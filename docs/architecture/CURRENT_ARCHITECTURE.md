# Narrative News - Current System Architecture

**Last Updated:** October 13, 2025
**Status:** Production-Ready (with minor gaps)
**Tech Stack:** Next.js 14, TypeScript, PostgreSQL, Prisma, OpenAI GPT-4

---

## 🏗️ System Overview

Narrative News is a full-stack web application built with modern technologies, designed to scrape, analyze, and present news articles from multiple perspectives. The system follows a service-oriented architecture with clear separation of concerns.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Client Layer (Browser)                       │
│                     Next.js 14 App Router                       │
│                  React 18 + TypeScript + Tailwind               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Layer                                 │
│                   (/app/api/*)                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Articles │  │    AI    │  │Newsletter│  │   Admin  │      │
│  │   CRUD   │  │ Analysis │  │  System  │  │  Routes  │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
└───────┼─────────────┼─────────────┼─────────────┼──────────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Service Layer                               │
│                    (/lib/services/*)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Scraper  │  │    AI    │  │  Email   │  │   Cron   │      │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
└───────┼─────────────┼─────────────┼─────────────┼──────────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Data & Integration Layer                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Database │  │  OpenAI  │  │   SMTP   │  │   RSS    │      │
│  │(Prisma + │  │  GPT-4   │  │  Server  │  │  Feeds   │      │
│  │Postgres) │  │   API    │  │(Nodemailer)│ │(10+ src) │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.3
- **UI Library:** React 18
- **Styling:** Tailwind CSS 3.4
- **Components:** Headless UI, Heroicons
- **State Management:** React Context + Server Components
- **Forms:** React Hook Form (planned)

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Next.js API Routes
- **Language:** TypeScript
- **Authentication:** NextAuth.js 4.24 (configured, not enabled)
- **Validation:** Zod 3.22

### Database
- **Database:** PostgreSQL (production) / SQLite (dev)
- **ORM:** Prisma 5.7
- **Migrations:** Prisma Migrate
- **Seeding:** Custom seed scripts

### External Services
- **AI Analysis:** OpenAI GPT-4
- **RSS Parsing:** rss-parser 3.13
- **Web Scraping:** Cheerio 1.0
- **Email:** Nodemailer 6.9
- **Scheduling:** node-cron 3.1

### DevOps & Testing
- **Testing:** Jest 29.7
- **Test Coverage:** 87-94% (service layer)
- **CI/CD:** GitHub Actions
- **Linting:** ESLint 8.56
- **Formatting:** Prettier 3.1
- **Bundler:** Next.js (Turbopack ready)
- **Deployment:** Vercel (recommended)

---

## 📂 Project Structure

```
NNwebapp/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API Routes
│   │   ├── articles/            # Article CRUD
│   │   │   ├── route.ts         # GET /api/articles, POST /api/articles
│   │   │   └── [id]/            # GET/PUT/DELETE /api/articles/:id
│   │   ├── ai/                  # AI Analysis
│   │   │   ├── analyze/         # POST /api/ai/analyze
│   │   │   └── compare/         # POST /api/ai/compare
│   │   ├── automation/          # Automation Triggers
│   │   │   ├── scrape/          # POST /api/automation/scrape
│   │   │   ├── match/           # POST /api/automation/match
│   │   │   └── analyze/         # POST /api/automation/analyze
│   │   ├── newsletter/          # Newsletter Management
│   │   │   ├── subscribe/       # POST /api/newsletter/subscribe
│   │   │   ├── unsubscribe/     # POST /api/newsletter/unsubscribe
│   │   │   └── send/            # POST /api/newsletter/send
│   │   ├── admin/               # Admin Operations
│   │   │   ├── stats/           # GET /api/admin/stats
│   │   │   └── subscribers/     # GET /api/admin/subscribers
│   │   └── health/              # GET /api/health (health check)
│   ├── admin/                   # Admin Dashboard Pages
│   │   ├── articles/            # Article management
│   │   ├── subscribers/         # Subscriber management
│   │   ├── analytics/           # Analytics dashboard
│   │   └── settings/            # System settings
│   ├── article/                 # Article detail pages
│   │   └── [slug]/              # Dynamic article pages
│   ├── layout.tsx               # Root layout with navigation
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Global styles
│
├── lib/                         # Core Business Logic
│   ├── services/                # Service Layer
│   │   ├── ai.ts                # OpenAI GPT-4 integration
│   │   ├── ai.test.ts           # AI service tests (18 tests)
│   │   ├── scraper.ts           # RSS scraping & story matching
│   │   ├── scraper.test.ts      # Scraper tests (38 tests)
│   │   ├── email.ts             # Newsletter/email service
│   │   └── cron.ts              # Automation scheduling
│   ├── db/                      # Database Layer
│   │   ├── index.ts             # Prisma client wrapper
│   │   └── index.test.ts        # Database tests (27 tests)
│   └── utils/                   # Utility Functions
│       ├── middleware.ts        # Express middleware
│       ├── rate-limit.ts        # Rate limiting
│       └── validation.ts        # Input validation
│
├── components/                  # React Components
│   ├── features/                # Feature Components
│   │   ├── ArticleCard.tsx      # Article preview card
│   │   ├── BiasIndicator.tsx    # Bias visualization
│   │   ├── NewsletterSignup.tsx # Newsletter form
│   │   └── SourceComparison.tsx # Side-by-side comparison
│   └── ui/                      # UI Primitives
│       ├── Button.tsx           # Button component
│       ├── Input.tsx            # Input component
│       └── Card.tsx             # Card component
│
├── prisma/                      # Database
│   ├── schema.prisma            # Database schema (PostgreSQL)
│   ├── seed.ts                  # Database seeding script
│   └── migrations/              # Database migrations
│
├── docs/                        # Documentation
│   ├── architecture/            # Technical architecture
│   ├── business/                # Business plan & metrics
│   └── development/             # Roadmap & gap analysis
│
├── types/                       # TypeScript Definitions
│   └── index.ts                 # Global types
│
├── public/                      # Static Assets
│   ├── images/                  # Images
│   └── docs/                    # Documentation assets
│
└── scripts/                     # Utility Scripts
    ├── health-check.js          # System health check
    └── backup-db.js             # Database backup
```

---

## 🔧 Core Services

### 1. Scraper Service (`lib/services/scraper.ts`)

**Purpose:** Fetches articles from RSS feeds and matches stories across outlets

**Key Functions:**
- `scrapeRSSFeeds()` - Scrapes all active RSS feeds
- `extractArticleContent(url)` - Extracts full content from article URL
- `matchStories(leftArticles, rightArticles)` - Pairs left/right coverage
- `calculateSimilarity(text1, text2)` - Computes text similarity (0-100)

**RSS Feed Sources (10+ outlets):**

Left-leaning:
- New York Times
- The Guardian
- CNN
- MSNBC
- HuffPost

Right-leaning:
- Fox News
- Breitbart
- Daily Caller
- The Federalist
- Washington Examiner

**Story Matching Algorithm:**
1. Extract title and content keywords
2. Calculate word overlap (Jaccard similarity)
3. Threshold: 60% similarity = same story
4. Pair highest-scoring left/right articles
5. Store matched pairs in database

**Test Coverage:** 38 tests, 45% statement coverage

---

### 2. AI Analysis Service (`lib/services/ai.ts`)

**Purpose:** Uses OpenAI GPT-4 to analyze bias and framing differences

**Key Functions:**
- `analyzeArticleBias(article)` - Analyzes bias in single article
- `compareArticles(leftArticle, rightArticle)` - Compares two articles
- `generateAnalysisSummary(analysis)` - Creates human-readable summary

**Configuration:**
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = 'gpt-4-turbo-preview';
```

**Analysis Output Structure:**
```typescript
interface BiasAnalysis {
  overallBias: 'left' | 'center' | 'right';
  biasScore: number; // -100 (left) to +100 (right)
  framingDifferences: string[];
  languageAnalysis: {
    emotionalTone: string;
    selectedQuotes: string[];
    omissions: string[];
  };
  summary: string;
}
```

**Test Coverage:** 18 tests, 94% statement coverage

---

### 3. Email/Newsletter Service (`lib/services/email.ts`)

**Purpose:** Sends newsletters and transactional emails

**Key Functions:**
- `sendNewsletter(subscribers, articles)` - Sends newsletter to all subscribers
- `sendWelcomeEmail(subscriber)` - Sends welcome email
- `sendArticleDigest(subscriber, articles)` - Sends weekly digest

**Configuration:**
```typescript
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});
```

**Status:** Configured but requires SMTP credentials

---

### 4. Cron/Automation Service (`lib/services/cron.ts`)

**Purpose:** Schedules automated tasks

**Key Functions:**
- `scheduleRSSScraping()` - Scrape RSS feeds every 6 hours
- `scheduleNewsletterSending()` - Send newsletter weekly
- `scheduleDatabaseCleanup()` - Clean old analytics data

**Cron Schedule:**
```typescript
// Scrape RSS feeds every 6 hours
cron.schedule('0 */6 * * *', async () => {
  await scrapeRSSFeeds();
});

// Send newsletter every Sunday at 8 AM
cron.schedule('0 8 * * 0', async () => {
  await sendWeeklyNewsletter();
});
```

**Status:** Service exists but not enabled by default (requires `ENABLE_AUTOMATION=true`)

---

### 5. Database Service (`lib/db/index.ts`)

**Purpose:** Prisma client wrapper with utility functions

**Key Functions:**
- `getArticles(filters)` - Fetch articles with filters
- `createArticle(data)` - Create new article
- `getArticleBySlug(slug)` - Fetch single article
- `updateArticle(id, data)` - Update article
- `deleteArticle(id)` - Delete article
- `getSubscribers()` - Fetch subscribers
- `trackAnalytics(event)` - Track analytics event

**Test Coverage:** 27 tests, 87% statement coverage

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐
│     User        │         │    Article      │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ email           │         │ title           │
│ name            │         │ slug            │
│ password        │         │ aiAnalysis      │
│ role            │         │ category        │
│ isActive        │         │ tags            │
│ createdAt       │         │ publishedAt     │
│ lastLoginAt     │         │ viewCount       │
└─────────────────┘         │ isPublished     │
                            │ leftSourceId    │─┐
                            │ rightSourceId   │─┼─┐
                            └─────────────────┘ │ │
                                                │ │
                            ┌───────────────────┘ │
                            ▼                     │
                    ┌─────────────────┐           │
                    │   NewsSource    │◄──────────┘
                    ├─────────────────┤
                    │ id (PK)         │
                    │ outlet          │
                    │ headline        │
                    │ summary         │
                    │ fullContent     │
                    │ url             │
                    │ author          │
                    │ publishedAt     │
                    │ bias            │ (LEFT/CENTER/RIGHT)
                    │ sourceType      │ (RSS/API/MANUAL)
                    └─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│   Subscriber    │         │    RSSFeed      │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ email           │         │ name            │
│ name            │         │ url             │
│ isActive        │         │ outlet          │
│ subscribedAt    │         │ bias            │
└─────────────────┘         │ isActive        │
                            └─────────────────┘
┌─────────────────┐
│    Analytics    │
├─────────────────┤
│ id (PK)         │
│ event           │
│ category        │
│ label           │
│ value           │
│ metadata        │
│ createdAt       │
└─────────────────┘
```

### Key Models

#### User
Authentication and authorization

**Fields:**
- `id` - Unique identifier (CUID)
- `email` - Email address (unique)
- `name` - User name (optional)
- `password` - Hashed password (bcrypt)
- `role` - ADMIN, EDITOR, or USER
- `isActive` - Account status
- `createdAt` - Registration date
- `lastLoginAt` - Last login timestamp

**Status:** Model exists, not yet used (auth not enabled)

#### Article
Primary content model

**Fields:**
- `id` - Unique identifier
- `title` - Article title
- `slug` - URL-friendly slug
- `aiAnalysis` - GPT-4 analysis (text)
- `category` - News category (politics, economy, etc.)
- `tags` - JSON array of tags
- `publishedAt` - Publication date
- `viewCount` - Number of views
- `isPublished` - Publication status
- `leftSourceId` - FK to left NewsSource
- `rightSourceId` - FK to right NewsSource

#### NewsSource
Raw article from news outlet

**Fields:**
- `id` - Unique identifier
- `outlet` - News outlet name
- `headline` - Original headline
- `summary` - Article summary
- `fullContent` - Full article text
- `url` - Original URL (unique)
- `author` - Article author
- `publishedAt` - Publication date
- `bias` - LEFT, CENTER, or RIGHT
- `sourceType` - RSS, API, or MANUAL

#### Subscriber
Newsletter subscribers

**Fields:**
- `id` - Unique identifier
- `email` - Email address (unique)
- `name` - Subscriber name (optional)
- `isActive` - Subscription status
- `subscribedAt` - Subscription date

#### RSSFeed
RSS feed sources

**Fields:**
- `id` - Unique identifier
- `name` - Feed name
- `url` - RSS feed URL (unique)
- `outlet` - News outlet name
- `bias` - LEFT, CENTER, or RIGHT
- `isActive` - Whether to scrape

#### Analytics
Event tracking

**Fields:**
- `id` - Unique identifier
- `event` - Event name
- `category` - Event category
- `label` - Event label
- `value` - Event value
- `metadata` - JSON metadata
- `createdAt` - Event timestamp

---

## 🔌 API Endpoints

### Public Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | System health check | No |
| GET | `/api/articles` | List published articles | No |
| GET | `/api/articles/:id` | Get single article | No |
| POST | `/api/articles/:id/view` | Increment view count | No |
| POST | `/api/newsletter/subscribe` | Subscribe to newsletter | No |
| POST | `/api/newsletter/unsubscribe` | Unsubscribe | No |

### Admin Endpoints (⚠️ Not Yet Secured)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/articles` | Create article | Admin |
| PUT | `/api/articles/:id` | Update article | Admin |
| DELETE | `/api/articles/:id` | Delete article | Admin |
| POST | `/api/ai/analyze` | Analyze article | Admin |
| POST | `/api/ai/compare` | Compare articles | Admin |
| POST | `/api/automation/scrape` | Trigger scraping | Admin |
| POST | `/api/automation/match` | Match stories | Admin |
| POST | `/api/automation/analyze` | Analyze matches | Admin |
| POST | `/api/newsletter/send` | Send newsletter | Admin |
| GET | `/api/admin/stats` | Get statistics | Admin |
| GET | `/api/admin/subscribers` | List subscribers | Admin |

---

## 🔒 Security Considerations

### Current Security Measures
- ✅ Environment variables for secrets
- ✅ HTTPS in production
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma)
- ✅ Rate limiting service exists (`lib/utils/rate-limit.ts`)

### Security Gaps (To Be Fixed in Section 2)
- ❌ No authentication on admin routes
- ❌ No CORS configuration
- ❌ No security headers
- ❌ No API key validation
- ❌ No request size limits

---

## 🚀 Deployment Architecture

### Recommended: Vercel

```
┌─────────────────────────────────────────────┐
│              Vercel Edge Network            │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │     Next.js 14 App (Serverless)      │  │
│  │  ┌────────────┐  ┌────────────┐     │  │
│  │  │  API Routes│  │   Pages    │     │  │
│  │  └─────┬──────┘  └────────────┘     │  │
│  └────────┼──────────────────────────────┘  │
└───────────┼──────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────┐
│         External Services                   │
│  ┌─────────────┐  ┌─────────────┐          │
│  │ PostgreSQL  │  │   OpenAI    │          │
│  │  (Vercel)   │  │   GPT-4     │          │
│  └─────────────┘  └─────────────┘          │
│                                             │
│  ┌─────────────┐  ┌─────────────┐          │
│  │Vercel Cron  │  │SMTP Provider│          │
│  │(Automation) │  │(Nodemailer) │          │
│  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────┘
```

### Environment Variables (Production)

```bash
# Database
DATABASE_URL="postgresql://..."              # Vercel Postgres

# OpenAI
OPENAI_API_KEY="sk-..."                     # OpenAI API key

# Authentication (Section 2)
NEXTAUTH_URL="https://narrativenews.org"
NEXTAUTH_SECRET="..."                        # Generate with openssl

# Email (Optional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="..."
EMAIL_SERVER_PASSWORD="..."
EMAIL_FROM="noreply@narrativenews.org"

# Site Config
SITE_URL="https://narrativenews.org"
ENABLE_AUTOMATION="true"

# Production
NODE_ENV="production"
```

---

## 📊 Performance Metrics

### Current Performance (Estimated)
- API response time: 500-1000ms
- Homepage load: 2-3 seconds
- AI analysis: 5-10 seconds per pair
- RSS scraping: 2-5 minutes per cycle

### Target Performance (After Section 4)
- API response time: < 200ms (cached)
- Homepage load: < 1 second
- AI analysis: < 5 seconds
- RSS scraping: < 3 minutes

---

## 🧪 Testing Infrastructure

### Test Coverage
- **Total Tests:** 83 passing
- **Service Layer:** 87-94% coverage
- **Database Layer:** 87% coverage
- **AI Service:** 94% coverage
- **Scraper Service:** 45% coverage

### Testing Stack
- **Framework:** Jest 29.7
- **React Testing:** Testing Library
- **Mocking:** Jest mocks
- **CI/CD:** GitHub Actions

---

## 🔄 Data Flow

### Content Generation Workflow

```
1. Cron Trigger (every 6 hours)
   │
   ▼
2. Scraper Service
   ├─ Fetch RSS feeds (10+ sources)
   ├─ Parse feed items
   └─ Extract article content
   │
   ▼
3. Story Matching
   ├─ Group articles by bias (LEFT/RIGHT)
   ├─ Calculate similarity scores
   └─ Pair matching stories (60%+ similarity)
   │
   ▼
4. AI Analysis (GPT-4)
   ├─ Compare left vs right framing
   ├─ Identify bias indicators
   └─ Generate analysis summary
   │
   ▼
5. Database Storage
   ├─ Create Article record
   ├─ Link to NewsSource records
   └─ Store AI analysis
   │
   ▼
6. Publication
   └─ Mark article as published
```

---

## 📚 Related Documentation

- [ROADMAP.md](/docs/ROADMAP.md) - Development roadmap
- [BUSINESS_PLAN.md](/docs/business/BUSINESS_PLAN.md) - Business model
- [GAP_ANALYSIS.md](/docs/development/GAP_ANALYSIS.md) - Production gaps
- [PROJECT.md](/PROJECT.md) - Development guide
- [README.md](/README.md) - Project overview

---

**This architecture documentation reflects the actual implemented system as of October 13, 2025.**
