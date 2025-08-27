#!/bin/bash

# Narrative News Project Assembly Script
# This script creates a proper Next.js project structure from the artifacts

set -e  # Exit on error

echo "🚀 Starting Narrative News Project Assembly..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "Artifacts" ]; then
    echo -e "${RED}❌ Error: Artifacts directory not found!${NC}"
    echo "Please run this script from the NNwebapp directory"
    exit 1
fi

echo -e "${BLUE}📁 Creating Next.js project structure...${NC}"

# Create main directories
mkdir -p app/{api,admin,article,components}
mkdir -p app/api/{articles,ai,email,newsletter,search,analytics,automation,admin,health}
mkdir -p app/admin/{dashboard,articles,subscribers,rss,analytics,automation}
mkdir -p components/{ui,layout,features}
mkdir -p lib/{db,services,utils}
mkdir -p prisma
mkdir -p public
mkdir -p scripts
mkdir -p styles
mkdir -p types
mkdir -p config

echo -e "${GREEN}✓ Directory structure created${NC}"

# Copy and organize API routes
echo -e "${BLUE}🔧 Organizing API routes...${NC}"

# Articles API
if [ -f "Artifacts/articles_api.ts" ]; then
    cp Artifacts/articles_api.ts app/api/articles/route.ts
fi

if [ -f "Artifacts/article_detail_api.ts" ]; then
    mkdir -p "app/api/articles/[slug]"
    cp Artifacts/article_detail_api.ts "app/api/articles/[slug]/route.ts"
fi

# AI API
if [ -f "Artifacts/ai_api_routes.ts" ]; then
    cp Artifacts/ai_api_routes.ts app/api/ai/route.ts
fi

# Email API
if [ -f "Artifacts/email_api_routes.ts" ]; then
    cp Artifacts/email_api_routes.ts app/api/email/route.ts
fi

# Newsletter API
if [ -f "Artifacts/newsletter_api.ts" ]; then
    cp Artifacts/newsletter_api.ts app/api/newsletter/route.ts
fi

# Search API
if [ -f "Artifacts/search_api.ts" ]; then
    cp Artifacts/search_api.ts app/api/search/route.ts
fi

# Analytics API
if [ -f "Artifacts/analytics_api.ts" ]; then
    cp Artifacts/analytics_api.ts app/api/analytics/route.ts
fi

# Automation API
if [ -f "Artifacts/automation_api.ts" ]; then
    cp Artifacts/automation_api.ts app/api/automation/route.ts
fi

if [ -f "Artifacts/test_scraper_api.ts" ]; then
    mkdir -p app/api/automation/test
    cp Artifacts/test_scraper_api.ts app/api/automation/test/route.ts
fi

# Admin APIs
if [ -f "Artifacts/admin_api_routes.ts" ]; then
    cp Artifacts/admin_api_routes.ts app/api/admin/route.ts
fi

if [ -f "Artifacts/admin_subscribers_api.ts" ]; then
    mkdir -p app/api/admin/subscribers
    cp Artifacts/admin_subscribers_api.ts app/api/admin/subscribers/route.ts
fi

echo -e "${GREEN}✓ API routes organized${NC}"

# Copy library files
echo -e "${BLUE}📚 Setting up library files...${NC}"

# Database files
if [ -f "Artifacts/database_lib.ts" ]; then
    cp Artifacts/database_lib.ts lib/db/index.ts
fi

if [ -f "Artifacts/database_seeders.ts" ]; then
    cp Artifacts/database_seeders.ts prisma/seed.ts
fi

# Services
if [ -f "Artifacts/ai_service.ts" ]; then
    cp Artifacts/ai_service.ts lib/services/ai.ts
fi

if [ -f "Artifacts/email_service.ts" ]; then
    cp Artifacts/email_service.ts lib/services/email.ts
fi

if [ -f "Artifacts/news_scraper.ts" ]; then
    cp Artifacts/news_scraper.ts lib/services/scraper.ts
fi

# Utils
if [ -f "Artifacts/api_middleware.ts" ]; then
    cp Artifacts/api_middleware.ts lib/utils/api-middleware.ts
fi

if [ -f "Artifacts/rate_limit.ts" ]; then
    cp Artifacts/rate_limit.ts lib/utils/rate-limit.ts
fi

echo -e "${GREEN}✓ Library files organized${NC}"

# Copy components
echo -e "${BLUE}🎨 Organizing components...${NC}"

# Page components
if [ -f "Artifacts/homepage.ts" ]; then
    cp Artifacts/homepage.ts app/page.tsx
fi

if [ -f "Artifacts/root_layout.ts" ]; then
    cp Artifacts/root_layout.ts app/layout.tsx
fi

# Admin pages
if [ -f "Artifacts/admin_layout.ts" ]; then
    cp Artifacts/admin_layout.ts app/admin/layout.tsx
fi

if [ -f "Artifacts/admin_dashboard.ts" ]; then
    cp Artifacts/admin_dashboard.ts app/admin/dashboard/page.tsx
fi

# Feature components
if [ -f "Artifacts/article_card.ts" ]; then
    cp Artifacts/article_card.ts components/features/article-card.tsx
fi

if [ -f "Artifacts/newsletter_component.ts" ]; then
    cp Artifacts/newsletter_component.ts components/features/newsletter.tsx
fi

if [ -f "Artifacts/ai_test_component.ts" ]; then
    cp Artifacts/ai_test_component.ts components/features/ai-test.tsx
fi

if [ -f "Artifacts/adsense_integration.ts" ]; then
    cp Artifacts/adsense_integration.ts components/features/adsense.tsx
fi

if [ -f "Artifacts/monetization_components.ts" ]; then
    cp Artifacts/monetization_components.ts components/features/monetization.tsx
fi

# Admin components
if [ -f "Artifacts/article_manager_component.ts" ]; then
    cp Artifacts/article_manager_component.ts app/admin/articles/page.tsx
fi

if [ -f "Artifacts/newsletter_manager_component.ts" ]; then
    cp Artifacts/newsletter_manager_component.ts app/admin/subscribers/page.tsx
fi

if [ -f "Artifacts/rss_manager_component.ts" ]; then
    cp Artifacts/rss_manager_component.ts app/admin/rss/page.tsx
fi

if [ -f "Artifacts/analytics_dashboard_component.ts" ]; then
    cp Artifacts/analytics_dashboard_component.ts app/admin/analytics/page.tsx
fi

if [ -f "Artifacts/automation_control_component.ts" ]; then
    cp Artifacts/automation_control_component.ts app/admin/automation/page.tsx
fi

if [ -f "Artifacts/system_health_component.ts" ]; then
    cp Artifacts/system_health_component.ts components/features/system-health.tsx
fi

echo -e "${GREEN}✓ Components organized${NC}"

# Setup Prisma
echo -e "${BLUE}🗄️  Setting up Prisma...${NC}"

if [ -f "Artifacts/prisma_schema.txt" ]; then
    cp Artifacts/prisma_schema.txt prisma/schema.prisma
fi

# Setup configuration files
echo -e "${BLUE}⚙️  Creating configuration files...${NC}"

# Copy automation cron
if [ -f "Artifacts/automation_cron.ts" ]; then
    cp Artifacts/automation_cron.ts lib/services/cron.ts
fi

# Types
if [ -f "Artifacts/article_types.ts" ]; then
    cp Artifacts/article_types.ts types/article.ts
fi

# Scripts
if [ -f "Artifacts/health_check_script.js" ]; then
    cp Artifacts/health_check_script.js scripts/health-check.js
fi

if [ -f "Artifacts/production_config.js" ]; then
    cp Artifacts/production_config.js config/production.js
fi

# Environment files
if [ -f "Artifacts/env_example.sh" ]; then
    # Convert shell script to .env format
    sed 's/^/# /' Artifacts/env_example.sh > .env.example
    cp .env.example .env.local
    echo -e "${YELLOW}⚠️  Created .env.local - Please update with your actual values${NC}"
fi

# Package.json - use the final version
if [ -f "Artifacts/package_json_final.json" ]; then
    cp Artifacts/package_json_final.json package.json
elif [ -f "Artifacts/package_json.json" ]; then
    cp Artifacts/package_json.json package.json
fi

# Global styles
if [ -f "Artifacts/global_styles.css" ]; then
    cp Artifacts/global_styles.css styles/globals.css
fi

echo -e "${GREEN}✓ Configuration files created${NC}"

# Create essential Next.js config files if they don't exist
echo -e "${BLUE}📝 Creating Next.js configuration...${NC}"

# Create next.config.js
cat > next.config.js << 'EOL'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    SITE_URL: process.env.SITE_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig
EOL

# Create tsconfig.json
cat > tsconfig.json << 'EOL'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOL

# Create tailwind.config.js
cat > tailwind.config.js << 'EOL'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'narrative-blue': '#1e40af',
        'narrative-red': '#dc2626',
      },
    },
  },
  plugins: [],
}
EOL

# Create postcss.config.js
cat > postcss.config.js << 'EOL'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOL

# Create middleware.ts for authentication
cat > middleware.ts << 'EOL'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protect admin routes
export function middleware(request: NextRequest) {
  // Check if it's an admin route
  if (request.nextUrl.pathname.startsWith('/admin') || 
      request.nextUrl.pathname.startsWith('/api/admin')) {
    
    // TODO: Implement proper authentication check here
    // For now, we'll just add a warning header
    const response = NextResponse.next()
    response.headers.set('X-Warning', 'Authentication not yet implemented')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}
EOL

# Create .gitignore
cat > .gitignore << 'EOL'
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# Typescript
*.tsbuildinfo
next-env.d.ts

# Database
*.db
*.db-journal
prisma/migrations/dev/
EOL

echo -e "${GREEN}✓ Next.js configuration created${NC}"

# Create README
echo -e "${BLUE}📖 Creating README...${NC}"

cat > README.md << 'EOL'
# Narrative News

AI-powered news analysis platform showing multiple perspectives on current events.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in your API keys and database URL

3. **Set up database:**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   - Main site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin

## Project Structure

- `/app` - Next.js 14 app directory
- `/components` - Reusable React components
- `/lib` - Core business logic and services
- `/prisma` - Database schema and migrations
- `/scripts` - Utility scripts
- `/types` - TypeScript type definitions

## Key Features

- Dual perspective news analysis
- AI-powered content comparison
- RSS feed automation
- Newsletter system
- Admin dashboard
- Analytics tracking

## Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key for content analysis
- `EMAIL_SERVER_*` - SMTP configuration for newsletters

## Deployment

This project is configured for easy deployment on Vercel:

```bash
vercel deploy
```

See `DEPLOYMENT.md` for detailed deployment instructions.
EOL

echo -e "${GREEN}✓ README created${NC}"

# Create a setup verification script
cat > verify-setup.sh << 'EOL'
#!/bin/bash

echo "🔍 Verifying Narrative News setup..."

# Check for required files
required_files=(
    "package.json"
    "next.config.js"
    "tsconfig.json"
    "tailwind.config.js"
    ".env.local"
    "prisma/schema.prisma"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ All required files present"
else
    echo "❌ Missing files:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
fi

# Check for node_modules
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "⚠️  Dependencies not installed - run: npm install"
fi

# Check for .env.local configuration
if [ -f ".env.local" ]; then
    if grep -q "your-" ".env.local"; then
        echo "⚠️  .env.local contains placeholder values - please update"
    else
        echo "✅ Environment variables configured"
    fi
fi

echo ""
echo "📋 Next steps:"
echo "1. npm install"
echo "2. Update .env.local with your actual values"
echo "3. npx prisma generate"
echo "4. npx prisma db push"
echo "5. npm run dev"
EOL

chmod +x verify-setup.sh

echo -e "${GREEN}✓ Setup verification script created${NC}"

# Final summary
echo ""
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Project assembly complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}⚠️  Important next steps:${NC}"
echo "1. Run: ${BLUE}npm install${NC}"
echo "2. Edit: ${BLUE}.env.local${NC} with your actual API keys"
echo "3. Set up database: ${BLUE}npx prisma generate && npx prisma db push${NC}"
echo "4. Run: ${BLUE}npm run dev${NC}"
echo ""
echo "Run ${BLUE}./verify-setup.sh${NC} to check your setup status"
echo ""
echo -e "${GREEN}Good luck with your deployment! 🚀${NC}"