#!/bin/bash
# Prepare FedMCP for public GitHub release

echo "🚀 Preparing FedMCP for Public Release"
echo "====================================="

# Check if git is already initialized
if [ -d .git ]; then
    echo "⚠️  Git repository already initialized"
    echo "   Current remotes:"
    git remote -v
    echo ""
    read -p "Continue with existing git repo? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    # Initialize git repository
    echo "📁 Initializing git repository..."
    git init
fi

# Stage public files according to GITHUB_REPOSITORY_PLAN.md
echo ""
echo "📝 Staging public files..."

# Core documentation
git add README.md LICENSE CHANGELOG.md CONTRIBUTING.md SECURITY.md

# Core libraries
git add core/

# CLI tool
git add cli/

# Server
git add server/

# Examples
git add examples/

# GitHub workflows
git add .github/

# Configuration files
git add .gitignore

# Documentation files
git add docs/ spec/README.md || true

# Project tracking files (these are helpful for context)
git add PROJECT_STATUS.md TECHNICAL_STATUS.md IMPLEMENTATION_SUMMARY.md PEREGRINE_INTEGRATION_SUMMARY.md GITHUB_REPOSITORY_PLAN.md

# Scripts (useful for contributors)
git add scripts/

# Show what will be committed
echo ""
echo "📋 Files staged for commit:"
git status --short

# Count files
echo ""
echo "📊 Statistics:"
echo "   Total files staged: $(git status --short | wc -l)"
echo "   Python files: $(git status --short | grep -c "\.py$" || echo 0)"
echo "   TypeScript files: $(git status --short | grep -c "\.ts$" || echo 0)"
echo "   Go files: $(git status --short | grep -c "\.go$" || echo 0)"

# Check for any unstaged files that might be important
echo ""
echo "🔍 Checking for unstaged files..."
unstaged=$(git status --porcelain | grep "^??" | grep -v "fedmcp-ui/" | grep -v "fedmcp-connect/" | grep -v ".DS_Store" | grep -v "__pycache__" | grep -v ".venv" | grep -v "node_modules")

if [ -n "$unstaged" ]; then
    echo "⚠️  Unstaged files found (review if any should be included):"
    echo "$unstaged"
else
    echo "✅ No concerning unstaged files found"
fi

echo ""
echo "====================================="
echo "✅ Ready for initial commit!"
echo ""
echo "Next steps:"
echo "1. Review the staged files above"
echo "2. If everything looks good, run:"
echo "   git commit -m \"Initial public release of FedMCP v0.2.0-alpha\""
echo "3. Add remote:"
echo "   git remote add origin https://github.com/fedmcp/fedmcp.git"
echo "4. Push to GitHub:"
echo "   git push -u origin main"
echo "5. Create release:"
echo "   git tag v0.2.0-alpha"
echo "   git push origin v0.2.0-alpha"