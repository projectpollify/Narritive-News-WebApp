'use client'

import { useState } from 'react'

export function AITestTool() {
  const [leftArticle, setLeftArticle] = useState({
    title: 'Fed Cuts Interest Rates to Support Economic Growth',
    content: 'The Federal Reserve announced a quarter-point interest rate cut today, citing concerns about global economic headwinds and the need to support continued job growth. Fed Chair Jerome Powell emphasized that the decision was data-driven and aimed at sustaining the economic expansion.',
    outlet: 'CNN Business',
    summary: 'Fed cuts rates to support economy and job growth'
  })

  const [rightArticle, setRightArticle] = useState({
    title: 'Fed Rate Cut Risks Fueling Dangerous Inflation',
    content: 'In a controversial decision, the Federal Reserve slashed interest rates despite persistent inflation concerns, potentially undermining years of progress in controlling rising prices. Critics warn this premature easing could force more aggressive action later.',
    outlet: 'Fox Business',
    summary: 'Fed rate cut may reignite inflation concerns'
  })

  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const runAnalysis = async () => {
    setLoading(true)
    setError('')
    setAnalysis(null)

    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leftArticle,
          rightArticle,
          saveToDb: false
        })
      })

      const data = await response.json()

      if (data.success) {
        setAnalysis(data.data)
      } else {
        setError(data.error || 'Analysis failed')
      }
    } catch (err: any) {
      setError('Network error: ' + (err?.message || String(err)))
    } finally {
      setLoading(false)
    }
  }

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/ai-analysis/health')
      const data = await response.json()
      alert(`AI Service Status: ${data.data.status}\n${data.data.message}`)
    } catch (err: any) {
      alert('Health check failed: ' + (err?.message || String(err)))
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">AI Analysis Test Tool</h2>
        <p className="text-gray-600">
          Test the AI analysis system with custom article pairs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Left Article */}
        <div className="perspective-left p-4 rounded-lg">
          <h3 className="font-semibold mb-3 text-blue-900">Left-Leaning Article</h3>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Outlet</label>
            <input
              type="text"
              value={leftArticle.outlet}
              onChange={(e) => setLeftArticle({...leftArticle, outlet: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={leftArticle.title}
              onChange={(e) => setLeftArticle({...leftArticle, title: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              value={leftArticle.content}
              onChange={(e) => setLeftArticle({...leftArticle, content: e.target.value})}
              rows={4}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Summary</label>
            <input
              type="text"
              value={leftArticle.summary}
              onChange={(e) => setLeftArticle({...leftArticle, summary: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right Article */}
        <div className="perspective-right p-4 rounded-lg">
          <h3 className="font-semibold mb-3 text-red-900">Right-Leaning Article</h3>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Outlet</label>
            <input
              type="text"
              value={rightArticle.outlet}
              onChange={(e) => setRightArticle({...rightArticle, outlet: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={rightArticle.title}
              onChange={(e) => setRightArticle({...rightArticle, title: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              value={rightArticle.content}
              onChange={(e) => setRightArticle({...rightArticle, content: e.target.value})}
              rows={4}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Summary</label>
            <input
              type="text"
              value={rightArticle.summary}
              onChange={(e) => setRightArticle({...rightArticle, summary: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing...' : 'Generate AI Analysis'}
        </button>

        <button
          onClick={checkHealth}
          className="btn-secondary"
        >
          Check AI Health
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="ai-analysis p-6 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Analysis Results
          </h3>

          <div className="mb-6">
            <h4 className="font-medium mb-2">Main Analysis</h4>
            <div className="prose max-w-none">
              {analysis.analysis.split('\n').map((paragraph: string, index: number) => (
                <p key={index} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium mb-3">Key Differences</h4>
              <ul className="list-disc list-inside space-y-2">
                {analysis.keyDifferences.map((diff: string, index: number) => (
                  <li key={index} className="text-sm">{diff}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-3">Possible Motives</h4>
              <ul className="list-disc list-inside space-y-2">
                {analysis.possibleMotives.map((motive: string, index: number) => (
                  <li key={index} className="text-sm">{motive}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-between text-sm text-gray-600 pt-4 border-t">
            <span>Confidence Score: {(analysis.confidenceScore * 100).toFixed(1)}%</span>
            <span>Reading Time: {analysis.readingTime} min</span>
          </div>
        </div>
      )}
    </div>
  )
}