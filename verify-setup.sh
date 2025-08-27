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
