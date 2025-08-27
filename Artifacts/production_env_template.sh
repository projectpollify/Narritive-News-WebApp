# Production Environment Variables for Narrative News
# Copy this file to .env.local and fill in your actual values

# ========================================
# CORE CONFIGURATION
# ========================================
NODE_ENV=production
SITE_URL=https://narrativenews.org
SITE_NAME="Narrative News"
NEXTAUTH_URL=https://narrativenews.org
NEXTAUTH_SECRET=your-super-secret-jwt-key-here-min-32-chars

# ========================================
# DATABASE CONFIGURATION
# ========================================
# PostgreSQL connection string
# For Supabase: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
# For Railway: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway
# For Neon: postgresql://[USERNAME]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# ========================================
# AI SERVICE CONFIGURATION
# ========================================
OPENAI_API_KEY=sk-your-openai-api-key-here

# ========================================
# EMAIL SERVICE CONFIGURATION
# ========================================
# SMTP Settings (Gmail example)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-specific-password
EMAIL_FROM="Narrative News <noreply@narrativenews.org>"

# Alternative: SendGrid
# EMAIL_SERVER_HOST=smtp.sendgrid.net
# EMAIL_SERVER_PORT=587
# EMAIL_SERVER_USER=apikey
# EMAIL_SERVER_PASSWORD=your-sendgrid-api-key

# Alternative: Mailgun
# EMAIL_SERVER_HOST=smtp.mailgun.org
# EMAIL_SERVER_PORT=587
# EMAIL_SERVER_USER=your-mailgun-smtp-user
# EMAIL_SERVER_PASSWORD=your-mailgun-smtp-password

# ========================================
# GOOGLE ADSENSE CONFIGURATION
# ========================================
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-your-adsense-publisher-id
NEXT_PUBLIC_ADSENSE_BANNER_SLOT=your-banner-ad-slot-id
NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=your-sidebar-ad-slot-id
NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT=your-in-article-ad-slot-id
NEXT_PUBLIC_ADSENSE_FOOTER_SLOT=your-footer-ad-slot-id

# ========================================
# ANALYTICS CONFIGURATION
# ========================================
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX

# ========================================
# AUTOMATION CONFIGURATION
# ========================================
ENABLE_AUTOMATION=true
AUTOMATION_INTERVAL_HOURS=6
MIN_TIME_BETWEEN_EMAILS=3600000

# ========================================
# RATE LIMITING CONFIGURATION
# ========================================
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# ========================================
# SECURITY CONFIGURATION
# ========================================
# Generate with: openssl rand -base64 32
ENCRYPTION_KEY=your-32-char-encryption-key-here

# ========================================
# MONITORING & LOGGING
# ========================================
# Optional: Sentry for error tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Optional: LogTail or other logging service
LOGTAIL_TOKEN=your-logtail-token

# ========================================
# THIRD-PARTY INTEGRATIONS (Optional)
# ========================================
# News APIs for enhanced scraping
NEWS_API_KEY=your-newsapi-key
GUARDIAN_API_KEY=your-guardian-api-key

# Social media integration
TWITTER_API_KEY=your-twitter-api-key
FACEBOOK_APP_ID=your-facebook-app-id

# ========================================
# DEPLOYMENT PLATFORM VARIABLES
# ========================================
# These are usually set automatically by your hosting platform

# Vercel
# VERCEL=1
# VERCEL_URL=auto-generated
# VERCEL_GIT_COMMIT_SHA=auto-generated

# Railway
# RAILWAY_ENVIRONMENT=production
# RAILWAY_GIT_COMMIT_SHA=auto-generated

# Heroku
# HEROKU_APP_NAME=your-app-name
# HEROKU_SLUG_COMMIT=auto-generated

# ========================================
# FEATURE FLAGS
# ========================================
ENABLE_ADS=true
ENABLE_NEWSLETTER=true
ENABLE_ANALYTICS=true
ENABLE_ADMIN_DASHBOARD=true
ENABLE_PREMIUM_CONTENT=false

# ========================================
# PERFORMANCE CONFIGURATION
# ========================================
# Caching
REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=300

# Database connection pooling
DATABASE_POOL_SIZE=10
DATABASE_MAX_CONNECTIONS=20

# ========================================
# BACKUP AND MAINTENANCE
# ========================================
# Database backup settings
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30

# Maintenance mode
MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE="We're performing scheduled maintenance. We'll be back shortly!"