'use client'

import { useEffect, useState } from 'react'

export function RSSManager() {
  const [feeds, setFeeds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeeds()
  }, [])

  const fetchFeeds = async () => {
    try {
      const response = await fetch('/api/admin/rss-feeds')
      const data = await response.json()
      if (data.success) {
        setFeeds(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch RSS feeds:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFeed = async (feedId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/rss-feeds/${feedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        fetchFeeds()
      }
    } catch (error) {
      console.error('Failed to update feed:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">RSS Feed Management</h2>
        <p className="text-sm text-gray-600 mt-1">
          {feeds.filter((f) => f.isActive).length} active feeds
        </p>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="text-gray-500">Loading RSS feeds...</div>
        ) : feeds.length === 0 ? (
          <div className="text-gray-500">No RSS feeds configured</div>
        ) : (
          <div className="space-y-4">
            {feeds.map((feed: any) => (
              <div
                key={feed.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{feed.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{feed.outlet}</div>
                  <div className="text-xs text-gray-500 mt-1 font-mono">{feed.url}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      feed.bias === 'LEFT'
                        ? 'bg-blue-100 text-blue-800'
                        : feed.bias === 'RIGHT'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {feed.bias}
                  </span>
                  <button
                    onClick={() => toggleFeed(feed.id, feed.isActive)}
                    className={`px-3 py-1 text-sm rounded ${
                      feed.isActive
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {feed.isActive ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
