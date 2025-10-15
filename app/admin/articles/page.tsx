'use client'

import { useState, useEffect } from 'react'

interface Article {
  id: string
  title: string
  slug: string
  category: string
  publishedAt: string
  viewCount: number
  isPublished: boolean
  leftSource: {
    outlet: string
    headline: string
  }
  rightSource: {
    outlet: string
    headline: string
  }
}

function ArticleManager() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('publishedAt')
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])

  useEffect(() => {
    fetchArticles()
  }, [filter, sortBy])

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '50',
        sortBy,
        sortOrder: 'desc'
      })
      
      if (filter !== 'all') {
        params.append('category', filter)
      }

      const response = await fetch(`/api/articles?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setArticles(data.data)
      }
    } catch (error: any) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedArticles.length === 0) {
      alert('Please select articles first')
      return
    }

    try {
      const response = await fetch('/api/admin/articles/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          articleIds: selectedArticles
        })
      })

      const data = await response.json()
      if (data.success) {
        alert(data.message)
        setSelectedArticles([])
        fetchArticles()
      } else {
        alert(`Action failed: ${data.error}`)
      }
    } catch (error: any) {
      alert(`Action failed: ${error.message}`)
    }
  }

  const toggleArticleSelection = (articleId: string) => {
    setSelectedArticles(prev => 
      prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    )
  }

  const selectAllArticles = () => {
    setSelectedArticles(
      selectedArticles.length === articles.length 
        ? [] 
        : articles.map(a => a.id)
    )
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          📰 Article Management
        </h2>
        <button
          onClick={fetchArticles}
          className="btn-secondary"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Categories</option>
          <option value="Politics">Politics</option>
          <option value="Business">Business</option>
          <option value="Technology">Technology</option>
          <option value="Health">Health</option>
          <option value="Environment">Environment</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="publishedAt">Sort by Date</option>
          <option value="viewCount">Sort by Views</option>
          <option value="title">Sort by Title</option>
        </select>

        <input
          type="search"
          placeholder="Search articles..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Bulk Actions */}
      {selectedArticles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedArticles.length} articles selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('unpublish')}
                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
              >
                📝 Unpublish
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                🗑️ Delete
              </button>
              <button
                onClick={() => handleBulkAction('regenerate')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                🔄 Regenerate AI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Articles Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2">
                <input
                  type="checkbox"
                  checked={selectedArticles.length === articles.length && articles.length > 0}
                  onChange={selectAllArticles}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="text-left py-3 px-2 font-medium text-gray-900">Title</th>
              <th className="text-left py-3 px-2 font-medium text-gray-900">Category</th>
              <th className="text-left py-3 px-2 font-medium text-gray-900">Sources</th>
              <th className="text-left py-3 px-2 font-medium text-gray-900">Views</th>
              <th className="text-left py-3 px-2 font-medium text-gray-900">Published</th>
              <th className="text-left py-3 px-2 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2">
                  <input
                    type="checkbox"
                    checked={selectedArticles.includes(article.id)}
                    onChange={() => toggleArticleSelection(article.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="py-3 px-2">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      /{article.slug}
                    </p>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    {article.category}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <div className="text-xs space-y-1">
                    <div className="text-blue-600">
                      📰 {article.leftSource.outlet}
                    </div>
                    <div className="text-red-600">
                      📰 {article.rightSource.outlet}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 font-medium">
                  {article.viewCount.toLocaleString()}
                </td>
                <td className="py-3 px-2">
                  <div className="text-xs">
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      article.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {article.isPublished ? '✅ Published' : '❌ Draft'}
                    </div>
                    <div className="text-gray-500 mt-1">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`/article/${article.slug}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      👁️ View
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-xs">
                      ✏️ Edit
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-xs">
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">📰</div>
          <h3 className="text-gray-900 font-medium mb-2">No articles found</h3>
          <p className="text-gray-600 text-sm">
            Articles will appear here once the automation system processes news sources.
          </p>
        </div>
      )}

      {/* Pagination */}
      {articles.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {articles.length} articles
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-600">
            {articles.filter(a => a.isPublished).length}
          </div>
          <div className="text-sm text-blue-700">Published</div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-lg font-bold text-yellow-600">
            {articles.filter(a => !a.isPublished).length}
          </div>
          <div className="text-sm text-yellow-700">Drafts</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-lg font-bold text-green-600">
            {articles.reduce((sum, a) => sum + a.viewCount, 0).toLocaleString()}
          </div>
          <div className="text-sm text-green-700">Total Views</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-lg font-bold text-purple-600">
            {articles.length > 0 ? Math.round(articles.reduce((sum, a) => sum + a.viewCount, 0) / articles.length) : 0}
          </div>
          <div className="text-sm text-purple-700">Avg Views</div>
        </div>
      </div>
    </div>
  )
}export default function Page() { return <ArticleManager /> }
