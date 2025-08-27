'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface AnalyticsData {
  overview: {
    totalArticles: number
    totalViews: number
    totalSubscribers: number
    avgViewsPerArticle: number
  }
  topArticles: Array<{
    title: string
    viewCount: number
    publishedAt: string
  }>
  categoryStats: Array<{
    category: string
    count: number
  }>
  sourceStats: {
    leftClicks: number
    rightClicks: number
    total: number
  }
}

export function AnalyticsDashboard({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [timeframe, setTimeframe] = useState('week')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics?timeframe=${timeframe}&type=overview`)
      const result = await response.json()
      if (result.success) {
        // Simulate more complete analytics data
        const mockData: AnalyticsData = {
          overview: {
            totalArticles: result.data.totalArticles || 0,
            totalViews: result.data.totalViews || 0,
            totalSubscribers: result.data.totalSubscribers || 0,
            avgViewsPerArticle: result.data.totalArticles > 0 ? Math.round(result.data.totalViews / result.data.totalArticles) : 0
          },
          topArticles: [
            { title: 'Fed Rate Decision Sparks Debate', viewCount: 1250, publishedAt: '2024-01-15' },
            { title: 'Climate Summit Reaches Agreement', viewCount: 980, publishedAt: '2024-01-14' },
            { title: 'Tech Regulation Proposals', viewCount: 750, publishedAt: '2024-01-13' },
            { title: 'Healthcare Policy Changes', viewCount: 680, publishedAt: '2024-01-12' },
            { title: 'Trade Agreement Updates', viewCount: 620, publishedAt: '2024-01-11' }
          ],
          categoryStats: [
            { category: 'Politics', count: 45 },
            { category: 'Business', count: 32 },
            { category: 'Technology', count: 18 },
            { category: 'Health', count: 12 },
            { category: 'Environment', count: 8 }
          ],
          sourceStats: {
            leftClicks: 2340,
            rightClicks: 2180,
            total: 4520
          }
        }
        setData(mockData)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']

  if (loading || !data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          📈 Analytics Dashboard
        </h2>
        
        {!compact && (
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{data.overview.totalArticles}</div>
          <div className="text-sm text-blue-700">Articles</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{data.overview.totalViews.toLocaleString()}</div>
          <div className="text-sm text-green-700">Total Views</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{data.overview.totalSubscribers}</div>
          <div className="text-sm text-purple-700">Subscribers</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{data.overview.avgViewsPerArticle}</div>
          <div className="text-sm text-orange-700">Avg Views/Article</div>
        </div>
      </div>

      {compact ? (
        // Compact view for overview page
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">📊 Top Articles</h3>
            <div className="space-y-2">
              {data.topArticles.slice(0, 3).map((article, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm text-gray-900 truncate pr-4">{article.title}</span>
                  <span className="text-sm font-medium text-gray-600">{article.viewCount} views</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">🎯 Source Clicks</h3>
            <div className="flex justify-between text-sm">
              <div className="text-blue-600">Left: {data.sourceStats.leftClicks}</div>
              <div className="text-red-600">Right: {data.sourceStats.rightClicks}</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-l-full" 
                style={{ width: `${(data.sourceStats.leftClicks / data.sourceStats.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      ) : (
        // Full analytics view
        <div className="space-y-8">
          {/* Top Articles */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Top Performing Articles</h3>
            <div className="space-y-3">
              {data.topArticles.map((article, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{article.title}</h4>
                    <p className="text-sm text-gray-600">
                      Published: {new Date(article.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600">{article.viewCount}</div>
                    <div className="text-xs text-gray-500">views</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Category Distribution */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">📁 Articles by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.categoryStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Source Click Distribution */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">🎯 Source Click Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Left Sources', value: data.sourceStats.leftClicks, color: '#3B82F6' },
                      { name: 'Right Sources', value: data.sourceStats.rightClicks, color: '#EF4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#3B82F6" />
                    <Cell fill="#EF4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">👥 Audience Engagement</h4>
              <div className="text-2xl font-bold text-blue-700">
                {((data.sourceStats.total / data.overview.totalViews) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-blue-600">Click-through rate</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">📈 Growth Rate</h4>
              <div className="text-2xl font-bold text-green-700">+12.5%</div>
              <p className="text-sm text-green-600">vs last period</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">⭐ Quality Score</h4>
              <div className="text-2xl font-bold text-purple-700">8.7/10</div>
              <p className="text-sm text-purple-600">Content rating</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}