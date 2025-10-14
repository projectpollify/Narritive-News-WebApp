# Section 5: Admin Dashboard & Monitoring Enhancements

**Time Estimate:** 2-2.5 hours
**Complexity:** MEDIUM
**Dependencies:** Sections 1, 2 complete; Section 4 recommended
**Risk Level:** Low (UI improvements only)

---

## 🎯 Objectives

Enhance the admin dashboard with better monitoring, analytics, and control features:

1. **Analytics Dashboard** - Visualize traffic, engagement, revenue
2. **System Health Monitoring** - Track automation status, API health
3. **Content Management** - Better article review and editing
4. **Subscriber Management** - Enhanced subscriber tools
5. **Revenue Tracking** - Monitor monetization performance

---

## 📊 Dashboard Features to Build

### Current State
- ✅ Basic admin routes exist (`/app/admin/*`)
- ✅ Article management page
- ✅ Subscriber management page
- ⚠️ Limited analytics
- ⚠️ No system health monitoring
- ⚠️ Basic UI only

### Target State
- ✅ Rich analytics dashboard with charts
- ✅ Real-time system health monitoring
- ✅ Advanced content management
- ✅ Revenue tracking dashboard
- ✅ Alert system for issues

---

## 📋 Tasks Checklist

### Task 5.1: Analytics Dashboard with Charts
**Time: 1 hour**

Create comprehensive analytics visualization.

#### A. Install/Verify Chart Library

Already installed: `recharts` ✅

#### B. Create Analytics API Endpoint

Create `/app/api/admin/analytics/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30days'

    // Gather analytics data
    const stats = {
      overview: {
        totalArticles: await prisma.article.count({ where: { isPublished: true } }),
        totalViews: await prisma.article.aggregate({ _sum: { viewCount: true } }),
        totalSubscribers: await prisma.subscriber.count({ where: { isActive: true } }),
        articlesThisWeek: await getArticlesThisWeek(),
      },

      traffic: {
        dailyVisitors: await getDailyVisitors(timeframe),
        pageViews: await getPageViews(timeframe),
        topArticles: await getTopArticles(10),
      },

      engagement: {
        avgTimeOnPage: await getAvgTimeOnPage(),
        bounceRate: await getBounceRate(),
        sourceClicks: await DatabaseService.getSourceClickStats(),
      },

      content: {
        articlesByCategory: await DatabaseService.getArticlesByCategory(),
        publishFrequency: await getPublishFrequency(),
      },

      subscribers: {
        growth: await getSubscriberGrowth(timeframe),
        conversionRate: await getNewsletterConversionRate(),
        activeRate: await getActiveSubscriberRate(),
      }
    }

    return NextResponse.json({ success: true, data: stats })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
```

#### C. Create Analytics Dashboard Component

Create `/components/admin/analytics-dashboard.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function AnalyticsDashboard() {
  const [stats, setStats] = useState(null)
  const [timeframe, setTimeframe] = useState('30days')

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe])

  const fetchAnalytics = async () => {
    const res = await fetch(`/api/admin/analytics?timeframe=${timeframe}`)
    const data = await res.json()
    setStats(data.data)
  }

  if (!stats) return <div>Loading analytics...</div>

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Articles"
          value={stats.overview.totalArticles}
          icon="📄"
        />
        <StatCard
          title="Total Views"
          value={stats.overview.totalViews._sum.viewCount || 0}
          icon="👁️"
        />
        <StatCard
          title="Subscribers"
          value={stats.overview.totalSubscribers}
          icon="📧"
        />
        <StatCard
          title="This Week"
          value={stats.overview.articlesThisWeek}
          subtitle="articles published"
          icon="📅"
        />
      </div>

      {/* Traffic Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Daily Traffic</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.traffic.dailyVisitors}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="visitors" stroke="#3b82f6" />
            <Line type="monotone" dataKey="pageViews" stroke="#10b981" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Articles by Category */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Articles by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.content.articlesByCategory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Source Click Distribution */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Source Preference</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: 'Left Sources', value: stats.engagement.sourceClicks.leftClicks },
                { name: 'Right Sources', value: stats.engagement.sourceClicks.rightClicks }
              ]}
              cx="50%"
              cy="50%"
              labelLine={false}
              label
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              <Cell fill="#3b82f6" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top Articles Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Top Articles</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Category</th>
              <th className="text-right p-2">Views</th>
            </tr>
          </thead>
          <tbody>
            {stats.traffic.topArticles.map(article => (
              <tr key={article.id} className="border-b">
                <td className="p-2">{article.title}</td>
                <td className="p-2">{article.category}</td>
                <td className="p-2 text-right">{article.viewCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}
```

**Files to create:**
- `app/api/admin/analytics/route.ts` (NEW)
- `components/admin/analytics-dashboard.tsx` (NEW)

---

### Task 5.2: System Health Monitoring
**Time: 45 minutes**

Create real-time system health dashboard.

#### A. Create Health Check API

Create `/app/api/admin/health/route.ts`:

```typescript
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: await checkDatabase(),
      openai: await checkOpenAI(),
      email: await checkEmail(),
      automation: await checkAutomation(),
      cache: await checkCache(),
    },
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV,
    }
  }

  const allHealthy = Object.values(health.checks).every(c => c.status === 'ok')
  health.status = allHealthy ? 'healthy' : 'degraded'

  return NextResponse.json(health, {
    status: allHealthy ? 200 : 503
  })
}

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`
    const articleCount = await prisma.article.count()
    return {
      status: 'ok',
      message: `Connected. ${articleCount} articles`,
      lastChecked: new Date().toISOString()
    }
  } catch (error) {
    return { status: 'error', message: error.message }
  }
}

async function checkOpenAI() {
  try {
    const result = await AIService.healthCheck()
    return { status: result.status === 'healthy' ? 'ok' : 'error', message: result.message }
  } catch (error) {
    return { status: 'error', message: 'OpenAI unreachable' }
  }
}

// Similar checks for other services...
```

#### B. Create System Health Component

Create `/components/admin/system-health.tsx`:

```typescript
'use client'

export function SystemHealth() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchHealth = async () => {
    const res = await fetch('/api/admin/health')
    const data = await res.json()
    setHealth(data)
  }

  if (!health) return <div>Checking system health...</div>

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">System Health</h3>
        <div className={`px-4 py-2 rounded-full ${
          health.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {health.status.toUpperCase()}
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(health.checks).map(([service, check]) => (
          <ServiceStatus key={service} name={service} check={check} />
        ))}
      </div>

      <div className="mt-6 pt-6 border-t">
        <h4 className="font-semibold mb-2">System Metrics</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Uptime:</span>
            <span className="ml-2 font-medium">{formatUptime(health.metrics.uptime)}</span>
          </div>
          <div>
            <span className="text-gray-500">Memory:</span>
            <span className="ml-2 font-medium">{formatMemory(health.metrics.memory.heapUsed)}</span>
          </div>
          <div>
            <span className="text-gray-500">Environment:</span>
            <span className="ml-2 font-medium">{health.metrics.environment}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ServiceStatus({ name, check }) {
  const isOk = check.status === 'ok'

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-3 ${
          isOk ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="font-medium capitalize">{name}</span>
      </div>
      <span className="text-sm text-gray-600">{check.message}</span>
    </div>
  )
}
```

**Files to create:**
- `app/api/admin/health/route.ts` (NEW)
- `components/admin/system-health.tsx` (NEW)

---

### Task 5.3: Enhanced Content Management
**Time: 30 minutes**

Improve the article management interface.

Update `/app/admin/articles/page.tsx`:

```typescript
'use client'

export default function ArticlesPage() {
  const [articles, setArticles] = useState([])
  const [filter, setFilter] = useState('all') // all, published, draft
  const [search, setSearch] = useState('')

  // Add bulk actions
  const [selectedArticles, setSelectedArticles] = useState([])

  const handleBulkPublish = async () => {
    // Publish multiple articles at once
  }

  const handleBulkDelete = async () => {
    // Delete multiple articles
  }

  return (
    <div>
      {/* Filters and Search */}
      <div className="flex justify-between mb-6">
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')}>All</button>
          <button onClick={() => setFilter('published')}>Published</button>
          <button onClick={() => setFilter('draft')}>Drafts</button>
        </div>

        <input
          type="search"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded"
        />
      </div>

      {/* Bulk Actions */}
      {selectedArticles.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 rounded">
          <span>{selectedArticles.length} selected</span>
          <button onClick={handleBulkPublish}>Publish</button>
          <button onClick={handleBulkDelete}>Delete</button>
        </div>
      )}

      {/* Article List with better UI */}
      {/* ... */}
    </div>
  )
}
```

---

### Task 5.4: Revenue Tracking Dashboard (Optional)
**Time: 30 minutes**

If AdSense/monetization is enabled:

Create `/components/admin/revenue-dashboard.tsx`:

```typescript
export function RevenueDashboard() {
  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-3 gap-6">
        <StatCard title="Today's Revenue" value="$12.43" />
        <StatCard title="This Month" value="$387.50" />
        <StatCard title="All Time" value="$2,145.67" />
      </div>

      {/* Revenue by Source */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Revenue Sources</h3>
        {/* Chart showing AdSense, newsletter sponsors, subscriptions */}
      </div>

      {/* RPM Tracking */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Revenue Per Mille (RPM)</h3>
        {/* Track revenue per 1000 views */}
      </div>
    </div>
  )
}
```

---

## 📁 Files Summary

### New Files (6-8):
1. `app/api/admin/analytics/route.ts` - Analytics API
2. `app/api/admin/health/route.ts` - Health check API
3. `components/admin/analytics-dashboard.tsx` - Analytics UI
4. `components/admin/system-health.tsx` - Health monitor UI
5. `components/admin/revenue-dashboard.tsx` - Revenue tracking (optional)
6. `lib/utils/analytics-helpers.ts` - Analytics utilities

### Modified Files (2-3):
1. `app/admin/dashboard/page.tsx` - Add new components
2. `app/admin/articles/page.tsx` - Enhanced UI
3. `app/admin/subscribers/page.tsx` - Better management

---

## 📊 Success Criteria

After completing Section 5:

✅ **Analytics:**
- Visual charts for traffic, engagement
- Top articles identified
- Subscriber growth tracking
- Category distribution visible

✅ **Monitoring:**
- System health dashboard working
- Service status checks automated
- Alerts for issues (optional)
- Uptime tracking

✅ **Content Management:**
- Bulk actions available
- Better search and filtering
- Quick publish/unpublish
- Article preview

✅ **User Experience:**
- Beautiful, modern admin UI
- Fast and responsive
- Easy to navigate
- Informative dashboards

---

## 🔄 Next Steps

After Section 5:

**Your admin dashboard is powerful!**
- Monitor system health
- Track performance metrics
- Manage content efficiently
- Identify growth opportunities

**Move to Section 6:** Revenue Features (payments, subscriptions)

---

## ⏱️ Time Breakdown

| Task | Estimated Time |
|------|----------------|
| 5.1 Analytics Dashboard | 1 hour |
| 5.2 System Health | 45 minutes |
| 5.3 Content Management | 30 minutes |
| 5.4 Revenue Dashboard | 30 minutes |
| **Total** | **2.5 hours** |

---

**A great admin dashboard makes managing your app a joy!**
