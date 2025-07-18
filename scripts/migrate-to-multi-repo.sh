#!/usr/bin/env bash

# FedMCP Monorepo to Multi-Repo Migration Script
# This script splits the FedMCP monorepo into multiple repositories
# while preserving git history for each component

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
GITHUB_ORG="FedMCP"
SOURCE_REPO_PATH="/Users/lance/Projects/FedMCP"
TEMP_DIR="/tmp/fedmcp-migration"
CURRENT_BRANCH=$(git branch --show-current)

# Check if we have the remote configured
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")

# Files to copy to all repos
COMMON_FILES=(
    "LICENSE"
    "SECURITY.md"
    "CONTRIBUTING.md"
)

# Root files to include in core repo
CORE_ROOT_FILES=(
    "README.md"
    "CHANGELOG.md"
    "PROJECT_STATUS.md"
    "TECHNICAL_STATUS.md"
    "GITHUB_REPOSITORY_PLAN.md"
    "IMPLEMENTATION_SUMMARY.md"
    "PEREGRINE_INTEGRATION_SUMMARY.md"
    "fedmcp-implementation-guide.md"
    "fedmcp-oss-completion.md"
    "RELEASE_CHECKLIST.md"
    "CLAUDE.md"
)

echo -e "${BLUE}FedMCP Monorepo to Multi-Repo Migration Script${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Check if git-filter-repo is installed
if ! command -v git-filter-repo &> /dev/null; then
    echo -e "${RED}Error: git-filter-repo is not installed${NC}"
    echo "Install it with: pip install git-filter-repo"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

# Confirm with user
echo -e "${YELLOW}This script will:${NC}"
echo "1. Create a temporary directory for migration"
echo "2. Split the monorepo into 10 separate repositories"
echo "3. Preserve git history for each component"
echo "4. Create remotes pointing to github.com/${GITHUB_ORG}/<repo-name>"
echo ""
echo -e "${YELLOW}Current directory:${NC} $SOURCE_REPO_PATH"
echo -e "${YELLOW}Current branch:${NC} $CURRENT_BRANCH"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Create temp directory
echo -e "${BLUE}Creating temporary directory...${NC}"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Function to get repository description
get_repo_description() {
    case "$1" in
        "core") echo "FedMCP protocol specifications and schemas" ;;
        "server") echo "Reference FastAPI server implementation for FedMCP" ;;
        "cli") echo "Command-line tool for creating, signing, and managing FedMCP artifacts" ;;
        "ui") echo "Next.js web interface for FedMCP artifact management" ;;
        "go-sdk") echo "Go SDK for FedMCP - create, sign, and verify compliance artifacts" ;;
        "python-sdk") echo "Python SDK for FedMCP - create, sign, and verify compliance artifacts" ;;
        "typescript-sdk") echo "TypeScript/JavaScript SDK for FedMCP - create, sign, and verify compliance artifacts" ;;
        "connectors") echo "FedMCP connector framework and examples" ;;
        "docs") echo "Documentation for the FedMCP project" ;;
        "examples") echo "Example implementations and quickstart guides for FedMCP" ;;
    esac
}

# Function to get source path for repository
get_source_path() {
    case "$1" in
        "core") echo "spec/" ;;
        "server") echo "server/" ;;
        "cli") echo "cli/" ;;
        "ui") echo "fedmcp-ui/" ;;
        "go-sdk") echo "core/go/" ;;
        "python-sdk") echo "core/python/" ;;
        "typescript-sdk") echo "core/typescript/" ;;
        "connectors") echo "fedmcp-connect/" ;;
        "docs") echo "spec/docs/" ;;
        "examples") echo "examples/" ;;
    esac
}

# Function to migrate a single repository
migrate_repo() {
    local repo_name=$1
    local source_path=$(get_source_path "$repo_name")
    local repo_dir="$TEMP_DIR/$repo_name"
    
    echo -e "${BLUE}Migrating $repo_name...${NC}"
    
    # Clone the source repository
    echo "  Cloning source repository..."
    git clone "$SOURCE_REPO_PATH" "$repo_dir"
    cd "$repo_dir"
    
    # Prepare filter commands
    local filter_commands=""
    
    # For core repo, we need to handle multiple paths and root files
    if [ "$repo_name" == "core" ]; then
        # Include the spec directory
        filter_commands="--path $source_path"
        
        # Include root documentation files
        for file in "${CORE_ROOT_FILES[@]}"; do
            if [ -f "$SOURCE_REPO_PATH/$file" ]; then
                filter_commands="$filter_commands --path $file"
            fi
        done
        
        # Include common files
        for file in "${COMMON_FILES[@]}"; do
            if [ -f "$SOURCE_REPO_PATH/$file" ]; then
                filter_commands="$filter_commands --path $file"
            fi
        done
    else
        # For other repos, just include the specific path
        filter_commands="--path $source_path"
    fi
    
    # Run git-filter-repo to keep only the relevant paths
    echo "  Filtering repository history..."
    eval "git-filter-repo $filter_commands --force"
    
    # Special handling for different repos
    case $repo_name in
        "core")
            # Move spec contents to root if needed
            if [ -d "spec" ]; then
                echo "  Restructuring core repository..."
                find spec -mindepth 1 -maxdepth 1 -exec mv {} . \;
                rmdir spec
                git add -A
                git commit -m "Restructure: Move spec contents to root" || true
            fi
            ;;
        "go-sdk"|"python-sdk"|"typescript-sdk")
            # Move SDK contents to root
            echo "  Restructuring $repo_name..."
            if [ "$repo_name" == "go-sdk" ] && [ -d "core/go" ]; then
                find core/go -mindepth 1 -maxdepth 1 -exec mv {} . \;
                rm -rf core
            elif [ "$repo_name" == "python-sdk" ] && [ -d "core/python" ]; then
                find core/python -mindepth 1 -maxdepth 1 -exec mv {} . \;
                rm -rf core
            elif [ "$repo_name" == "typescript-sdk" ] && [ -d "core/typescript" ]; then
                find core/typescript -mindepth 1 -maxdepth 1 -exec mv {} . \;
                rm -rf core
            fi
            git add -A
            git commit -m "Restructure: Move SDK contents to root" || true
            ;;
        "docs")
            # Move docs contents to root if needed
            if [ -d "spec/docs" ]; then
                echo "  Restructuring docs repository..."
                find spec/docs -mindepth 1 -maxdepth 1 -exec mv {} . \;
                rm -rf spec
                git add -A
                git commit -m "Restructure: Move docs contents to root" || true
            fi
            ;;
    esac
    
    # Copy common files if they don't exist (for non-core repos)
    if [ "$repo_name" != "core" ]; then
        echo "  Adding common files..."
        for file in "${COMMON_FILES[@]}"; do
            if [ ! -f "$file" ] && [ -f "$SOURCE_REPO_PATH/$file" ]; then
                cp "$SOURCE_REPO_PATH/$file" .
                git add "$file"
            fi
        done
        git commit -m "Add common files (LICENSE, SECURITY.md, CONTRIBUTING.md)" || true
    fi
    
    # Create/update README if it doesn't exist
    if [ ! -f "README.md" ] || [ "$repo_name" != "core" ]; then
        echo "  Creating README.md..."
        local description=$(get_repo_description "$repo_name")
        cat > README.md << EOF
# FedMCP ${repo_name}

${description}

## Overview

This repository is part of the FedMCP (Federal Model Context Protocol) project, which provides a signed, auditable interchange format for compliance artifacts in government ML deployments.

## Installation

See the [main documentation](https://github.com/${GITHUB_ORG}/docs) for installation instructions.

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Related Repositories

- [FedMCP Core](https://github.com/${GITHUB_ORG}/core) - Protocol specifications
- [FedMCP Server](https://github.com/${GITHUB_ORG}/server) - Reference server implementation
- [FedMCP CLI](https://github.com/${GITHUB_ORG}/cli) - Command-line tool
- [FedMCP UI](https://github.com/${GITHUB_ORG}/ui) - Web interface
- [FedMCP Documentation](https://github.com/${GITHUB_ORG}/docs) - Full documentation
EOF
        git add README.md
        git commit -m "Add repository README" || true
    fi
    
    # Add remote
    echo "  Adding remote..."
    git remote remove origin || true
    git remote add origin "https://github.com/${GITHUB_ORG}/${repo_name}.git"
    
    echo -e "${GREEN}  ✓ $repo_name migration complete${NC}"
    echo "  Repository location: $repo_dir"
    echo "  Remote: https://github.com/${GITHUB_ORG}/${repo_name}.git"
    echo ""
    
    cd "$SOURCE_REPO_PATH"
}

# List of repositories to migrate
REPOS=(
    "core"
    "server"
    "cli"
    "ui"
    "go-sdk"
    "python-sdk"
    "typescript-sdk"
    "connectors"
    "docs"
    "examples"
)

# Main migration loop
echo -e "${BLUE}Starting migration...${NC}"
echo ""

for repo_name in "${REPOS[@]}"; do
    migrate_repo "$repo_name"
done

# Create summary script
echo -e "${BLUE}Creating push script...${NC}"
cat > "$TEMP_DIR/push-all-repos.sh" << 'EOF'
#!/bin/bash

# Script to push all migrated repositories to GitHub
# Run this after creating the repositories on GitHub

set -e

REPOS=(core server cli ui go-sdk python-sdk typescript-sdk connectors docs examples)

echo "This script will push all repositories to GitHub."
echo "Make sure you have created all repositories on GitHub first!"
echo ""
read -p "Have you created all repositories on GitHub? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please create the repositories first, then run this script."
    exit 1
fi

for repo in "${REPOS[@]}"; do
    echo ""
    echo "Pushing $repo..."
    cd "$repo"
    git push -u origin main
    cd ..
done

echo ""
echo "All repositories pushed successfully!"
EOF

chmod +x "$TEMP_DIR/push-all-repos.sh"

# Create repository creation script
echo -e "${BLUE}Creating repository creation script...${NC}"
cat > "$TEMP_DIR/create-github-repos.sh" << 'EOF'
#!/bin/bash

# Script to create all repositories on GitHub
# Requires GitHub CLI (gh) to be installed and authenticated

set -e

echo "Creating repositories on GitHub..."

# Function to create a repository with description
create_repo() {
    local repo_name=$1
    local description=$2
    
    echo "Creating $repo_name..."
    gh repo create FedMCP/$repo_name \
        --public \
        --description "$description" \
        --add-readme=false \
        || echo "Repository $repo_name might already exist"
}

# Create all repositories
create_repo "core" "FedMCP protocol specifications and schemas"
create_repo "server" "Reference FastAPI server implementation for FedMCP"
create_repo "cli" "Command-line tool for creating, signing, and managing FedMCP artifacts"
create_repo "ui" "Next.js web interface for FedMCP artifact management"
create_repo "go-sdk" "Go SDK for FedMCP - create, sign, and verify compliance artifacts"
create_repo "python-sdk" "Python SDK for FedMCP - create, sign, and verify compliance artifacts"
create_repo "typescript-sdk" "TypeScript/JavaScript SDK for FedMCP - create, sign, and verify compliance artifacts"
create_repo "connectors" "FedMCP connector framework and examples"
create_repo "docs" "Documentation for the FedMCP project"
create_repo "examples" "Example implementations and quickstart guides for FedMCP"

echo ""
echo "All repositories created (or already exist)!"
echo "You can now run push-all-repos.sh to push the code."
EOF

chmod +x "$TEMP_DIR/create-github-repos.sh"

# Final summary
echo -e "${GREEN}Migration complete!${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "- Migrated repositories are in: $TEMP_DIR"
echo "- Each repository preserves its git history"
echo "- Common files (LICENSE, etc.) have been added where needed"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Review the migrated repositories in $TEMP_DIR"
echo "2. Run: ${YELLOW}$TEMP_DIR/create-github-repos.sh${NC} to create repos on GitHub (requires gh CLI)"
echo "3. Run: ${YELLOW}$TEMP_DIR/push-all-repos.sh${NC} to push all repos"
echo ""
echo -e "${YELLOW}Note:${NC} The original repository remains unchanged."