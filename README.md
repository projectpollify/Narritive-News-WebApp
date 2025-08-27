<<<<<<< HEAD
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
=======
# Narritive-News-WebApp
>>>>>>> c7a97e9db685f4791f1db49ceb5438bb4182be15
