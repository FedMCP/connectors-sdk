#!/bin/bash
# Pre-push security and readiness check for FedMCP public repository

echo "🔍 FedMCP Pre-Push Security Check"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if any issues are found
ISSUES_FOUND=0

# Function to check for patterns
check_pattern() {
    local pattern=$1
    local description=$2
    local exclude_dirs="-type d \( -name '.git' -o -name 'node_modules' -o -name '.venv' -o -name 'venv' -o -name 'dist' -o -name 'build' \) -prune -o"
    
    echo -n "Checking for $description... "
    
    # Use find with grep to search for the pattern
    results=$(find . $exclude_dirs -type f -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.go" -o -name "*.json" -o -name "*.yaml" -o -name "*.yml" -o -name "*.md" | xargs grep -l "$pattern" 2>/dev/null | grep -v "pre-push-check.sh" || true)
    
    if [ -n "$results" ]; then
        echo -e "${RED}FOUND${NC}"
        echo "$results"
        ISSUES_FOUND=1
    else
        echo -e "${GREEN}OK${NC}"
    fi
}

echo "1. Checking for private key files..."
key_files=$(find . -type f \( -name "*.pem" -o -name "*.key" -o -name "*.p12" -o -name "*.pfx" \) -not -path "./.venv/*" -not -path "./venv/*" -not -path "./node_modules/*" -not -path "./.git/*" | grep -v "cacert.pem" || true)
if [ -n "$key_files" ]; then
    echo -e "${RED}FOUND private key files:${NC}"
    echo "$key_files"
    ISSUES_FOUND=1
else
    echo -e "${GREEN}OK${NC}"
fi

echo ""
echo "2. Checking for hardcoded credentials..."
check_pattern "password.*=.*['\"].*['\"]" "hardcoded passwords"
check_pattern "api_key.*=.*['\"].*['\"]" "hardcoded API keys"
check_pattern "secret.*=.*['\"].*['\"]" "hardcoded secrets"
check_pattern "token.*=.*['\"](?!Bearer demo-token)" "hardcoded tokens (excluding demo)"

echo ""
echo "3. Checking for internal URLs..."
check_pattern "\.mil[/\"]" "military domains"
check_pattern "\.gov[/\"]" "government domains (review needed)"
check_pattern "palantir\.com" "Palantir domains"
check_pattern "foundry\.com" "Foundry domains"

echo ""
echo "4. Checking for AWS account IDs..."
check_pattern "[0-9]{12}" "potential AWS account IDs (review needed)"

echo ""
echo "5. Checking for customer-specific content..."
check_pattern "VA-specific\|CDC-specific\|NIH-specific" "agency-specific content"
check_pattern "customer_name\|client_name" "customer references"

echo ""
echo "6. Verifying required files exist..."
required_files=("README.md" "LICENSE" "CONTRIBUTING.md" "SECURITY.md" ".gitignore")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "$file: ${GREEN}EXISTS${NC}"
    else
        echo -e "$file: ${RED}MISSING${NC}"
        ISSUES_FOUND=1
    fi
done

echo ""
echo "7. Checking for sensitive directories..."
sensitive_dirs=("internal" "private" "proprietary" "customers" "contracts")
for dir in "${sensitive_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "$dir/: ${RED}FOUND (should be removed)${NC}"
        ISSUES_FOUND=1
    else
        echo -e "$dir/: ${GREEN}OK${NC}"
    fi
done

echo ""
echo "8. Checking Python examples for placeholder values..."
echo -n "Checking for example AWS account IDs... "
if grep -r "123456789012" --include="*.py" --include="*.md" . 2>/dev/null | grep -v "pre-push-check.sh" > /dev/null; then
    echo -e "${YELLOW}Found (likely examples - review)${NC}"
else
    echo -e "${GREEN}OK${NC}"
fi

echo ""
echo "================================="
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Repository appears ready for public release.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review the GITHUB_REPOSITORY_PLAN.md"
    echo "2. Create the GitHub repository"
    echo "3. Run the git commands from the plan"
else
    echo -e "${RED}❌ Issues found! Please address the above items before pushing.${NC}"
    echo ""
    echo "Common fixes:"
    echo "- Remove .pem files: rm <filename>"
    echo "- Replace hardcoded values with environment variables"
    echo "- Update internal URLs to example.com"
    echo "- Move sensitive content to private repositories"
fi

exit $ISSUES_FOUND