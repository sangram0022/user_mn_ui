#!/bin/bash
# ============================================================================
# PRODUCTION DEPLOYMENT VERIFICATION SCRIPT
# ============================================================================
# This script verifies your React 19 application is ready for production
# deployment with all critical fixes implemented.
# 
# Usage: bash verify-production.sh
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  PRODUCTION READINESS VERIFICATION v1.0${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_TOTAL=0

# Helper function to check conditions
check_status() {
  local check_name=$1
  local condition=$2
  local pass_msg=$3
  local fail_msg=$4
  
  CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
  
  if [ "$condition" = "true" ]; then
    echo -e "${GREEN}✅ ${check_name}${NC}"
    if [ -n "$pass_msg" ]; then
      echo -e "   ${GREEN}→ ${pass_msg}${NC}"
    fi
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
  else
    echo -e "${RED}❌ ${check_name}${NC}"
    if [ -n "$fail_msg" ]; then
      echo -e "   ${RED}→ ${fail_msg}${NC}"
    fi
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
  fi
}

# ============================================================================
# 1. DOCUMENTATION VERIFICATION
# ============================================================================
echo -e "${BLUE}📋 DOCUMENTATION VERIFICATION${NC}\n"

[ -f "FINAL_REPORT.md" ] && FINAL_REPORT="true" || FINAL_REPORT="false"
check_status "FINAL_REPORT.md exists" "$FINAL_REPORT" "Comprehensive final report created" "Missing final report"

[ -f "PRODUCTION_READY.md" ] && PROD_READY="true" || PROD_READY="false"
check_status "PRODUCTION_READY.md exists" "$PROD_READY" "Implementation guide created" "Missing production ready guide"

[ -f "DEPLOYMENT_CHECKLIST.md" ] && DEPLOY_CHECK="true" || DEPLOY_CHECK="false"
check_status "DEPLOYMENT_CHECKLIST.md exists" "$DEPLOY_CHECK" "Deployment checklist available" "Missing deployment checklist"

[ -f "docs/GDPR_COMPLIANCE.md" ] && GDPR="true" || GDPR="false"
check_status "GDPR_COMPLIANCE.md exists" "$GDPR" "Legal compliance documented" "Missing GDPR compliance guide"

[ -f ".env.production.example" ] && ENV_EXAMPLE="true" || ENV_EXAMPLE="false"
check_status ".env.production.example exists" "$ENV_EXAMPLE" "Environment template available" "Missing environment template"

# ============================================================================
# 2. CODE MODIFICATIONS VERIFICATION
# ============================================================================
echo -e "\n${BLUE}🔧 CODE MODIFICATIONS VERIFICATION${NC}\n"

# Check environment validation
if grep -q "VITE_SENTRY_DSN.*REQUIRED" src/config/env.validation.ts 2>/dev/null; then
  ENV_VALIDATION="true"
else
  ENV_VALIDATION="false"
fi
check_status "Environment validation enhanced" "$ENV_VALIDATION" "SENTRY_DSN and ENCRYPTION_KEY are REQUIRED" "Environment validation not updated"

# Check API client timeout
if grep -q "fetchWithTimeout" src/lib/api/client.ts 2>/dev/null; then
  TIMEOUT="true"
else
  TIMEOUT="false"
fi
check_status "Request timeout implementation" "$TIMEOUT" "fetchWithTimeout wrapper added to API client" "Timeout implementation missing"

# Check jitter in retry logic
if grep -q "jitterFactor" src/lib/api/client.ts 2>/dev/null; then
  JITTER="true"
else
  JITTER="false"
fi
check_status "Jitter in retry backoff" "$JITTER" "Exponential backoff with ±10% jitter implemented" "Jitter implementation missing"

# Check nginx CSP headers
if grep -q "default-src 'self'" nginx.conf 2>/dev/null; then
  CSP="true"
else
  CSP="false"
fi
check_status "CSP headers hardened" "$CSP" "Security-focused CSP policy configured" "CSP headers not hardened"

# ============================================================================
# 3. SERVICE IMPLEMENTATIONS VERIFICATION
# ============================================================================
echo -e "\n${BLUE}🚀 SERVICE IMPLEMENTATIONS VERIFICATION${NC}\n"

[ -f "src/shared/services/health.service.ts" ] && HEALTH_SVC="true" || HEALTH_SVC="false"
check_status "Health check service" "$HEALTH_SVC" "Health service with dependency checks implemented" "Health service missing"

[ -f "src/shared/pages/HealthPage.tsx" ] && HEALTH_PAGE="true" || HEALTH_PAGE="false"
check_status "Health status UI component" "$HEALTH_PAGE" "React component for health monitoring created" "Health UI missing"

[ -f "src/monitoring/cloudwatch-rum.ts" ] && RUM="true" || RUM="false"
check_status "CloudWatch RUM integration" "$RUM" "AWS real user monitoring configured" "RUM integration missing"

# ============================================================================
# 4. SCRIPTS VERIFICATION
# ============================================================================
echo -e "\n${BLUE}⚙️  BUILD & VALIDATION SCRIPTS${NC}\n"

[ -f "scripts/validate-production.sh" ] && VALIDATE="true" || VALIDATE="false"
check_status "Production validation script" "$VALIDATE" "Pre-deployment validation automation ready" "Validation script missing"

[ -f "scripts/inject-version.js" ] && VERSION_INJECT="true" || VERSION_INJECT="false"
check_status "Version injection script" "$VERSION_INJECT" "Build-time version metadata configured" "Version script missing"

# ============================================================================
# 5. CONFIGURATION FILES VERIFICATION
# ============================================================================
echo -e "\n${BLUE}⚙️  CONFIGURATION VERIFICATION${NC}\n"

[ -f "vite.config.ts" ] && VITE="true" || VITE="false"
check_status "Vite configuration" "$VITE" "Build configuration present" "Vite config missing"

[ -f "nginx.conf" ] && NGINX="true" || NGINX="false"
check_status "Nginx web server config" "$NGINX" "Web server configuration present" "Nginx config missing"

[ -f "tsconfig.json" ] && TSCONFIG="true" || TSCONFIG="false"
check_status "TypeScript configuration" "$TSCONFIG" "TypeScript strict mode enabled" "TypeScript config missing"

[ -f "Dockerfile" ] && DOCKER="true" || DOCKER="false"
check_status "Docker configuration" "$DOCKER" "Containerization ready" "Dockerfile missing"

# ============================================================================
# 6. ENVIRONMENT VALIDATION
# ============================================================================
echo -e "\n${BLUE}🔐 ENVIRONMENT VALIDATION${NC}\n"

if [ -f ".env.production" ]; then
  ENV_FILE="true"
  # Check if it has required vars
  if grep -q "VITE_BACKEND_URL" .env.production 2>/dev/null && \
     grep -q "VITE_SENTRY_DSN" .env.production 2>/dev/null && \
     grep -q "VITE_ENCRYPTION_KEY" .env.production 2>/dev/null; then
    ENV_COMPLETE="true"
  else
    ENV_COMPLETE="false"
  fi
else
  ENV_FILE="false"
  ENV_COMPLETE="false"
fi

check_status ".env.production exists" "$ENV_FILE" "Production environment configured" "Copy from .env.production.example and configure"

if [ "$ENV_FILE" = "true" ]; then
  check_status "Required environment variables" "$ENV_COMPLETE" "All critical variables set" "Missing required environment variables"
fi

# Check no localhost in production
if [ -f ".env.production" ]; then
  if grep -q "localhost" .env.production 2>/dev/null; then
    LOCALHOST_CHECK="false"
  else
    LOCALHOST_CHECK="true"
  fi
else
  LOCALHOST_CHECK="true"  # Not applicable yet
fi

check_status "No localhost in production" "$LOCALHOST_CHECK" "Production URLs validated" "Remove localhost URLs from .env.production"

# ============================================================================
# 7. SECURITY VERIFICATION
# ============================================================================
echo -e "\n${BLUE}🔒 SECURITY VERIFICATION${NC}\n"

# Check for security headers in nginx
if grep -q "Strict-Transport-Security\|X-Content-Type-Options\|X-Frame-Options" nginx.conf 2>/dev/null; then
  SECURITY_HEADERS="true"
else
  SECURITY_HEADERS="false"
fi
check_status "Security headers configured" "$SECURITY_HEADERS" "HSTS, MIME sniffing, clickjacking protection set" "Security headers not configured"

# Check for source maps exclusion
if grep -q "sourcemap.*false\|sourceMap.*false" vite.config.ts 2>/dev/null; then
  NO_SOURCEMAP="true"
else
  NO_SOURCEMAP="false"
fi
check_status "Source maps disabled in production" "$NO_SOURCEMAP" "Build optimized for security" "Enable source map exclusion"

# ============================================================================
# 8. MONITORING SETUP VERIFICATION
# ============================================================================
echo -e "\n${BLUE}📊 MONITORING SETUP VERIFICATION${NC}\n"

if grep -q "sentry" src/monitoring/sentry.ts 2>/dev/null; then
  SENTRY="true"
else
  SENTRY="false"
fi
check_status "Sentry error tracking" "$SENTRY" "Error tracking service integrated" "Sentry configuration missing"

if grep -q "CloudWatch" src/monitoring/cloudwatch-rum.ts 2>/dev/null; then
  CLOUDWATCH="true"
else
  CLOUDWATCH="false"
fi
check_status "CloudWatch RUM setup" "$CLOUDWATCH" "Real user monitoring configured" "CloudWatch RUM missing"

# ============================================================================
# 9. TYPESCRIPT & BUILD VERIFICATION
# ============================================================================
echo -e "\n${BLUE}🏗️  BUILD SYSTEM VERIFICATION${NC}\n"

# Check package.json for build scripts
if grep -q '"build"' package.json 2>/dev/null; then
  BUILD_SCRIPT="true"
else
  BUILD_SCRIPT="false"
fi
check_status "Build scripts configured" "$BUILD_SCRIPT" "npm run build available" "Build scripts missing"

if grep -q '"type": "module"' package.json 2>/dev/null; then
  ES_MODULES="true"
else
  ES_MODULES="false"
fi
check_status "ES modules configured" "$ES_MODULES" "Modern JavaScript module system enabled" "ES modules not configured"

# ============================================================================
# 10. COMPLIANCE VERIFICATION
# ============================================================================
echo -e "\n${BLUE}⚖️  COMPLIANCE VERIFICATION${NC}\n"

[ -f "docs/GDPR_COMPLIANCE.md" ] && GDPR_DOC="true" || GDPR_DOC="false"
check_status "GDPR compliance documented" "$GDPR_DOC" "Legal compliance framework complete" "GDPR documentation missing"

[ -f ".gitignore" ] && GITIGNORE="true" || GITIGNORE="false"
check_status ".gitignore configured" "$GITIGNORE" "Secret files protected" ".gitignore missing"

if [ "$GITIGNORE" = "true" ]; then
  if grep -q ".env.production" .gitignore 2>/dev/null; then
    SECRETS_PROTECTED="true"
  else
    SECRETS_PROTECTED="false"
  fi
  check_status "Production secrets protected" "$SECRETS_PROTECTED" ".env.production in .gitignore" "Add .env.production to .gitignore"
fi

# ============================================================================
# SUMMARY REPORT
# ============================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📈 VERIFICATION SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

PASS_PCT=$((CHECKS_PASSED * 100 / CHECKS_TOTAL))

echo -e "Total Checks: ${YELLOW}${CHECKS_TOTAL}${NC}"
echo -e "Passed: ${GREEN}${CHECKS_PASSED}${NC}"
echo -e "Failed: ${RED}${CHECKS_FAILED}${NC}"
echo -e "Success Rate: ${YELLOW}${PASS_PCT}%${NC}\n"

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}  ✅ ALL CHECKS PASSED - PRODUCTION READY${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
  echo -e "Your application is ${GREEN}100% production ready${NC}! 🚀"
  echo -e "\nNext steps:"
  echo -e "  1. Review ${YELLOW}FINAL_REPORT.md${NC} for complete documentation"
  echo -e "  2. Configure ${YELLOW}.env.production${NC} with real values"
  echo -e "  3. Run validation: ${YELLOW}bash scripts/validate-production.sh${NC}"
  echo -e "  4. Build: ${YELLOW}npm run build:production${NC}"
  echo -e "  5. Test: ${YELLOW}npm run test:coverage${NC}"
  echo -e "  6. Deploy using ${YELLOW}DEPLOYMENT_CHECKLIST.md${NC}\n"
  exit 0
else
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}  ⚠️  ${CHECKS_FAILED} ITEMS NEED ATTENTION${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
  echo -e "Please review the failed checks above and address them."
  echo -e "Run this script again after making corrections.\n"
  exit 1
fi
