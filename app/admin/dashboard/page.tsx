'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Eager load components that are shown on initial load
import { SystemHealth } from '@/components/admin/SystemHealth'

// Lazy load heavy components that aren't immediately visible
const AutomationControl = dynamic(
  () => import('@/components/admin/AutomationControl').then(mod => ({ default: mod.AutomationControl })),
  { loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>, ssr: false }
)

const AnalyticsDashboard = dynamic(
  () => import('@/components/admin/AnalyticsDashboard').then(mod => ({ default: mod.AnalyticsDashboard })),
  { loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>, ssr: false }
)

const NewsletterManager = dynamic(
  () => import('@/components/admin/NewsletterManager').then(mod => ({ default: mod.NewsletterManager })),
  { loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>, ssr: false }
)

const ArticleManager = dynamic(
  () => import('@/components/admin/ArticleManager').then(mod => ({ default: mod.ArticleManager })),
  { loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>, ssr: false }
)

const RSSManager = dynamic(
  () => import('@/components/admin/RSSManager').then(mod => ({ default: mod.RSSManager })),
  { loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>, ssr: false }
)

type TabType = 'overview' | 'automation' | 'analytics' | 'newsletter' | 'articles' | 'rss'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [systemStats, setSystemStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      if (data.success) {
        setSystemStats(data.data)
      }
    } catch (error: any) {
      console.error('Failed to fetch system stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'automation', name: 'Automation', icon: '🤖' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'newsletter', name: 'Newsletter', icon: '📧' },
    { id: 'articles', name: 'Articles', icon: '📰' },
    { id: 'rss', name: 'RSS Feeds', icon: '📡' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Narrative News Admin
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor and manage your news platform
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <button 
                onClick={fetchSystemStats}
                className="btn-secondary"
                disabled={loading}
              >
                {loading ? '⏳' : '🔄'} Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <SystemHealth stats={systemStats} />
            <div className="grid lg:grid-cols-2 gap-8">
              <AutomationControl compact />
              <AnalyticsDashboard compact />
            </div>
          </div>
        )}

        {activeTab === 'automation' && <AutomationControl />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'newsletter' && <NewsletterManager />}
        {activeTab === 'articles' && <ArticleManager />}
        {activeTab === 'rss' && <RSSManager />}
      </div>
    </div>
  )
}