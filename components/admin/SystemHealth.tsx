'use client'

interface SystemHealthProps {
  stats: any
}

export function SystemHealth({ stats }: SystemHealthProps) {
  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">System Health</h2>
        <div className="text-gray-500">Loading system stats...</div>
      </div>
    )
  }

  const healthMetrics = [
    {
      label: 'Total Articles',
      value: stats.totalArticles || 0,
      icon: '📰',
      color: 'text-blue-600',
    },
    {
      label: 'Active Subscribers',
      value: stats.totalSubscribers || 0,
      icon: '📧',
      color: 'text-green-600',
    },
    {
      label: 'RSS Feeds',
      value: stats.totalRSSFeeds || 0,
      icon: '📡',
      color: 'text-purple-600',
    },
    {
      label: 'Total Views',
      value: stats.totalViews || 0,
      icon: '👁️',
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">System Health</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-gray-200">
        {healthMetrics.map((metric, index) => (
          <div key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{metric.label}</p>
                <p className={`text-2xl font-bold ${metric.color} mt-2`}>
                  {metric.value.toLocaleString()}
                </p>
              </div>
              <div className="text-3xl">{metric.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
