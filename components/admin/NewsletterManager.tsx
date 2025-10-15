'use client'

import { useEffect, useState } from 'react'

export function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/admin/subscribers')
      const data = await response.json()
      if (data.success) {
        setSubscribers(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendNewsletter = async () => {
    if (!confirm('Send newsletter to all active subscribers?')) return

    try {
      const response = await fetch('/api/newsletter/send', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        alert('Newsletter sent successfully!')
      } else {
        alert(`Failed: ${data.error}`)
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Newsletter Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            {subscribers.length} active subscribers
          </p>
        </div>
        <button
          onClick={sendNewsletter}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Send Newsletter
        </button>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="text-gray-500">Loading subscribers...</div>
        ) : subscribers.length === 0 ? (
          <div className="text-gray-500">No subscribers yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Subscribed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscribers.map((sub: any) => (
                  <tr key={sub.id}>
                    <td className="px-4 py-3 text-sm">{sub.email}</td>
                    <td className="px-4 py-3 text-sm">{sub.name || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(sub.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          sub.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {sub.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
