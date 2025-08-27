/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    serverComponentsExternalPackages: ['prisma', 'cheerio'],
  },

  // Image optimization
  images: {
    domains: [
      'localhost',
      'narrativenews.org',
      'images.unsplash.com', // For placeholder images
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // Content Security Policy (adjust for your AdSense and other third-party scripts)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://api.openai.com https://www.google-analytics.com",
              "frame-src 'self' https://www.google.com",
            ].join('; ')
          }
        ],
      },
    ]
  },

  // Redirects for SEO
  async redirects() {
    return [
      // Redirect old URLs if migrating from another platform
      {
        source: '/old-path/:slug*',
        destination: '/article/:slug*',
        permanent: true,
      },
    ]
  },

  // API route configurations
  async rewrites() {
    return [
      // Proxy for analytics to avoid ad blockers
      {
        source: '/analytics/:path*',
        destination: 'https://www.google-analytics.com/:path*',
      },
    ]
  },

  // Webpack configuration for production optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            enforce: true,
          },
        },
      }
    }

    // Handle node modules that need special treatment
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    return config
  },

  // Output configuration for static hosting if needed
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,

  // Environment variables exposed to the client
  env: {
    SITE_URL: process.env.SITE_URL,
    BUILD_TIME: new Date().toISOString(),
    VERSION: process.env.npm_package_version || '1.0.0',
  },

  // Compression
  compress: true,

  // Power by header removal for security
  poweredByHeader: false,

  // Generate sitemap and robots.txt in production
  generateBuildId: async () => {
    // Use git commit hash if available, fallback to timestamp
    return process.env.VERCEL_GIT_COMMIT_SHA || 
           process.env.RAILWAY_GIT_COMMIT_SHA || 
           `build-${Date.now()}`
  },
}

module.exports = nextConfig