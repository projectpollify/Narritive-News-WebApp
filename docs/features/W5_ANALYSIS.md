# W5 Analysis Feature

**Last Updated:** October 15, 2025
**Status:** ✅ Complete and Ready for Testing
**Version:** 1.0.0

---

## Overview

The **W5 Analysis Feature** provides users with optional deep-dive analysis of each key section in our AI-powered news comparisons. By applying the classic journalism framework of **Who, What, When, Where, Why** to five key analysis areas, we help users understand media framing at a much deeper level.

### Key Benefits

1. **Progressive Disclosure** - Doesn't overwhelm users, allows optional deep dives
2. **Educational Value** - Teaches critical thinking by modeling W5 analysis
3. **User Control** - Users toggle detail depth on/off per their preference
4. **SEO & Content Depth** - More detailed content per article (5 sections × 5 W5 points = 25 additional insights)
5. **Differentiation** - Most news aggregators don't offer this analysis level

---

## Five Analysis Sections

Each article comparison now includes these five sections, each with an optional W5 breakdown:

### 1. ✓ What's True
**Summary:** Facts both sides agree on
**W5 Deep-Dive:**
- **Who:** Who is involved/affected?
- **What:** What exactly happened?
- **When:** When and what timeline?
- **Where:** Where and what context?
- **Why:** Why does this matter?

### 2. ⚠ What's Spin
**Summary:** How each side frames/spins the story
**W5 Deep-Dive:**
- **Who:** Who benefits from each narrative?
- **What:** What specific framing techniques are used?
- **When:** When do these framing patterns typically emerge?
- **Where:** Where do we see these editorial choices most clearly?
- **Why:** Why might each outlet choose this framing?

### 3. 👥 Real Impact
**Summary:** Real-world consequences for families, businesses, communities
**W5 Deep-Dive:**
- **Who:** Who will be directly affected?
- **What:** What specific impacts will occur?
- **When:** When will these impacts be felt?
- **Where:** Where will impacts be most significant?
- **Why:** Why do these impacts matter long-term?

### 4. 🤝 Common Ground
**Summary:** What both sides actually want despite different framing
**W5 Deep-Dive:**
- **Who:** Who shares these concerns?
- **What:** What common goals exist?
- **When:** When do both sides align?
- **Where:** Where is there potential for agreement?
- **Why:** Why does common ground matter?

### 5. 💡 The Bigger Picture
**Summary:** Broader context explaining competing perspectives
**W5 Deep-Dive:**
- **Who:** Who has historical/political stakes?
- **What:** What larger patterns does this represent?
- **When:** When did these competing narratives emerge?
- **Where:** Where does this fit in broader debates?
- **Why:** Why do these worldviews differ so much?

---

## Technical Implementation

### Architecture

```
┌─────────────────────────────────────────────┐
│          User Interface Layer               │
│   (EnhancedAnalysisDisplay Component)       │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Executive Summary                   │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Section: What's True                │  │
│  │  - Summary (always visible)          │  │
│  │  - [Expand W5 Analysis] Button       │  │
│  │                                      │  │
│  │  [Expanded State]                    │  │
│  │  👥 Who: ...                         │  │
│  │  📋 What: ...                        │  │
│  │  📅 When: ...                        │  │
│  │  📍 Where: ...                       │  │
│  │  🎯 Why: ...                         │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  [4 more sections identical structure...]  │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│          AI Service Layer                   │
│   (lib/services/ai.ts)                      │
│                                             │
│  analyzeArticlesEnhanced()                  │
│  - Takes: leftArticle, rightArticle         │
│  - Optional: includeW5 (default: true)      │
│  - Returns: EnhancedAIAnalysis              │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│          OpenAI GPT-4                       │
│                                             │
│  Structured JSON Response with:            │
│  - 5 section summaries                      │
│  - 5 × 5 W5 analyses (if requested)         │
│  - Legacy fields for compatibility          │
└─────────────────────────────────────────────┘
```

### Key Files

#### 1. AI Service (`lib/services/ai.ts`)

**New Interfaces:**
```typescript
interface W5Analysis {
  who: string
  what: string
  when: string
  where: string
  why: string
}

interface AnalysisSection {
  summary: string
  w5Details?: W5Analysis
}

interface EnhancedAIAnalysis {
  executiveSummary: string
  whatIsTrue: AnalysisSection
  whatIsSpin: AnalysisSection
  realImpact: AnalysisSection
  commonGround: AnalysisSection
  biggerPicture: AnalysisSection
  // ... legacy fields
}
```

**New Method:**
```typescript
AIService.analyzeArticlesEnhanced(
  leftArticle,
  rightArticle,
  includeW5 = true
): Promise<EnhancedAIAnalysis>
```

#### 2. UI Component (`components/features/enhanced-analysis.tsx`)

**Components:**
- `EnhancedAnalysisDisplay` - Main display component
- `AnalysisSectionCard` - Individual section with expand/collapse
- `W5DetailItem` - Individual W5 point display
- `W5AnalysisToggle` - User preference toggle (localStorage)

**Features:**
- Collapsible sections with smooth animations
- Color-coded sections (green/yellow/blue/purple/indigo)
- Icons for each W5 element (Users, FileText, Clock, MapPin, Lightbulb)
- Dark mode support
- Responsive design

#### 3. API Route (`app/api/ai/route.ts`)

**New Parameters:**
```typescript
POST /api/ai
{
  leftArticle: {...},
  rightArticle: {...},
  enhanced: true,      // Use enhanced analysis (default: true)
  includeW5: true,     // Include W5 sections (default: true)
  saveToDb: false
}
```

**Response:**
- If `enhanced=true`: Returns full `EnhancedAIAnalysis` object
- If `enhanced=false`: Returns legacy `AIAnalysisResult`
- Stored as JSON string in database `aiAnalysis` field

#### 4. Article Page (`app/article/[slug]/page.tsx`)

**Features:**
- Fetches article with analysis from API
- Parses JSON analysis if enhanced format
- Renders `EnhancedAnalysisDisplay` component
- Includes `W5AnalysisToggle` for user preferences
- Fallback to legacy analysis display
- Shows left/right source cards with links

---

## User Experience Flow

### Default Experience
1. User views article page
2. Sees executive summary + 5 section summaries (collapsed)
3. Sections are color-coded for easy scanning
4. Reading time: ~3-5 minutes for summaries

### Deep-Dive Experience
1. User clicks "Dig Deeper with W5 Analysis" on any section
2. Section expands to show 5 W5 points
3. Each W5 point is 50-100 words with icon
4. User can expand multiple sections simultaneously
5. Reading time: ~10-15 minutes for full analysis

### Preference Management
1. User toggles "Deep-Dive W5 Analysis" setting
2. Preference saved to localStorage
3. Applies to all article views (future enhancement: server-side preference)

---

## AI Prompt Engineering

### System Prompt
```
You are an expert media analyst for Narrative News, specializing in
objective, multi-perspective news analysis.

Analysis Framework:
1. What's True - Facts both sides agree on
2. What's Spin - How each side frames the story
3. Real Impact - Who is affected and how
4. Common Ground - Shared concerns despite different framing
5. The Bigger Picture - Context and broader implications

For each section, provide W5 Analysis to help readers dig deeper.
```

### User Prompt Structure
- Article content from both left & right sources (2500 chars each)
- Exact JSON schema with 5 sections
- Optional W5 fields per section (controlled by `includeW5` flag)
- Specific instructions for each W5 element
- Word count guidance (50-100 words per W5 point)

### Token Usage
- **Without W5:** ~1800 max tokens → $0.03 per analysis (GPT-4)
- **With W5:** ~3000 max tokens → $0.06 per analysis (GPT-4)
- **Cost per article:** $0.03-0.06 (one-time generation, then cached)

---

## Performance Considerations

### Caching Strategy
W5 analysis is expensive to generate but static once created:

1. **Initial Generation:**
   - Use `analyzeArticlesEnhanced(includeW5: true)`
   - Store full JSON in database `aiAnalysis` field
   - Cache in Redis with 24-hour TTL

2. **Subsequent Requests:**
   - Fetch from database (JSON string)
   - Parse and return immediately
   - No additional AI API calls

3. **Lazy Loading Option** (Future Enhancement):
   - Generate summaries without W5 initially
   - Generate W5 on first user click
   - Cache W5 separately per section

### Database Storage
```sql
-- aiAnalysis field stores JSON string
{
  "executiveSummary": "...",
  "whatIsTrue": {
    "summary": "...",
    "w5Details": {
      "who": "...",
      "what": "...",
      ...
    }
  },
  ...
}

-- Typical size: 8-15 KB per article
-- PostgreSQL handles JSON efficiently
-- Can index JSON fields if needed
```

---

## Testing Strategy

### Unit Tests
```bash
# Test AI service methods
npm test lib/services/ai.test.ts

# Test parsing logic
- parseEnhancedResponse()
- createFallbackEnhancedAnalysis()
```

### Integration Tests
```bash
# Test API endpoint
POST /api/ai
- With enhanced=true, includeW5=true
- With enhanced=true, includeW5=false
- With enhanced=false (legacy)
```

### Manual Testing Checklist
- [ ] Generate analysis with W5
- [ ] Generate analysis without W5
- [ ] Expand/collapse sections work smoothly
- [ ] W5 toggle saves preference
- [ ] Dark mode renders correctly
- [ ] Mobile responsive (sections stack)
- [ ] Icons load properly (lucide-react)
- [ ] Reading time calculated correctly
- [ ] Fallback works if AI fails

---

## Usage Examples

### Generate Enhanced Analysis with W5
```typescript
import { AIService } from '@/lib/services/ai'

const analysis = await AIService.analyzeArticlesEnhanced(
  {
    title: 'Fed Cuts Rates by 0.25%',
    content: '...',
    outlet: 'New York Times',
    summary: '...'
  },
  {
    title: 'Fed Slashes Rates, Risking Inflation',
    content: '...',
    outlet: 'Fox News',
    summary: '...'
  },
  true // includeW5
)

console.log(analysis.whatIsTrue.summary)
console.log(analysis.whatIsTrue.w5Details?.who)
```

### Use in React Component
```tsx
import { EnhancedAnalysisDisplay } from '@/components/features/enhanced-analysis'

export default function ArticlePage() {
  const [analysis, setAnalysis] = useState<EnhancedAIAnalysis | null>(null)

  // ... fetch analysis

  return (
    <EnhancedAnalysisDisplay
      analysis={analysis}
      defaultExpanded={false}
    />
  )
}
```

### API Call from Frontend
```typescript
const response = await fetch('/api/ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    leftArticle: {...},
    rightArticle: {...},
    enhanced: true,
    includeW5: true,
    saveToDb: true
  })
})

const { data } = await response.json()
console.log(data.whatIsTrue.w5Details)
```

---

## Future Enhancements

### Phase 1 (Current)
- ✅ Five section summaries
- ✅ Optional W5 breakdowns
- ✅ Expand/collapse UI
- ✅ localStorage preferences

### Phase 2 (Planned)
- [ ] Lazy-load W5 sections on demand
- [ ] Individual section caching
- [ ] User accounts with saved preferences
- [ ] Analytics on which sections users expand most

### Phase 3 (Future)
- [ ] AI-powered "Related Context" links per W5 point
- [ ] Historical comparison (how framing evolved over time)
- [ ] Custom W5 questions (users can ask specific Whos/Whats/etc)
- [ ] Export analysis as PDF with selected W5 sections

---

## Troubleshooting

### Issue: W5 sections not showing
**Solution:**
- Check `includeW5: true` in API call
- Verify OpenAI API returned W5 data
- Check browser console for parsing errors
- Ensure `w5Details` exists in analysis object

### Issue: Sections won't expand
**Solution:**
- Verify lucide-react icons installed: `npm install lucide-react`
- Check browser console for React errors
- Ensure state management working (`useState` hook)

### Issue: AI response missing W5 fields
**Solution:**
- Check OpenAI API response in logs
- Verify prompt includes W5 instructions
- May need to adjust temperature (currently 0.3)
- Fallback will provide basic structure if parsing fails

### Issue: Performance slow with W5
**Solution:**
- Enable Redis caching (60-80% faster)
- Generate W5 async in background
- Consider lazy-loading W5 on user click
- Pre-generate analyses during cron jobs

---

## Analytics & Metrics

Track these KPIs to measure W5 feature success:

1. **Engagement:**
   - % of users who expand W5 sections
   - Average sections expanded per article
   - Time spent on articles with W5 vs without

2. **Performance:**
   - API response time with/without W5
   - Cache hit rate for W5 analyses
   - Token usage per article

3. **Quality:**
   - User feedback on W5 usefulness
   - Accuracy of W5 analyses (manual review sample)
   - Completeness (% with all 5 W5 points)

4. **Business:**
   - SEO impact (search rankings)
   - User retention (return visits)
   - Premium conversion (if monetized)

---

## Support & Contact

- **Documentation:** This file + inline code comments
- **Issues:** Open GitHub issue with `[W5]` prefix
- **Testing:** See `lib/services/ai.test.ts` for examples

---

**Status:** ✅ Implementation Complete - Ready for Testing
**Next Steps:** Generate test articles, monitor performance, gather user feedback
