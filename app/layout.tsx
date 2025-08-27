import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// import { AdSenseScript } from '@/components/features/adsense'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Narrative News - Unbiased Perspectives',
  description: 'See how the same news story is covered from different perspectives. AI-powered analysis reveals the differences in media narratives.',
  keywords: 'news, unbiased, media bias, different perspectives, news analysis',
  authors: [{ name: 'Narrative News' }],
  openGraph: {
    title: 'Narrative News - Unbiased Perspectives',
    description: 'AI-powered analysis of news stories from multiple perspectives',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Narrative News - Unbiased Perspectives',
    description: 'AI-powered analysis of news stories from multiple perspectives',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google AdSense - Enable when ready */}
        {/* <AdSenseScript /> */}
      </head>
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">
                  Narrative News
                </h1>
                <span className="ml-2 text-sm text-gray-500 hidden sm:inline">
                  Two Perspectives, One Truth
                </span>
              </div>
              
              {/* Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                  Latest
                </a>
                <a href="/politics" className="text-gray-700 hover:text-blue-600 font-medium">
                  Politics
                </a>
                <a href="/business" className="text-gray-700 hover:text-blue-600 font-medium">
                  Business
                </a>
                <a href="/about" className="text-gray-700 hover:text-blue-600 font-medium">
                  About
                </a>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Subscribe
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button className="text-gray-700 hover:text-blue-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main className="min-h-screen">
          {children}
        </main>

        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold mb-4">Narrative News</h3>
                <p className="text-gray-300 mb-4">
                  Unbiased news analysis showing multiple perspectives on the same story. 
                  Our AI helps you understand how different outlets frame the news.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-300 hover:text-white">Twitter</a>
                  <a href="#" className="text-gray-300 hover:text-white">Facebook</a>
                  <a href="#" className="text-gray-300 hover:text-white">LinkedIn</a>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Navigation</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="/" className="hover:text-white">Latest Stories</a></li>
                  <li><a href="/politics" className="hover:text-white">Politics</a></li>
                  <li><a href="/business" className="hover:text-white">Business</a></li>
                  <li><a href="/about" className="hover:text-white">About Us</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Subscribe</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Get daily unbiased news analysis in your inbox
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full">
                  Subscribe Now
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
              <p>&copy; 2024 Narrative News. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}