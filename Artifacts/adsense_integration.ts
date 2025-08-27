'use client'

import { useEffect } from 'react'
import Script from 'next/script'

// Google AdSense component for display ads
export function AdSenseAd({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = {}
}: {
  adSlot: string
  adFormat?: string
  fullWidthResponsive?: boolean
  style?: React.CSSProperties
}) {
  useEffect(() => {
    try {
      // Push ad to AdSense queue
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  // Don't show ads in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div 
        style={{
          background: '#f3f4f6',
          border: '2px dashed #d1d5db',
          padding: '2rem',
          textAlign: 'center',
          color: '#6b7280',
          ...style
        }}
      >
        <p>📢 Google AdSense Ad Placeholder</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Ad Slot: {adSlot}
        </p>
      </div>
    )
  }

  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) {
    return null
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive.toString()}
    />
  )
}

// Banner ad component (top of page)
export function BannerAd({ className = '' }: { className?: string }) {
  return (
    <div className={`mb-8 ${className}`}>
      <AdSenseAd
        adSlot="1234567890" // Replace with your actual ad slot
        adFormat="horizontal"
        style={{ minHeight: '90px' }}
      />
    </div>
  )
}

// Sidebar ad component
export function SidebarAd({ className = '' }: { className?: string }) {
  return (
    <div className={`mb-6 ${className}`}>
      <AdSenseAd
        adSlot="0987654321" // Replace with your actual ad slot
        adFormat="rectangle"
        style={{ minHeight: '250px', minWidth: '300px' }}
      />
    </div>
  )
}

// In-article ad component (between content)
export function InArticleAd({ className = '' }: { className?: string }) {
  return (
    <div className={`my-8 ${className}`}>
      <div className="text-center text-xs text-gray-500 mb-2">Advertisement</div>
      <AdSenseAd
        adSlot="5678901234" // Replace with your actual ad slot
        adFormat="fluid"
        style={{ minHeight: '200px' }}
      />
    </div>
  )
}

// Footer ad component
export function FooterAd({ className = '' }: { className?: string }) {
  return (
    <div className={`mt-8 ${className}`}>
      <AdSenseAd
        adSlot="4321098765" // Replace with your actual ad slot
        adFormat="horizontal"
        style={{ minHeight: '90px' }}
      />
    </div>
  )
}

// AdSense script loader component
export function AdSenseScript() {
  if (process.env.NODE_ENV === 'development') {
    return null
  }

  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) {
    console.warn('⚠️ NEXT_PUBLIC_ADSENSE_CLIENT_ID not set - ads will not display')
    return null
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}

// Auto ads component (Google handles placement)
export function AutoAds() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') return

    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({
          google_ad_client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
          enable_page_level_ads: true
        })
      }
    } catch (error) {
      console.error('Auto ads error:', error)
    }
  }, [])

  return null
}

// Ad blocker detection component
export function AdBlockerDetection() {
  useEffect(() => {
    const detectAdBlocker = () => {
      const adElement = document.createElement('div')
      adElement.innerHTML = '&nbsp;'
      adElement.className = 'adsbox'
      adElement.style.position = 'absolute'
      adElement.style.left = '-10000px'
      document.body.appendChild(adElement)

      setTimeout(() => {
        const isBlocked = adElement.offsetHeight === 0
        document.body.removeChild(adElement)
        
        if (isBlocked) {
          console.log('📢 Ad blocker detected')
          // You could show a message to users about supporting the site
          // showAdBlockerMessage()
        }
      }, 100)
    }

    detectAdBlocker()
  }, [])

  return null
}

// Revenue optimization component
export function AdRevenueTips() {
  return (
    <div style={{ display: 'none' }} id="ad-revenue-tips">
      {/* Hidden component with tips for optimizing ad revenue */}
      <div>
        <h3>AdSense Optimization Tips:</h3>
        <ul>
          <li>Place ads above the fold (visible without scrolling)</li>
          <li>Use responsive ad units for mobile optimization</li>
          <li>Test different ad placements and formats</li>
          <li>Monitor Core Web Vitals impact</li>
          <li>Ensure ads don't interfere with user experience</li>
          <li>Use Auto ads for automatic optimization</li>
        </ul>
      </div>
    </div>
  )
}