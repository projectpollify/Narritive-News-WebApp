#!/bin/bash

# Quick Setup Script for Narrative News
# Choose your database option and get running fast!

echo "🚀 Narrative News Quick Setup"
echo "=============================="
echo ""
echo "Choose your database option:"
echo "1) SQLite (Easiest - no setup needed)"
echo "2) Supabase (Free cloud PostgreSQL)"
echo "3) Local PostgreSQL (if already installed)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo "Setting up SQLite..."
    # Use SQLite schema
    cp prisma/schema.sqlite.prisma prisma/schema.prisma
    # Update .env.local
    sed -i '' 's|DATABASE_URL=.*|DATABASE_URL="file:./dev.db"|' .env.local
    echo "✅ SQLite configured!"
    ;;
  2)
    echo ""
    echo "📌 Supabase Setup Instructions:"
    echo "1. Go to https://supabase.com and sign up (free)"
    echo "2. Create a new project"
    echo "3. Go to Settings > Database"
    echo "4. Copy the connection string"
    echo ""
    read -p "Paste your Supabase connection string: " db_url
    # Update .env.local
    sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$db_url\"|" .env.local
    echo "✅ Supabase configured!"
    ;;
  3)
    echo "Using local PostgreSQL..."
    read -p "Enter PostgreSQL password (default: postgres): " pg_pass
    pg_pass=${pg_pass:-postgres}
    # Update .env.local
    sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"postgresql://postgres:$pg_pass@localhost:5432/narrative_news\"|" .env.local
    echo "✅ Local PostgreSQL configured!"
    ;;
  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac

echo ""
echo "📝 OpenAI API Key Setup"
echo "Get your key from: https://platform.openai.com/api-keys"
read -p "Enter your OpenAI API key (or press Enter to skip): " openai_key

if [ ! -z "$openai_key" ]; then
  sed -i '' "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=\"$openai_key\"|" .env.local
  echo "✅ OpenAI API key configured!"
else
  echo "⚠️  Skipped - remember to add it later!"
fi

echo ""
echo "🔧 Setting up database..."
npx prisma generate
npx prisma db push --skip-seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:3000"
echo ""
echo "Optional:"
echo "- Seed database: npx prisma db seed"
echo "- View database: npx prisma studio"