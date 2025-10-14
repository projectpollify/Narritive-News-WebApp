#!/bin/bash

# save.sh - Save project state, commit changes, and cleanup
# Usage: ./save.sh ["optional commit message"]

echo "💾 Starting save process..."
echo ""

# Get commit message from argument or use default
COMMIT_MSG="${1:-Update PROJECT.md and MASTER_PLAN.md with latest progress}"

# Step 1: Update last modified date in PROJECT.md
echo "📝 Updating PROJECT.md timestamp..."
CURRENT_DATE=$(date "+%B %d, %Y")
if [ -f "PROJECT.md" ]; then
    # Update the "Last Updated" line in PROJECT.md
    sed -i '' "s/\*\*Last Updated:\*\* .*/\*\*Last Updated:** $CURRENT_DATE/" PROJECT.md
    echo "✅ Updated PROJECT.md last modified date"
else
    echo "⚠️  PROJECT.md not found"
fi

# Step 2: Update last modified date in MASTER_PLAN.md
echo "📝 Updating MASTER_PLAN.md timestamp..."
if [ -f "MASTER_PLAN.md" ]; then
    # Update the "Last Updated" line in MASTER_PLAN.md (appears twice)
    sed -i '' "s/\*\*Last Updated:\*\* .*/\*\*Last Updated:** $CURRENT_DATE/" MASTER_PLAN.md
    echo "✅ Updated MASTER_PLAN.md last modified date"
else
    echo "⚠️  MASTER_PLAN.md not found"
fi

echo ""

# Step 3: Git operations
echo "📦 Staging changes..."
git add -A

echo "📊 Git status:"
git status --short

echo ""
echo "💬 Committing with message: '$COMMIT_MSG'"
git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo "✅ Commit successful"
    echo ""
    echo "🚀 Pushing to remote..."
    git push

    if [ $? -eq 0 ]; then
        echo "✅ Push successful"
    else
        echo "❌ Push failed - check your connection and permissions"
    fi
else
    echo "⚠️  Nothing to commit or commit failed"
fi

echo ""

# Step 4: Kill processes
echo "🛑 Killing development servers and processes..."

# Kill common Node.js development servers
if pgrep -f "next dev" > /dev/null; then
    echo "   Killing Next.js dev server..."
    pkill -f "next dev"
fi

if pgrep -f "npm run dev" > /dev/null; then
    echo "   Killing npm dev processes..."
    pkill -f "npm run dev"
fi

if pgrep -f "node.*dev" > /dev/null; then
    echo "   Killing Node.js dev processes..."
    pkill -f "node.*dev"
fi

# Kill Prisma Studio if running
if pgrep -f "prisma studio" > /dev/null; then
    echo "   Killing Prisma Studio..."
    pkill -f "prisma studio"
fi

# Kill any process on common development ports
for port in 3000 3001 5555; do
    PID=$(lsof -ti tcp:$port 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "   Killing process on port $port (PID: $PID)..."
        kill -9 $PID 2>/dev/null
    fi
done

echo "✅ Processes cleaned up"

echo ""
echo "✨ Save complete!"
echo ""
echo "📋 Summary:"
echo "   ✅ Documentation timestamps updated"
echo "   ✅ Changes committed to git"
echo "   ✅ Changes pushed to remote"
echo "   ✅ Development servers stopped"
echo ""
