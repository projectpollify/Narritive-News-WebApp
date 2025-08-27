'use client'

import { useState, useEffect } from 'react'

interface NewsletterStats {
  activeSubscribers: number
  totalSubscribers: number
  recentSignups: number
  unsubscribeRate: number
  lastCampaign?: {
    sent: number
    failed: number
    timestamp: string
  }
}

interface Subscriber {
  id: string
  email: string
  subscribedAt: string
  isActive: boolean
  preferences: {
    categories: string[]
    frequency: string
  }
}

export function NewsletterManager() {
  const [stats, setStats] = useState<NewsletterStats | null>(null)
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [testEmail, setTestEmail] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsResponse, subscribersResponse] = await Promise.all([
        fetch('/api/newsletter'),
        fetch('/api/admin/subscribers')
      ])

      const statsData = await statsResponse.json()
      const subscribersData = await subscribersResponse.json()

      if (statsData.success) {
        setStats(statsData.data)
      }

      if (subscribersData.success) {
        setSubscribers(subscribersData.data)
      }
    } catch (error) {
      console.error('Failed to fetch newsletter data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAction = async (action: string, email?: string) => {
    setActionLoading(action)
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, email })
      })

      const data = await response.json()
      if (data.success) {
        if (action === 'send-newsletter') {
          alert(`Newsletter sent successfully!\nSent: ${data.data.sent} emails\nFailed: ${data.data.failed} emails`)
        } else {
          alert(data.message)
        }
        await fetchData()
      } else {
        alert(`Action failed: ${data.error}`)
      }
    } catch (error) {
      alert(`Action failed: ${error.message}`)
    } finally {
      setActionLoading('')
    }
  }

  const exportSubscribers = () => {
    const csvContent = [
      ['Email', 'Subscribed Date', 'Status', 'Categories', 'Frequency'],
      ...subscribers.map(sub => [
        sub.email,
        new Date(sub.subscribedAt).toLocaleDateString(),
        sub.isActive ? 'Active' : 'Inactive',
        sub.preferences.categories.join('; '),
        sub.preferences.frequency
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `narrative-news-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Newsletter Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          📧 Newsletter Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats?.activeSubscribers || 0}</div>
            <div className="text-sm text-blue-700">Active Subscribers</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{stats?.recentSignups || 0}</div>
            <div className="text-sm text-green-700">New This Week</div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{stats?.unsubscribeRate.toFixed(1) || '0.0'}%</div>
            <div className="text-sm text-red-700">Unsubscribe Rate</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{stats?.totalSubscribers || 0}</div>
            <div className="text-sm text-purple-700">Total All-Time</div>
          </div>
        </div>

        {/* Last Campaign */}
        {stats?.lastCampaign && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">📊 Last Email Campaign</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Sent:</span>
                <div className="font-semibold text-green-600">{stats.lastCampaign.sent}</div>
              </div>
              <div>
                <span className="text-gray-600">Failed:</span>
                <div className="font-semibold text-red-600">{stats.lastCampaign.failed}</div>
              </div>
              <div>
                <span className="text-gray-600">Time:</span>
                <div className="font-semibold">{new Date(stats.lastCampaign.timestamp).toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleEmailAction('send-newsletter')}
              disabled={actionLoading === 'send-newsletter'}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {actionLoading === 'send-newsletter' ? '⏳ Sending...' : '📧 Send Newsletter Now'}
            </button>
            
            <button
              onClick={() => handleEmailAction('test-config')}
              disabled={actionLoading === 'test-config'}
              className="btn-secondary disabled:opacity-50"
            >
              {actionLoading === 'test-config' ? '⏳ Testing...' : '🔧 Test Email Config'}
            </button>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">✉️ Test Email</h4>
            <div className="flex gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email address..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => handleEmailAction('send-test', testEmail)}
                disabled={!testEmail || actionLoading === 'send-test'}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'send-test' ? '⏳ Sending...' : '📤 Send Test'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriber Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            👥 Subscriber Management
          </h2>
          <button
            onClick={exportSubscribers}
            className="btn-secondary"
          >
            📥 Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>All Subscribers</option>
            <option>Active Only</option>
            <option>Inactive Only</option>
            <option>Recent Signups</option>
          </select>
          
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>All Categories</option>
            <option>Politics</option>
            <option>Business</option>
            <option>Technology</option>
          </select>

          <input
            type="search"
            placeholder="Search emails..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Subscribers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-900">Email</th>
                <th className="text-left py-3 px-2 font-medium text-gray-900">Subscribed</th>
                <th className="text-left py-3 px-2 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-2 font-medium text-gray-900">Preferences</th>
                <th className="text-left py-3 px-2 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.slice(0, 20).map((subscriber) => (
                <tr key={subscriber.id} className="border-b border-gray-100">
                  <td className="py-3 px-2 text-gray-900">{subscriber.email}</td>
                  <td className="py-3 px-2 text-gray-600">
                    {new Date(subscriber.subscribedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      subscriber.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subscriber.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-600">
                    <div className="text-xs">
                      <div>{subscriber.preferences.categories.join(', ')}</div>
                      <div className="text-gray-500">{subscriber.preferences.frequency}</div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <button className="text-blue-600 hover:text-blue-800 text-xs">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {subscribers.length > 20 && (
          <div className="mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm">
              Load More Subscribers
            </button>
          </div>
        )}
      </div>
    </div>
  )
}