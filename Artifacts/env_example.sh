# Database
DATABASE_URL="postgresql://username:password@localhost:5432/narrative_news?schema=public"

# AI Services
OPENAI_API_KEY="your-openai-api-key-here"

# Email Service (for newsletters)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@narrativenews.org"

# Next.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# News APIs (optional - for future enhanced scraping)
NEWS_API_KEY="your-newsapi-key"
GUARDIAN_API_KEY="your-guardian-api-key"

# Site Configuration
SITE_URL="http://localhost:3000"
SITE_NAME="Narrative News"

# Automation Configuration
ENABLE_AUTOMATION=true
AUTOMATION_INTERVAL_HOURS=6

# Analytics (optional)
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# Development vs Production
NODE_ENV=development