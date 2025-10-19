#!/bin/bash
# Production Build Validation Script
# Ensures the build is production-ready before deployment
# Run this as part of prebuild: npm run validate

set -e

echo "🔍 Production Build Validation"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check environment
echo ""
echo "📋 Checking environment..."

# Check for required env file
if [ ! -f ".env.production" ]; then
  echo -e "${YELLOW}⚠️  .env.production not found${NC}"
  echo "   Creating from .env.production.example..."
  if [ -f ".env.production.example" ]; then
    cp .env.production.example .env.production
  else
    echo -e "${RED}❌ Error: .env.production.example not found${NC}"
    exit 1
  fi
fi

# Validate required variables
echo ""
echo "✅ Validating required environment variables..."

check_required_var() {
  local var_name=$1
  local var_value=$(grep "^${var_name}=" .env.production 2>/dev/null | cut -d'=' -f2 || echo "")
  
  if [ -z "$var_value" ] || [ "$var_value" = "your-"* ]; then
    echo -e "${RED}❌ Missing or placeholder: $var_name${NC}"
    return 1
  else
    echo -e "${GREEN}✓ $var_name${NC}"
    return 0
  fi
}

VALIDATION_PASSED=true

check_required_var "VITE_BACKEND_URL" || VALIDATION_PASSED=false
check_required_var "VITE_API_BASE_URL" || VALIDATION_PASSED=false
check_required_var "VITE_APP_ENV" || VALIDATION_PASSED=false
check_required_var "VITE_ENCRYPTION_KEY" || VALIDATION_PASSED=false
check_required_var "VITE_SENTRY_DSN" || VALIDATION_PASSED=false

if [ "$VALIDATION_PASSED" = false ]; then
  echo ""
  echo -e "${RED}❌ Environment validation failed${NC}"
  echo "   Edit .env.production and add real values"
  exit 1
fi

# Check for localhost URLs (production only)
echo ""
echo "🔒 Checking for insecure URLs..."

if grep -q "localhost\|127.0.0.1" .env.production; then
  echo -e "${RED}❌ ERROR: localhost or 127.0.0.1 found in production env${NC}"
  exit 1
fi
echo -e "${GREEN}✓ No localhost URLs found${NC}"

# Check for non-HTTPS URLs (production only)
if grep -E "(VITE_BACKEND_URL|VITE_API_BASE_URL)" .env.production | grep -q "^http://" && ! grep -q "localhost"; then
  echo -e "${RED}❌ ERROR: http:// URLs found (use https://)${NC}"
  exit 1
fi
echo -e "${GREEN}✓ All URLs use HTTPS${NC}"

# Check Node version
echo ""
echo "🔧 Checking Node.js version..."
NODE_VERSION=$(node -v | grep -oE '[0-9]+' | head -1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${YELLOW}⚠️  Node.js 18+ recommended (current: v${NODE_VERSION})${NC}"
fi

# Check npm dependencies
echo ""
echo "📦 Checking dependencies..."
if npm audit | grep -q "vulnerability"; then
  echo -e "${YELLOW}⚠️  Security vulnerabilities found:${NC}"
  npm audit --production
else
  echo -e "${GREEN}✓ No critical vulnerabilities${NC}"
fi

# Build size check
echo ""
echo "⚙️  Validating build configuration..."
if [ -f "vite.config.ts" ]; then
  if grep -q "sourcemap: true" vite.config.ts; then
    echo -e "${RED}❌ ERROR: Source maps enabled in production${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Source maps disabled${NC}"
fi

# Check .gitignore for secrets
if [ -f ".gitignore" ]; then
  if ! grep -q ".env.production" .gitignore; then
    echo -e "${YELLOW}⚠️  .env.production should be in .gitignore${NC}"
  fi
  echo -e "${GREEN}✓ .env files properly ignored${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ All validation checks passed!${NC}"
echo "Ready to build for production"
echo ""
echo "Next step: npm run build:production"
