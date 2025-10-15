'use client'

import { useState, useEffect } from 'react'

interface SystemStats {
  articles: number
  subscribers: number
  totalViews: number
  automationStatus: 'running' | 'stopped' | 'error'
  lastAutomationRun: string
  emailHealth: 'healthy' | 'error'
  aiHealth: 'healthy' | 'error'
  dbHealth: 'healthy' | 'error'
}

interface Service {
  name: string
  status: string
  description: string
}

export function SystemHealth({ stats }: { stats: SystemStats | null }) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (stats) {
      setServices([
        {
          name: 'Database',
          status: stats.dbHealth,
          description: 'Article and user data storage'
        },
        {
          name: 'AI Service',
          status: stats.aiHealth,
          description: 'OpenAI analysis generation'
        },
        {
          name: 'Email Service',
          status: stats.emailHealth,
          description: 'Newsletter delivery system'
        },
        {
          name: 'Automation',
          status: stats.automationStatus === 'running' ? 'healthy' : 'error',
          description: 'News scraping and processing'
        }
      ])
    }
  }, [stats])

  const runHealthCheck = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/health-check', {
        method: 'POST'
      })
      const data = await response.json()
      if (data.success) {
        setServices(data.data.services)
      }
    } catch (error) {
      console.error('Health check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'error':
      case 'stopped':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
        return '✅'
      case 'error':
      case 'stopped':
        return '❌'
      default:
        return '⚠️'
    }
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            📊 System Overview
          </h2>
          <button
            onClick={runHealthCheck}
            disabled={loading}
            className="btn-secondary text-sm"
          >
            {loading ? '⏳ Checking...' : '🔍 Run Health Check'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.articles}</div>
            <div className="text-sm text-blue-700">Published Articles</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.subscribers}</div>
            <div className="text-sm text-green-700">Active Subscribers</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.totalViews.toLocaleString()}</div>
            <div className="text-sm text-purple-700">Total Views</div>
          </div>
        </div>

        {/* Last Automation Run */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Last Automation Run</h3>
              <p className="text-sm text-gray-600">
                {stats.lastAutomationRun ? 
                  new Date(stats.lastAutomationRun).toLocaleString() : 
                  'Never run'
                }
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(stats.automationStatus)}`}>
              {getStatusIcon(stats.automationStatus)} {stats.automationStatus.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Service Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          🛠️ Service Health
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{service.name}</h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                  {getStatusIcon(service.status)} {service.status.toUpperCase()}
                </div>
              </div>
              <p className="text-sm text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* System Alerts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🚨 System Alerts
        </h2>

        {stats.automationStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <div className="text-red-600 mr-3">⚠️</div>
              <div>
                <h3 className="font-medium text-red-800">Automation Error</h3>
                <p className="text-red-700 text-sm">
                  The automation system has encountered an error. Check logs for details.
                </p>
              </div>
            </div>
          </div>
        )}

        {stats.emailHealth === 'error' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <div className="text-yellow-600 mr-3">⚠️</div>
              <div>
                <h3 className="font-medium text-yellow-800">Email Service Issue</h3>
                <p className="text-yellow-700 text-sm">
                  Email service configuration may need attention.
                </p>
              </div>
            </div>
          </div>
        )}

        {stats.subscribers < 10 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <div className="text-blue-600 mr-3">💡</div>
              <div>
                <h3 className="font-medium text-blue-800">Grow Your Audience</h3>
                <p className="text-blue-700 text-sm">
                  You have {stats.subscribers} subscribers. Consider promoting your newsletter to grow your audience.
                </p>
              </div>
            </div>
          </div>
        )}

        {services.every(s => s.status === 'healthy') && stats.automationStatus === 'running' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-green-600 mr-3">✅</div>
              <div>
                <h3 className="font-medium text-green-800">All Systems Operational</h3>
                <p className="text-green-700 text-sm">
                  All services are running normally. Your platform is healthy!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}