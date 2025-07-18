#!/bin/bash
# Prepare FedMCP UI for separate public repository

echo "🎨 Preparing FedMCP UI for Separate Repository"
echo "============================================="

# Check if we're in the fedmcp-ui directory
if [ ! -d "fedmcp-ui" ]; then
    echo "❌ Error: fedmcp-ui directory not found"
    echo "   Please run this script from the FedMCP root directory"
    exit 1
fi

echo "📁 Creating temporary directory for UI repository..."
temp_dir="/tmp/fedmcp-ui-release-$(date +%s)"
mkdir -p "$temp_dir"

echo "📋 Copying UI files..."
cp -r fedmcp-ui/* "$temp_dir/"
cp -r fedmcp-ui/.* "$temp_dir/" 2>/dev/null || true

# Create a specific README for the UI repository
cat > "$temp_dir/README.md" << 'EOF'
# FedMCP UI

Web interface for the Federal Model Context Protocol (FedMCP) - a signed, auditable interchange format for AI/ML compliance artifacts in government cloud environments.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🔧 Configuration

Set the following environment variables:

```bash
# API endpoint
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Authentication
NEXT_PUBLIC_AUTH_ENABLED=false
```

## 📦 Features

- **Dashboard**: View and manage FedMCP artifacts
- **Catalog**: Browse available artifacts
- **Audit Trail**: Track all artifact operations
- **Settings**: Configure workspace and preferences
- **Marketing Site**: Public-facing information pages

## 🏗️ Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React Query (for API state)
- Radix UI (components)

## 🔗 Related Repositories

- [FedMCP Core](https://github.com/fedmcp/fedmcp) - Core libraries and server
- [FedMCP Spec](https://github.com/fedmcp/fedmcp-spec) - Protocol specification

## 📝 License

Apache 2.0 - See [LICENSE](LICENSE)

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) in the main FedMCP repository.
EOF

# Copy essential files from parent if they don't exist
if [ ! -f "$temp_dir/LICENSE" ]; then
    cp LICENSE "$temp_dir/" 2>/dev/null || echo "⚠️  LICENSE file not found in UI directory"
fi

# Create a basic .gitignore if it doesn't exist
if [ ! -f "$temp_dir/.gitignore" ]; then
    cat > "$temp_dir/.gitignore" << 'EOF'
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# keys
/keys/
*.key
*.pem
EOF
fi

echo ""
echo "✅ UI files prepared in: $temp_dir"
echo ""
echo "Next steps to create fedmcp-ui repository:"
echo ""
echo "1. Go to https://github.com/organizations/fedmcp/repositories/new"
echo "2. Create 'fedmcp-ui' repository"
echo "3. Run these commands:"
echo ""
echo "   cd $temp_dir"
echo "   git init"
echo "   git add ."
echo "   git commit -m \"Initial commit of FedMCP UI\""
echo "   git remote add origin https://github.com/fedmcp/fedmcp-ui.git"
echo "   git push -u origin main"
echo ""
echo "4. Configure GitHub Pages for docs if needed"
echo "5. Set up GitHub Actions for CI/CD"