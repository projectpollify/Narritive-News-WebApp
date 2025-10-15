'use client'

import { useEffect, useState } from 'react'

interface AnalyticsDashboardProps {
  compact?: boolean
}

export function AnalyticsDashboard({ compact = false }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      const data = await response.json()
      if (data.success) {
        setAnalytics(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Analytics</h2>
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    )
  }

  const metrics = [
    {
      label: 'Page Views (24h)',
      value: analytics?.pageViews24h || 0,
      trend: '+12%',
      icon: '📊',
    },
    {
      label: 'Unique Visitors',
      value: analytics?.uniqueVisitors || 0,
      trend: '+8%',
      icon: '👥',
    },
    {
      label: 'Avg. Session Duration',
      value: analytics?.avgSessionDuration || '0m',
      trend: '+5%',
      icon: '⏱️',
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Analytics Overview</h2>
        <p className="text-sm text-gray-600 mt-1">Last 24 hours</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{metric.icon}</span>
                <div>
                  <div className="text-sm text-gray-600">{metric.label}</div>
                  <div className="text-xl font-bold text-gray-900">{metric.value}</div>
                </div>
              </div>
              <div className="text-sm text-green-600 font-medium">{metric.trend}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
