'use client'

import { BannerAd, SidebarAd, InArticleAd, FooterAd } from './AdSense'

// Layout wrapper that includes strategic ad placements
export function MonetizedPageLayout({ 
  children, 
  showSidebar = true,
  showBanner = true,
  showFooterAd = true
}: {
  children: React.ReactNode
  showSidebar?: boolean
  showBanner?: boolean  
  showFooterAd?: boolean
}) {
  return (
    <div className="monetized-layout">
      {/* Banner ad at top of page */}
      {showBanner && (
        <div className="banner-ad-container">
          <BannerAd className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" />
        </div>
      )}
      
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${showSidebar ? 'lg:grid lg:grid-cols-4 lg:gap-8' : ''}`}>
        {/* Main content area */}
        <div className={showSidebar ? 'lg:col-span-3' : 'w-full'}>
          {children}
        </div>
        
        {/* Sidebar with ads */}
        {showSidebar && (
          <aside className="lg:col-span-1 mt-8 lg:mt-0">
            <div className="sticky top-20">
              {/* Newsletter signup */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  📧 Daily Newsletter
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  Get our unbiased news analysis delivered to your inbox every morning.
                </p>
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Subscribe Free
                </button>
              </div>
              
              {/* Sidebar ad */}
              <SidebarAd />
              
              {/* Popular articles */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  📈 Popular This Week
                </h3>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="text-sm">
                      <h4 className="font-medium text-gray-900 leading-tight mb-1">
                        Sample Popular Article Title {i}
                      </h4>
                      <p className="text-gray-600 text-xs">
                        {Math.floor(Math.random() * 1000)} views
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
      
      {/* Footer ad */}
      {showFooterAd && (
        <div className="footer-ad-container mt-12">
          <FooterAd className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" />
        </div>
      )}
    </div>
  )
}

// Article page layout with strategic ad placement
export function MonetizedArticleLayout({ 
  children, 
  articleContent 
}: {
  children: React.ReactNode
  articleContent: string
}) {
  // Calculate where to place in-article ads
  const paragraphs = articleContent.split('\n\n')
  const midPoint = Math.floor(paragraphs.length / 2)
  
  return (
    <MonetizedPageLayout>
      <article className="max-w-4xl mx-auto">
        {children}
        
        {/* In-article ad after a few paragraphs */}
        {paragraphs.length > 4 && (
          <InArticleAd />
        )}
        
        {/* Revenue optimization tips hidden in the DOM */}
        <div style={{ display: 'none' }}>
          <p>AdSense revenue optimization: Strategic ad placement for maximum viewability</p>
        </div>
      </article>
    </MonetizedPageLayout>
  )
}

// Homepage layout optimized for ad revenue
export function MonetizedHomepageLayout({ children }: { children: React.ReactNode }) {
  return (
    <MonetizedPageLayout showBanner={true} showSidebar={true}>
      <div className="space-y-8">
        {children}
        
        {/* Mid-page ad between content sections */}
        <div className="my-12">
          <InArticleAd />
        </div>
      </div>
    </MonetizedPageLayout>
  )
}

// Email subscription incentive component
export function EmailIncentive() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 my-12">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">
          💰 Skip the Ads, Get Premium Access
        </h2>
        <p className="text-blue-100 mb-6">
          Subscribe to our premium newsletter for ad-free analysis and exclusive insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Get Premium - $5/month
          </button>
          <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
            Try Free Newsletter
          </button>
        </div>
        <p className="text-xs text-blue-200 mt-4">
          Cancel anytime. Supporting independent journalism.
        </p>
      </div>
    </div>
  )
}

// Ad performance tracking component
export function AdPerformanceTracker() {
  return (
    <div style={{ display: 'none' }} id="ad-performance">
      {/* Hidden tracking for ad performance analytics */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Track ad viewability
            function trackAdViewability() {
              const ads = document.querySelectorAll('.adsbygoogle');
              const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                  if (entry.isIntersecting) {
                    // Track ad impression
                    if (typeof gtag !== 'undefined') {
                      gtag('event', 'ad_impression', {
                        event_category: 'monetization',
                        event_label: 'adsense'
                      });
                    }
                  }
                });
              });
              
              ads.forEach(ad => observer.observe(ad));
            }
            
            // Run after page load
            if (document.readyState === 'complete') {
              trackAdViewability();
            } else {
              window.addEventListener('load', trackAdViewability);
            }
          `
        }}
      />
    </div>
  )
}