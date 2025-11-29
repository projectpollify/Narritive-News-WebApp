'use client'

import { useState } from 'react'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Thanks! You\'ll receive our daily analysis in your inbox.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }

    // Reset status after 5 seconds
    setTimeout(() => {
      setStatus('idle')
      setMessage('')
    }, 5000)
  }

  return (
    <section className="bg-navy-900 text-white rounded-sm p-12 mb-16 relative overflow-hidden shadow-card border-t-4 border-gold-500">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-serif font-bold mb-4 text-white">
          Get Daily Perspective Analysis
        </h2>
        <p className="text-gray-300 mb-8 text-lg font-light leading-relaxed">
          Join 5,000+ readers who receive our AI-powered news analysis in their inbox every morning.
          See how different outlets cover the day's biggest stories.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <div className="flex-1">
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-sm text-navy-900 placeholder-gray-500 focus:ring-2 focus:ring-gold-500 focus:outline-none border-none"
              required
              disabled={status === 'loading'}
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-gold-500 text-navy-900 px-8 py-3 rounded-sm font-bold uppercase tracking-wide hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-md"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-sm text-sm font-medium ${status === 'success'
              ? 'bg-green-900/50 text-green-200 border border-green-800'
              : status === 'error'
                ? 'bg-red-900/50 text-red-200 border border-red-800'
                : ''
            }`}>
            {message}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center space-x-8 text-xs text-gray-400 uppercase tracking-widest">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Free forever
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            No spam
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Unsubscribe anytime
          </div>
        </div>
      </div>
    </section>
  )
}