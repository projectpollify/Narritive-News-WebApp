'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function ArticleManager() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles')
      const data = await response.json()
      if (data.success) {
        setArticles(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePublished = async (articleId: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished }),
      })

      if (response.ok) {
        fetchArticles()
      }
    } catch (error) {
      console.error('Failed to update article:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Article Management</h2>
        <p className="text-sm text-gray-600 mt-1">{articles.length} total articles</p>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="text-gray-500">Loading articles...</div>
        ) : articles.length === 0 ? (
          <div className="text-gray-500">No articles yet</div>
        ) : (
          <div className="space-y-4">
            {articles.map((article: any) => (
              <div
                key={article.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <Link
                    href={`/article/${article.slug}`}
                    className="font-medium text-gray-900 hover:text-blue-600"
                  >
                    {article.title}
                  </Link>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                    <span>{article.category}</span>
                    <span>•</span>
                    <span>{article.viewCount} views</span>
                    <span>•</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      article.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {article.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <button
                    onClick={() => togglePublished(article.id, article.isPublished)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {article.isPublished ? 'Unpublish' : 'Publish'}
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
