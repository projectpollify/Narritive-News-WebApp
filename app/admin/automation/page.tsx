'use client'

import { useState, useEffect } from 'react'

interface AutomationStatus {
  isRunning: boolean
  newsJobActive: boolean
  emailJobActive: boolean
  nextNewsRun: string | null
  nextEmailRun: string | null
  lastRun: {
    timestamp: string
    success: boolean
    processed: number
    total: number
  } | null
}

export function AutomationControl({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<AutomationStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState('')

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/automation')
      const data = await response.json()
      if (data.success) {
        setStatus(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch automation status:', error)
    }
  }

  const handleAction = async (action: string) => {
    setActionLoading(action)
    try {
      const response = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      const data = await response.json()
      if (data.success) {
        await fetchStatus()
        
        // Show success message
        if (action === 'trigger-news') {
          alert(`News automation completed!\nProcessed: ${data.data.processed}/${data.data.total} articles`)
        } else if (action === 'trigger-email') {
          alert(`Email campaign completed!\nSent: ${data.data.sent} emails`)
        }
      } else {
        alert(`Action failed: ${data.error}`)
      }
    } catch (error) {
      alert(`Action failed: ${error.message}`)
    } finally {
      setActionLoading('')
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? '🟢 Running' : '🔴 Stopped'}
      </span>
    )
  }

  if (!status) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          🤖 Automation Control
        </h2>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Overall Status */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">System Status</h3>
            <p className="text-sm text-gray-600">
              Automation scheduler is {status.isRunning ? 'active' : 'inactive'}
            </p>
          </div>
          {getStatusBadge(status.isRunning)}
        </div>
      </div>

      {/* Job Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">📰 News Scraping</h3>
            {getStatusBadge(status.newsJobActive)}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Automatically scans news sources every 6 hours
          </p>
          {status.nextNewsRun && (
            <p className="text-xs text-gray-500">
              Next run: {new Date(status.nextNewsRun).toLocaleString()}
            </p>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">📧 Email Newsletter</h3>
            {getStatusBadge(status.emailJobActive)}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Sends daily newsletter at 8 AM EST
          </p>
          {status.nextEmailRun && (
            <p className="text-xs text-gray-500">
              Next run: {new Date(status.nextEmailRun).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Last Run Results */}
      {status.lastRun && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">📊 Last Automation Run</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Time:</span>
              <div className="font-medium">
                {new Date(status.lastRun.timestamp).toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-blue-700">Status:</span>
              <div className={`font-medium ${status.lastRun.success ? 'text-green-600' : 'text-red-600'}`}>
                {status.lastRun.success ? '✅ Success' : '❌ Failed'}
              </div>
            </div>
            <div>
              <span className="text-blue-700">Processed:</span>
              <div className="font-medium">{status.lastRun.processed}</div>
            </div>
            <div>
              <span className="text-blue-700">Total Found:</span>
              <div className="font-medium">{status.lastRun.total}</div>
            </div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      {!compact && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleAction('start')}
              disabled={status.isRunning || actionLoading === 'start'}
              className="btn-primary disabled:opacity-50"
            >
              {actionLoading === 'start' ? '⏳ Starting...' : '▶️ Start Automation'}
            </button>
            
            <button
              onClick={() => handleAction('stop')}
              disabled={!status.isRunning || actionLoading === 'stop'}
              className="btn-secondary disabled:opacity-50"
            >
              {actionLoading === 'stop' ? '⏳ Stopping...' : '⏹️ Stop Automation'}
            </button>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Manual Triggers</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleAction('trigger-news')}
                disabled={actionLoading === 'trigger-news'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'trigger-news' ? '⏳ Running...' : '🔄 Run News Scraping Now'}
              </button>
              
              <button
                onClick={() => handleAction('trigger-email')}
                disabled={actionLoading === 'trigger-email'}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'trigger-email' ? '⏳ Sending...' : '📧 Send Newsletter Now'}
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-yellow-600 mr-3">⚠️</div>
              <div>
                <h4 className="font-medium text-yellow-800">Important Notes</h4>
                <ul className="text-yellow-700 text-sm mt-2 space-y-1">
                  <li>• Manual triggers run immediately regardless of schedule</li>
                  <li>• News scraping may take 5-10 minutes to complete</li>
                  <li>• Email campaigns are rate-limited to protect your reputation</li>
                  <li>• Stop automation only if you need to perform maintenance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}