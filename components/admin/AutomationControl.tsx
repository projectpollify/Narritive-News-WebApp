'use client'

import { useState } from 'react'

interface AutomationControlProps {
  compact?: boolean
}

export function AutomationControl({ compact = false }: AutomationControlProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const triggerAutomation = async (endpoint: string, label: string) => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(endpoint, { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        setMessage(`✅ ${label} completed successfully!`)
      } else {
        setMessage(`❌ ${label} failed: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const automationActions = [
    {
      label: 'Scrape RSS Feeds',
      endpoint: '/api/automation/scrape',
      description: 'Fetch latest articles from RSS feeds',
      icon: '📡',
    },
    {
      label: 'Match Stories',
      endpoint: '/api/automation/match',
      description: 'Find matching left/right articles',
      icon: '🔗',
    },
    {
      label: 'Analyze Articles',
      endpoint: '/api/automation/analyze',
      description: 'Run AI analysis on matched pairs',
      icon: '🤖',
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Automation Control</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manually trigger automation tasks
        </p>
      </div>
      <div className={`p-6 ${compact ? '' : 'space-y-4'}`}>
        {message && (
          <div
            className={`p-4 rounded-md mb-4 ${
              message.startsWith('✅')
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        <div className="space-y-3">
          {automationActions.map((action, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{action.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">{action.label}</div>
                  <div className="text-sm text-gray-600">{action.description}</div>
                </div>
              </div>
              <button
                onClick={() => triggerAutomation(action.endpoint, action.label)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Running...' : 'Run'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
