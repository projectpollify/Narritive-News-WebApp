/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  env: {
    SITE_URL: process.env.SITE_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig
