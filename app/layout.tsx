import type { Metadata } from 'next'
import Link from 'next/link'
import { Inter, Playfair_Display, Source_Sans_3 } from 'next/font/google'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const sourceSans = Source_Sans_3({ subsets: ['latin'], variable: '--font-source-sans' })

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
    <html lang="en" className={`scroll-smooth ${playfair.variable} ${sourceSans.variable} ${inter.variable}`}>
      <head>
        {/* Google AdSense - Enable when ready */}
        {/* <AdSenseScript /> */}
      </head>
      <body className="antialiased bg-paper text-ink font-sans">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <Link href="/" className="flex items-center group cursor-pointer">
                <div className="w-10 h-10 bg-navy-900 text-white flex items-center justify-center rounded-sm mr-3 shadow-md group-hover:bg-navy-800 transition-colors">
                  <span className="font-serif font-bold text-xl">N</span>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-serif font-bold text-navy-900 leading-none tracking-tight group-hover:text-navy-700 transition-colors">
                    Narrative News
                  </h1>
                  <span className="text-xs text-gray-500 font-medium tracking-widest uppercase mt-1">
                    Two Perspectives, One Truth
                  </span>
                </div>
              </Link>

              {/* Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-gray-600 hover:text-navy-900 font-medium transition-colors">Home</Link>


                <a href="#" className="text-gray-600 hover:text-navy-900 font-medium transition-colors">Manifesto</a>
                <a href="#" className="text-gray-600 hover:text-navy-900 font-medium transition-colors">Technology</a>
                <Link href="/signup" className="px-5 py-2.5 bg-navy-900 text-white font-bold rounded-sm hover:bg-navy-800 transition-all shadow-sm hover:shadow-md text-sm tracking-wide">
                  Join
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button className="text-gray-700 hover:text-navy-900 p-2">
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

        <footer className="bg-navy-900 text-white border-t-4 border-gold-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid md:grid-cols-4 gap-12">
              <div className="md:col-span-2">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-white text-navy-900 flex items-center justify-center rounded-sm mr-3">
                    <span className="font-serif font-bold text-lg">N</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold">Narrative News</h3>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
                  Unbiased news analysis showing multiple perspectives on the same story.
                  Our AI helps you understand how different outlets frame the news, empowering you to form your own opinion.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-gray-400 hover:bg-gold-500 hover:text-navy-900 transition-all duration-300">
                    <span className="sr-only">Twitter</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-gray-400 hover:bg-gold-500 hover:text-navy-900 transition-all duration-300">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                  </a>
                </div>
              </div>

              <div>
                <h4 className="font-serif font-bold text-lg mb-6 text-gold-500">Navigation</h4>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="/" className="hover:text-white transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-gold-500 rounded-full mr-2 opacity-0 hover:opacity-100 transition-opacity"></span>Latest Stories</a></li>
                  <li><a href="/politics" className="hover:text-white transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-gold-500 rounded-full mr-2 opacity-0 hover:opacity-100 transition-opacity"></span>Politics</a></li>
                  <li><a href="/business" className="hover:text-white transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-gold-500 rounded-full mr-2 opacity-0 hover:opacity-100 transition-opacity"></span>Business</a></li>
                  <li><a href="/archives" className="hover:text-white transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-gold-500 rounded-full mr-2 opacity-0 hover:opacity-100 transition-opacity"></span>Archives</a></li>
                  <li><Link href="/admin/sources" className="hover:text-white transition-colors flex items-center"><span className="w-1.5 h-1.5 bg-gold-500 rounded-full mr-2 opacity-0 hover:opacity-100 transition-opacity"></span>Source Control</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-serif font-bold text-lg mb-6 text-gold-500">Subscribe</h4>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  Get daily unbiased news analysis in your inbox. No spam, just truth.
                </p>
                <div className="flex flex-col space-y-3">
                  <input type="email" placeholder="Enter your email" className="bg-navy-800 border border-navy-700 text-white px-4 py-2 rounded-sm focus:outline-none focus:border-gold-500 transition-colors" />
                  <button className="bg-gold-500 text-navy-900 px-4 py-2 rounded-sm hover:bg-white transition-colors font-bold uppercase tracking-wide text-sm">
                    Subscribe Now
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-navy-800 mt-12 pt-8 text-center text-gray-500 text-sm">
              <p>&copy; {new Date().getFullYear()} Narrative News. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body >
    </html >
  )
}