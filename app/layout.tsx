import type { Metadata } from 'next'
import Link from 'next/link'
import { Inter, Playfair_Display, Source_Sans_3 } from 'next/font/google'
import '../styles/globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AudioProvider } from '@/lib/context/AudioContext'
import { GlobalAudioPlayer } from '@/components/features/GlobalAudioPlayer'

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
    <html lang="en" className={`scroll-smooth ${playfair.variable} ${sourceSans.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Google AdSense - Enable when ready */}
        {/* <AdSenseScript /> */}
      </head>
      <body className="antialiased bg-paper text-ink font-sans flex flex-col min-h-screen">
        <AudioProvider>
          <GlobalAudioPlayer />
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AudioProvider>
      </body>
    </html>
  )
}