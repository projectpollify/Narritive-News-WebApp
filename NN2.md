# Narrative News 2.0: Implementation Plan
## Institutional Memory & Historical Context System

---

## 🎯 Executive Summary

Transform Narrative News from "side-by-side comparison" to **"side-by-side comparison + institutional memory"** by adding historical context and pattern recognition to every article.

**Core Innovation:** Track what politicians/media promised vs. what actually happened, then surface relevant patterns when analyzing new stories.

**Target Audience:** The 80% in the middle who are tired of being gaslit and want to learn from history.

---

## 📐 Architecture Overview

### **Current Structure (What We Have)**
```
Article {
  id
  title
  category
  publishedAt
  leftSource: NewsSource
  rightSource: NewsSource
  aiAnalysis: string | EnhancedAnalysis
}

EnhancedAnalysis {
  summary: string
  truthCheck?: string
  spinDetection?: string
  realImpact?: string
  commonGround?: string
  biggerPicture?: string
}
```

### **Proposed Structure (What We're Adding)**
```typescript
Article {
  id
  title
  category
  publishedAt
  leftSource: NewsSource
  rightSource: NewsSource
  aiAnalysis: EnhancedAnalysis
  historicalContext?: HistoricalContext  // NEW
}

HistoricalContext {
  topic: string
  relevantPrecedents: Precedent[]
  patterns: Pattern[]
  trackRecords: TrackRecord[]
  whatToWatch: WatchPoint[]
}

Precedent {
  event: string
  date: string
  promises: Claim[]
  outcomes: Outcome[]
  timeframe: string
  sources: string[]
}

Pattern {
  name: string
  description: string
  frequency: "common" | "occasional" | "rare"
  examples: string[]
  reliability: number // 0-100%
}

TrackRecord {
  entity: string // "Republicans on deficits", "Democrats on healthcare"
  claim: string
  prediction: string
  actualOutcome: string
  accuracy: "accurate" | "partial" | "wrong"
  evidence: string[]
}

WatchPoint {
  question: string
  why: string
  howToKnow: string
  timeline: string
}
```

---

## 🏗️ Implementation Phases

### **Phase 1: Database Schema & Infrastructure** (Week 1)

#### 1.1 Update Prisma Schema

```prisma
model Article {
  id                String             @id @default(cuid())
  title             String
  category          String
  publishedAt       DateTime
  leftSourceId      String
  rightSourceId     String
  leftSource        NewsSource         @relation("LeftSource", fields: [leftSourceId], references: [id])
  rightSource       NewsSource         @relation("RightSource", fields: [rightSourceId], references: [id])
  analysis          ArticleAnalysis?
  historicalContext HistoricalContext?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
}

model ArticleAnalysis {
  id             String  @id @default(cuid())
  articleId      String  @unique
  article        Article @relation(fields: [articleId], references: [id])
  summary        String
  truthCheck     String?
  spinDetection  String?
  realImpact     String?
  commonGround   String?
  biggerPicture  String?
}

model HistoricalContext {
  id          String       @id @default(cuid())
  articleId   String       @unique
  article     Article      @relation(fields: [articleId], references: [id])
  topic       String
  summary     String
  precedents  Precedent[]
  patterns    Pattern[]
  trackRecords TrackRecord[]
  watchPoints WatchPoint[]
}

model Precedent {
  id                String            @id @default(cuid())
  contextId         String
  context           HistoricalContext @relation(fields: [contextId], references: [id])
  event             String
  date              DateTime
  promises          Json // Array of claims
  outcomes          Json // Array of outcomes
  timeframe         String
  sources           String[]
  createdAt         DateTime          @default(now())
}

model Pattern {
  id          String            @id @default(cuid())
  contextId   String
  context     HistoricalContext @relation(fields: [contextId], references: [id])
  name        String
  description String
  frequency   String
  examples    String[]
  reliability Int
  createdAt   DateTime          @default(now())
}

model TrackRecord {
  id            String            @id @default(cuid())
  contextId     String
  context       HistoricalContext @relation(fields: [contextId], references: [id])
  entity        String
  claim         String
  prediction    String
  actualOutcome String
  accuracy      String
  evidence      String[]
  createdAt     DateTime          @default(now())
}

model WatchPoint {
  id        String            @id @default(cuid())
  contextId String
  context   HistoricalContext @relation(fields: [contextId], references: [id])
  question  String
  why       String
  howToKnow String
  timeline  String
  createdAt DateTime          @default(now())
}
```

#### 1.2 Create Migration

```bash
npx prisma migrate dev --name add_historical_context
```

---

### **Phase 2: Historical Context Library** (Week 2-3)

#### 2.1 Create Pattern Templates

**File:** `/lib/historical-patterns/index.ts`

```typescript
export const HISTORICAL_PATTERNS = {
  deficitHawks: {
    name: "Deficit Hawks & Doves",
    description: "Political parties claim fiscal responsibility when opposing party spends, ignore when in power",
    frequency: "common",
    examples: [
      "Republicans criticized Obama deficit (2009-2016), then passed $2T tax cut (2017)",
      "Democrats criticized Trump deficits (2017-2020), then passed $1.9T stimulus (2021)"
    ],
    reliability: 95,
    applicableTo: ["budget", "spending", "taxes", "deficit"]
  },

  internationalAgreements: {
    name: "International Agreement Track Record",
    description: "Historical success rate of international treaties and enforcement",
    frequency: "common",
    examples: [
      "Kyoto Protocol: Promised 5% reduction, got 40% increase",
      "Paris Accord: On track for 2.7°C vs 1.5°C target"
    ],
    reliability: 85,
    applicableTo: ["climate", "trade", "international"]
  },

  infrastructureWeek: {
    name: "Infrastructure Promises",
    description: "Both parties promise infrastructure for decades with limited delivery",
    frequency: "occasional",
    examples: [
      "2009: $831B stimulus - $48B for transportation",
      "2017: Trump's $1T plan - never materialized",
      "2021: Biden's plan - $1.2T passed, watch delivery"
    ],
    reliability: 70,
    applicableTo: ["infrastructure", "spending", "transportation"]
  },

  trickleDownEconomics: {
    name: "Supply-Side Tax Cuts",
    description: "Tax cuts rarely pay for themselves through growth",
    frequency: "common",
    examples: [
      "Reagan 1981: Promised revenue neutral, deficit tripled",
      "Bush 2001: Surplus to deficit",
      "Trump 2017: Deficit increased $2T"
    ],
    reliability: 90,
    applicableTo: ["taxes", "economy", "budget"]
  },

  regulationJobKiller: {
    name: "Regulation = Job Killer Claims",
    description: "Job loss predictions from regulations rarely materialize at predicted scale",
    frequency: "common",
    examples: [
      "1990 Clean Air Act: Predicted 200K jobs lost, gained jobs",
      "2010 ACA: Predicted job losses, employment rose",
      "Actual job impact typically 10-20% of predictions"
    ],
    reliability: 80,
    applicableTo: ["regulation", "environment", "healthcare", "jobs"]
  }
}
```

#### 2.2 Create Precedent Database

**File:** `/lib/historical-patterns/precedents.ts`

```typescript
export const CLIMATE_PRECEDENTS = [
  {
    event: "Kyoto Protocol",
    date: "1997-12-11",
    promises: [
      {
        side: "proponents",
        claim: "Reduce global emissions 5% below 1990 levels by 2012",
        source: "UN Framework Convention"
      }
    ],
    outcomes: [
      {
        metric: "Global CO2 emissions",
        predicted: "5% reduction",
        actual: "40% increase (1990-2012)",
        evidence: ["IEA Global Energy Review 2012"]
      },
      {
        metric: "Participation",
        predicted: "Global compliance",
        actual: "US never ratified, Canada withdrew, China/India exempt",
        evidence: ["UN Climate Change documents"]
      }
    ],
    timeframe: "1997-2012",
    sources: [
      "https://unfccc.int/kyoto_protocol",
      "https://www.iea.org/reports"
    ]
  },

  {
    event: "Paris Climate Accord",
    date: "2015-12-12",
    promises: [
      {
        side: "signatories",
        claim: "Limit warming to 1.5°C above pre-industrial levels",
        source: "Paris Agreement Article 2"
      },
      {
        side: "developed nations",
        claim: "$100B/year climate finance to developing nations by 2020",
        source: "Paris Agreement Finance Commitment"
      }
    ],
    outcomes: [
      {
        metric: "Temperature trajectory",
        predicted: "1.5°C limit",
        actual: "Current path: 2.4-2.7°C by 2100",
        evidence: ["Climate Action Tracker 2024"]
      },
      {
        metric: "Climate finance",
        predicted: "$100B/year by 2020",
        actual: "$83B in 2020, $100B reached 2022",
        evidence: ["OECD Climate Finance Report"]
      }
    ],
    timeframe: "2015-present",
    sources: [
      "https://unfccc.int/process-and-meetings/the-paris-agreement",
      "https://climateactiontracker.org/"
    ]
  }
]

export const TAX_CUT_PRECEDENTS = [
  {
    event: "Reagan Tax Cuts (ERTA)",
    date: "1981-08-13",
    promises: [
      {
        side: "supporters",
        claim: "Tax cuts will pay for themselves through economic growth",
        source: "Reagan Administration, OMB"
      },
      {
        side: "supporters",
        claim: "25% across-the-board tax cut will increase revenue",
        source: "Supply-side economic theory"
      }
    ],
    outcomes: [
      {
        metric: "Federal deficit",
        predicted: "Deficit neutral or reduction",
        actual: "Deficit grew from $79B (1981) to $221B (1986)",
        evidence: ["CBO Historical Budget Data"]
      },
      {
        metric: "Federal revenue",
        predicted: "Revenue increase from growth",
        actual: "Revenue as % GDP fell from 19.6% to 17.3%",
        evidence: ["Treasury Department data"]
      }
    ],
    timeframe: "1981-1986",
    sources: [
      "https://www.cbo.gov/about/products/budget-economic-data",
      "https://www.treasury.gov/resource-center/tax-policy"
    ]
  },

  {
    event: "Trump Tax Cuts (TCJA)",
    date: "2017-12-22",
    promises: [
      {
        side: "supporters",
        claim: "Corporate tax cuts will boost investment and wages",
        source: "White House Council of Economic Advisers"
      },
      {
        side: "supporters",
        claim: "Economic growth will offset revenue loss",
        source: "Treasury Secretary Mnuchin"
      }
    ],
    outcomes: [
      {
        metric: "Corporate investment",
        predicted: "$4,000 average wage increase",
        actual: "$400-$800 average increase, stock buybacks surged",
        evidence: ["Economic Policy Institute analysis"]
      },
      {
        metric: "Federal deficit",
        predicted: "Deficit neutral",
        actual: "Added $1.9T to deficit (2018-2027 projection)",
        evidence: ["CBO scoring"]
      },
      {
        metric: "GDP growth",
        predicted: "Sustained 3%+ growth",
        actual: "2.9% (2018), 2.3% (2019), pandemic 2020",
        evidence: ["Bureau of Economic Analysis"]
      }
    ],
    timeframe: "2017-2020",
    sources: [
      "https://www.cbo.gov/publication/53651",
      "https://www.bea.gov/data/gdp"
    ]
  }
]
```

---

### **Phase 3: UI Components** (Week 3-4)

#### 3.1 Historical Context Component

**File:** `/components/features/historical-context.tsx`

```typescript
'use client'

import { useState } from 'react'

interface HistoricalContextProps {
  topic: string
  precedents: Precedent[]
  patterns: Pattern[]
  watchPoints: WatchPoint[]
}

export function HistoricalContext({
  topic,
  precedents,
  patterns,
  watchPoints
}: HistoricalContextProps) {
  const [expandedPrecedent, setExpandedPrecedent] = useState<string | null>(null)

  return (
    <section className="bg-purple-50 border-l-4 border-purple-500 rounded-xl p-6 md:p-8 mb-8">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-purple-900">Historical Context</h2>
      </div>

      {/* Patterns */}
      {patterns.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Patterns We've Seen Before
          </h3>
          {patterns.map((pattern, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 mb-3 border border-purple-200">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-purple-900">{pattern.name}</h4>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {pattern.reliability}% reliable
                </span>
              </div>
              <p className="text-purple-800 text-sm mb-2">{pattern.description}</p>
              <div className="text-xs text-purple-600">
                <strong>Examples:</strong> {pattern.examples.join(" • ")}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Precedents */}
      {precedents.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Last Time This Happened
          </h3>
          {precedents.map((precedent, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 mb-3 border border-purple-200">
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpandedPrecedent(expandedPrecedent === precedent.event ? null : precedent.event)}
              >
                <div>
                  <h4 className="font-semibold text-purple-900">{precedent.event}</h4>
                  <p className="text-sm text-purple-600">{new Date(precedent.date).getFullYear()} • {precedent.timeframe}</p>
                </div>
                <svg
                  className={`w-5 h-5 text-purple-600 transition-transform ${expandedPrecedent === precedent.event ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {expandedPrecedent === precedent.event && (
                <div className="mt-4 space-y-3">
                  <div>
                    <h5 className="text-sm font-semibold text-purple-800 mb-1">What Was Promised:</h5>
                    {precedent.promises.map((promise, pIdx) => (
                      <p key={pIdx} className="text-sm text-purple-700 ml-3">• {promise.claim}</p>
                    ))}
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-purple-800 mb-1">What Actually Happened:</h5>
                    {precedent.outcomes.map((outcome, oIdx) => (
                      <div key={oIdx} className="text-sm text-purple-700 ml-3 mb-2">
                        <strong>{outcome.metric}:</strong>
                        <div className="ml-3 text-xs">
                          <div>Predicted: {outcome.predicted}</div>
                          <div>Actual: {outcome.actual}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* What to Watch For */}
      {watchPoints.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            What to Watch For
          </h3>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-700 mb-3">
              Based on historical patterns, here's how to tell who was right:
            </p>
            {watchPoints.map((point, idx) => (
              <div key={idx} className="mb-3 last:mb-0">
                <p className="text-purple-900 font-semibold text-sm mb-1">
                  {idx + 1}. {point.question}
                </p>
                <p className="text-purple-700 text-xs ml-4 mb-1">
                  <strong>Why it matters:</strong> {point.why}
                </p>
                <p className="text-purple-600 text-xs ml-4 mb-1">
                  <strong>How to know:</strong> {point.howToKnow}
                </p>
                <p className="text-purple-500 text-xs ml-4">
                  <strong>Timeline:</strong> {point.timeline}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
```

#### 3.2 Update Article Detail Page

**File:** `/app/article/[id]/page.tsx`

Add after Truth & Impact section:

```typescript
{/* Historical Context Section */}
{article.historicalContext && (
  <HistoricalContext
    topic={article.historicalContext.topic}
    precedents={article.historicalContext.precedents}
    patterns={article.historicalContext.patterns}
    watchPoints={article.historicalContext.watchPoints}
  />
)}
```

---

### **Phase 4: Content Creation Workflow** (Week 4-5)

#### 4.1 AI Prompt Engineering

**File:** `/lib/services/ai-prompts.ts`

```typescript
export const HISTORICAL_CONTEXT_PROMPT = `
You are a historical analyst for Narrative News, serving the 80% in the middle who want facts over spin.

Given a news story about: {topic}

Task: Research and provide historical context following this structure:

1. IDENTIFY RELEVANT PRECEDENTS
   - Find 2-3 similar events/policies from history
   - Focus on the last 20 years for relevance
   - Include: What was promised, what actually happened, timeframe

2. RECOGNIZE PATTERNS
   - What patterns does this follow?
   - How reliable is this pattern historically?
   - Examples that prove the pattern

3. TRACK RECORDS
   - Who made predictions about similar situations?
   - Were they right or wrong?
   - Evidence and sources

4. WHAT TO WATCH FOR
   - Based on patterns, what should we monitor?
   - How will we know who was right (in 6-12 months)?
   - What are the key indicators?

GUIDELINES:
- Use only verifiable historical facts with sources
- No speculation, only documented outcomes
- Include both successful and failed predictions from all sides
- Focus on outcomes, not intentions
- Be specific with numbers and timeframes
- Cite sources

OUTPUT FORMAT: JSON matching the HistoricalContext interface
`;
```

#### 4.2 Manual Curation Process

**File:** `/docs/CURATION_PROCESS.md`

```markdown
# Historical Context Curation Process

## For Each New Article:

### Step 1: Identify Topic Category
- Climate/Environment
- Economy/Taxes
- Healthcare
- Foreign Policy
- Regulation
- etc.

### Step 2: Search Pattern Library
Check `/lib/historical-patterns/` for relevant patterns:
- Do any existing patterns apply?
- What's the reliability score?
- Are the examples still relevant?

### Step 3: Find Precedents
Research similar situations:
- Last 5-20 years for relevance
- Focus on verifiable outcomes
- Document sources

### Step 4: Create Watch Points
Define success criteria:
- What would prove each side right?
- What metrics can we track?
- When should we check back?

### Step 5: Review & Edit
- Fact-check all claims
- Verify all sources
- Remove speculation
- Ensure balance (call out both sides equally)

### Step 6: Add to Database
Use admin interface or direct Prisma:
```typescript
await prisma.historicalContext.create({
  data: {
    articleId: "...",
    topic: "...",
    precedents: { create: [...] },
    patterns: { create: [...] },
    watchPoints: { create: [...] }
  }
})
```
```

---

### **Phase 5: Admin Interface** (Week 5-6)

#### 5.1 Pattern Management UI

**File:** `/app/admin/patterns/page.tsx`

```typescript
// Admin page to:
// - View all patterns
// - Add new patterns
// - Edit reliability scores
// - Mark patterns as outdated
// - See which articles use each pattern
```

#### 5.2 Precedent Database UI

**File:** `/app/admin/precedents/page.tsx`

```typescript
// Admin page to:
// - Browse all precedents
// - Add new precedents
// - Update outcomes as they evolve
// - Link precedents to articles
// - Track source citations
```

#### 5.3 Article Historical Context Editor

**File:** `/app/admin/articles/[id]/historical-context/page.tsx`

```typescript
// Form to add/edit historical context for an article:
// - Select relevant patterns from library
// - Add custom precedents
// - Define watch points
// - Preview how it renders
// - Save/publish
```

---

## 📊 Sample Article Implementation

### **Article 2: Climate Summit Enhanced**

```typescript
{
  id: '2',
  title: 'Climate Summit Reaches Historic Agreement',
  aiAnalysis: {
    summary: "Coverage shows stark differences in emphasis...",
    truthCheck: "195 countries signed the agreement. Developed nations committed $300B annually. Target is to triple renewable energy by 2030.",
    spinDetection: "Left emphasizes 'historic breakthrough' while right emphasizes 'costly mandates.' Both cherry-pick which aspects to highlight.",
    realImpact: "For your family: Energy costs may rise short-term if policies enacted. For business: Renewable sector jobs may increase, fossil fuel sector faces pressure. For freedom: Depends on enforcement mechanisms—watch for mandates vs. incentives.",
    commonGround: "Both sides agree climate is changing. Disagreement is over speed, cost, and method of response.",
    biggerPicture: "This is the third major international climate agreement in 30 years. Track record matters—see Historical Context below."
  },
  historicalContext: {
    topic: "International Climate Agreements",
    summary: "This is the third major climate summit with binding commitments since 1997. Historical pattern shows gap between promises and delivery.",

    precedents: [
      {
        event: "Kyoto Protocol",
        date: "1997-12-11",
        promises: [
          { claim: "Reduce emissions 5% below 1990 levels by 2012" }
        ],
        outcomes: [
          {
            metric: "Global emissions",
            predicted: "5% reduction",
            actual: "40% increase",
            evidence: ["IEA Global Energy Review 2012"]
          }
        ],
        timeframe: "1997-2012",
        sources: ["https://unfccc.int/kyoto_protocol"]
      },
      {
        event: "Paris Climate Accord",
        date: "2015-12-12",
        promises: [
          { claim: "Limit warming to 1.5°C" },
          { claim: "$100B/year climate finance by 2020" }
        ],
        outcomes: [
          {
            metric: "Temperature trajectory",
            predicted: "1.5°C",
            actual: "Currently on path for 2.4-2.7°C",
            evidence: ["Climate Action Tracker 2024"]
          },
          {
            metric: "Finance commitment",
            predicted: "$100B by 2020",
            actual: "Reached $100B in 2022 (2 years late)",
            evidence: ["OECD Climate Finance Report"]
          }
        ],
        timeframe: "2015-present",
        sources: ["https://climateactiontracker.org/"]
      }
    ],

    patterns: [
      {
        name: "International Agreement Enforcement Gap",
        description: "International climate agreements historically face enforcement challenges leading to lower-than-promised outcomes",
        frequency: "common",
        reliability: 85,
        examples: [
          "Kyoto: No binding enforcement, major emitters opted out",
          "Paris: Voluntary targets, no penalties for non-compliance",
          "Montreal Protocol (1987): Exception—worked because of binding enforcement"
        ]
      }
    ],

    watchPoints: [
      {
        question: "Are enforcement mechanisms binding or voluntary?",
        why: "Historical pattern shows voluntary agreements underdeliver by 30-50%",
        howToKnow: "Watch for penalties/sanctions language in agreement text",
        timeline: "Agreement details released within 30 days"
      },
      {
        question: "Do China and India have binding commitments?",
        why: "Top 2 emitters (38% of global total). Their participation determines success.",
        howToKnow: "Check NDC (Nationally Determined Contributions) submissions",
        timeline: "6 months post-agreement"
      },
      {
        question: "Is the $300B/year actually funded and delivered?",
        why: "Previous $100B commitment took 7 years to fulfill",
        howToKnow: "OECD tracks and reports climate finance annually",
        timeline: "Check OECD reports 2025-2027"
      }
    ]
  }
}
```

---

## 🎯 Success Metrics

### **User Engagement**
- Time on article page (expect +30-50% with historical context)
- Scroll depth (track if users reach historical section)
- Return visits (users coming back to check "What to Watch For")

### **Content Quality**
- Number of precedents per article (target: 2-3)
- Source citation completeness (target: 100%)
- Historical accuracy (fact-check quarterly)

### **Competitive Differentiation**
- Unique feature (no competitor has systematic institutional memory)
- SEO value ("What happened after Kyoto Protocol" searches)
- Share-ability (historical sections are highly shareable)

---

## ⚠️ Risk Mitigation

### **Accuracy Risk**
- **Problem:** Historical facts must be 100% accurate or we lose credibility
- **Mitigation:**
  - All precedents require 2+ sources
  - Quarterly fact-check review
  - User-submitted corrections process
  - "Last verified: [date]" on each precedent

### **Bias Risk**
- **Problem:** Selection of which precedents to include could show bias
- **Mitigation:**
  - Include both successful and failed predictions from all sides
  - Pattern library reviewed by political diversity team
  - Transparent methodology page

### **Scope Creep Risk**
- **Problem:** Could become overwhelming to research every article
- **Mitigation:**
  - Start with major stories only
  - Build library over time—reuse patterns
  - AI-assisted first draft, human review/edit
  - Not every article needs historical context

### **Maintenance Risk**
- **Problem:** Outcomes change over time, need updates
- **Mitigation:**
  - "Check back on [date]" reminders
  - Community flagging system
  - Annual review of evergreen precedents

---

## 📅 Timeline Summary

| Week | Phase | Deliverables |
|------|-------|--------------|
| 1 | Infrastructure | Database schema, migrations, interfaces |
| 2 | Pattern Library | 10-15 core patterns documented |
| 3 | Precedents DB | 20-30 key precedents researched |
| 4 | UI Components | Historical context component built |
| 5 | Admin Tools | Pattern and precedent management |
| 6 | Testing | Article 2 & 3 enhanced, QA testing |

---

## 💰 Resource Requirements

### **Development**
- Backend: 20-30 hours (schema, APIs)
- Frontend: 20-30 hours (components, admin)
- Testing: 10 hours
- **Total Dev:** ~60 hours

### **Content Creation** (Ongoing)
- Pattern research: 2-3 hours per pattern
- Precedent research: 1-2 hours per precedent
- Per article: 1-3 hours (depends on complexity)

### **Quality Assurance**
- Fact-checking: 30 min per precedent
- Legal review: 5 hours (initial)
- Quarterly audit: 10 hours

---

## 🚀 Go-Live Strategy

### **Phase 1: Soft Launch** (Week 6)
- Add historical context to Article 2 only
- Get feedback from team
- Refine UX based on engagement

### **Phase 2: Limited Release** (Week 7-8)
- Add to 3-5 major stories
- Monitor user behavior
- A/B test with/without historical context

### **Phase 3: Full Launch** (Week 9+)
- Add to all major news stories
- Announce feature in newsletter
- Marketing push: "The news site with institutional memory"

---

## 📈 Long-Term Vision

### **6 Months**
- 100+ precedents documented
- 30+ patterns catalogued
- Historical context on all major stories

### **1 Year**
- "Promise Tracker" feature (track politician claims vs outcomes)
- Community contributions to pattern library
- Historical context API for third parties

### **2 Years**
- Predictive analysis based on patterns
- "Who Was Right?" follow-up series
- Historical database becomes standalone product

---

## ❓ Open Questions for Review

1. **Scope:** Start with climate + economy only, or all categories?
2. **Depth:** How many precedents per article? (I recommend 2-3 max)
3. **Automation:** How much AI vs. manual curation? (I recommend AI draft, human verify)
4. **Community:** Allow user-submitted precedents? (Not in v1, maybe v2)
5. **Monetization:** Could historical database be a paid product later?

---

## ✅ Decision Points

Before proceeding, need decisions on:

- [ ] Approve database schema
- [ ] Confirm pattern library structure
- [ ] Define content curation workflow
- [ ] Set quality standards (sources required, etc.)
- [ ] Determine launch timeline
- [ ] Allocate resources (dev time, research time)

---

**Next Step:** Review this plan, provide feedback, then I'll implement Phase 1 (database schema + infrastructure).
