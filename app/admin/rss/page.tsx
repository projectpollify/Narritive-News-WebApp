'use client'

import { useState, useEffect } from 'react'

interface RSSFeed {
  id: string
  url: string
  outlet: string
  bias: 'LEFT' | 'RIGHT' | 'CENTER'
  category?: string
  isActive: boolean
  lastChecked?: string
}

export function RSSManager() {
  const [feeds, setFeeds] = useState<RSSFeed[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [testingFeed, setTestingFeed] = useState('')
  const [newFeed, setNewFeed] = useState({
    url: '',
    outlet: '',
    bias: 'LEFT' as const,
    category: 'General',
    isActive: true
  })

  useEffect(() => {
    fetchFeeds()
  }, [])

  const fetchFeeds = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/rss-feeds')
      const data = await response.json()
      if (data.success) {
        setFeeds(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch RSS feeds:', error)
    } finally {
      setLoading(false)
    }
  }

  const addFeed = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/rss-feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeed)
      })

      const data = await response.json()
      if (data.success) {
        setFeeds([...feeds, data.data])
        setNewFeed({
          url: '',
          outlet: '',
          bias: 'LEFT',
          category: 'General',
          isActive: true
        })
        setShowAddForm(false)
      } else {
        alert(`Failed to add feed: ${data.error}`)
      }
    } catch (error) {
      alert(`Failed to add feed: ${error.message}`)
    }
  }

  const toggleFeedStatus = async (feedId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/rss-feeds/${feedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        setFeeds(feeds.map(feed => 
          feed.id === feedId 
            ? { ...feed, isActive: !isActive }
            : feed
        ))
      }
    } catch (error) {
      console.error('Failed to toggle feed status:', error)
    }
  }

  const testFeed = async (url: string) => {
    setTestingFeed(url)
    try {
      const response = await fetch('/api/test-scraper', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      if (data.success) {
        const feedResult = data.results.find((r: any) => r.url === url)
        if (feedResult) {
          alert(`Feed test successful!\nArticles found: ${feedResult.articlesFound}\nLast article: ${feedResult.articles[0]?.title || 'None'}`)
        } else {
          alert('Feed test completed - check console for details')
        }
      } else {
        alert(`Feed test failed: ${data.error}`)
      }
    } catch (error) {
      alert(`Feed test failed: ${error.message}`)
    } finally {
      setTestingFeed('')
    }
  }

  const deleteFeed = async (feedId: string) => {
    if (!confirm('Are you sure you want to delete this RSS feed?')) return

    try {
      const response = await fetch(`/api/admin/rss-feeds/${feedId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFeeds(feeds.filter(feed => feed.id !== feedId))
      }
    } catch (error) {
      console.error('Failed to delete feed:', error)
    }
  }

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case 'LEFT': return 'bg-blue-100 text-blue-800'
      case 'RIGHT': return 'bg-red-100 text-red-800'
      case 'CENTER': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getBiasIcon = (bias: string) => {
    switch (bias) {
      case 'LEFT': return '🔵'
      case 'RIGHT': return '🔴'
      case 'CENTER': return '🟢'
      default: return '⚪'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            📡 RSS Feed Management
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
          >
            ➕ Add New Feed
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {feeds.filter(f => f.bias === 'LEFT').length}
            </div>
            <div className="text-sm text-blue-700">Left Sources</div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">
              {feeds.filter(f => f.bias === 'RIGHT').length}
            </div>
            <div className="text-sm text-red-700">Right Sources</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {feeds.filter(f => f.bias === 'CENTER').length}
            </div>
            <div className="text-sm text-green-700">Center Sources</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {feeds.filter(f => f.isActive).length}
            </div>
            <div className="text-sm text-purple-700">Active Feeds</div>
          </div>
        </div>
      </div>

      {/* Add Feed Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Add New RSS Feed
          </h3>
          
          <form onSubmit={addFeed} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RSS URL *
                </label>
                <input
                  type="url"
                  value={newFeed.url}
                  onChange={(e) => setNewFeed({...newFeed, url: e.target.value})}
                  placeholder="https://example.com/rss"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outlet Name *
                </label>
                <input
                  type="text"
                  value={newFeed.outlet}
                  onChange={(e) => setNewFeed({...newFeed, outlet: e.target.value})}
                  placeholder="CNN, Fox News, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Political Bias *
                </label>
                <select
                  value={newFeed.bias}
                  onChange={(e) => setNewFeed({...newFeed, bias: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="LEFT">Left-leaning</option>
                  <option value="RIGHT">Right-leaning</option>
                  <option value="CENTER">Center/Neutral</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newFeed.category}
                  onChange={(e) => setNewFeed({...newFeed, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="General">General</option>
                  <option value="Politics">Politics</option>
                  <option value="Business">Business</option>
                  <option value="Technology">Technology</option>
                  <option value="Health">Health</option>
                  <option value="Environment">Environment</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={newFeed.isActive}
                onChange={(e) => setNewFeed({...newFeed, isActive: e.target.checked})}
                className="rounded border-gray-300"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Active (start monitoring immediately)
              </label>
            </div>
            
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Add Feed
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feeds List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Current RSS Feeds ({feeds.length})
        </h3>
        
        <div className="space-y-4">
          {feeds.map((feed) => (
            <div key={feed.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{feed.outlet}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getBiasColor(feed.bias)}`}>
                      {getBiasIcon(feed.bias)} {feed.bias}
                    </span>
                    {feed.category && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {feed.category}
                      </span>
                    )}
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      feed.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {feed.isActive ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{feed.url}</p>
                  
                  {feed.lastChecked && (
                    <p className="text-xs text-gray-500">
                      Last checked: {new Date(feed.lastChecked).toLocaleString()}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => testFeed(feed.url)}
                    disabled={testingFeed === feed.url}
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
                  >
                    {testingFeed === feed.url ? '⏳' : '🧪'} Test
                  </button>
                  
                  <button
                    onClick={() => toggleFeedStatus(feed.id, feed.isActive)}
                    className={`text-sm ${
                      feed.isActive 
                        ? 'text-red-600 hover:text-red-800' 
                        : 'text-green-600 hover:text-green-800'
                    }`}
                  >
                    {feed.isActive ? '⏸️ Pause' : '▶️ Activate'}
                  </button>
                  
                  <button
                    onClick={() => deleteFeed(feed.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {feeds.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">📡</div>
              <h3 className="text-gray-900 font-medium mb-2">No RSS feeds configured</h3>
              <p className="text-gray-600 text-sm">
                Add RSS feeds to start automatically collecting news articles.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-3">
          💡 Recommended RSS Feeds
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Left-leaning Sources:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• CNN: https://rss.cnn.com/rss/edition.rss</li>
              <li>• The Guardian: https://www.theguardian.com/us/rss</li>
              <li>• Washington Post: https://feeds.washingtonpost.com/rss/politics</li>
              <li>• HuffPost: https://www.huffpost.com/section/front-page/feed</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Right-leaning Sources:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Fox News: https://feeds.foxnews.com/foxnews/politics</li>
              <li>• Wall Street Journal: https://www.wsj.com/xml/rss/3_7085.xml</li>
              <li>• National Review: https://www.nationalreview.com/rss.xml</li>
              <li>• New York Post: https://nypost.com/feed/</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}