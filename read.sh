#!/bin/bash

# read.sh - Review project documentation files
# Usage: ./read.sh

echo "📚 Reading project documentation files..."
echo ""

# Define the files to read
FILES=(
    "README.md"
    "PROJECT.md"
    "MASTER_PLAN.md"
)

# Read each file
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Found: $file"
    else
        echo "❌ Missing: $file"
    fi
done

echo ""
echo "📝 Claude, please read and review the following files:"
echo "   - README.md (Project overview & quick start)"
echo "   - PROJECT.md (Detailed development guide)"
echo "   - MASTER_PLAN.md (Implementation roadmap)"
echo ""
