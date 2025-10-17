#!/bin/sh
# Environment Variable Validation Script
#
# Validates that all required environment variables are set during Docker build.
# Prevents deployment with missing configuration.
#
# Usage: ./scripts/validate-env.sh

set -e

echo "🔍 Validating environment variables..."

# Required environment variables
REQUIRED_VARS="
  VITE_BACKEND_URL
  VITE_API_BASE_URL
"

# Optional but recommended variables
RECOMMENDED_VARS="
  VITE_SENTRY_DSN
  VITE_VERSION
"

# Track validation status
MISSING_REQUIRED=0
MISSING_RECOMMENDED=0

# Check required variables
echo "\n📋 Checking required variables:"
for var in $REQUIRED_VARS; do
  eval value=\$$var
  if [ -z "$value" ]; then
    echo "  ❌ $var is not set (REQUIRED)"
    MISSING_REQUIRED=$((MISSING_REQUIRED + 1))
  else
    # Show first 20 chars to avoid exposing secrets
    preview=$(echo "$value" | cut -c1-20)
    echo "  ✅ $var is set ($preview...)"
  fi
done

# Check recommended variables
echo "\n📋 Checking recommended variables:"
for var in $RECOMMENDED_VARS; do
  eval value=\$$var
  if [ -z "$value" ]; then
    echo "  ⚠️  $var is not set (recommended)"
    MISSING_RECOMMENDED=$((MISSING_RECOMMENDED + 1))
  else
    preview=$(echo "$value" | cut -c1-20)
    echo "  ✅ $var is set ($preview...)"
  fi
done

# Final validation
echo ""
if [ $MISSING_REQUIRED -gt 0 ]; then
  echo "❌ Validation FAILED: $MISSING_REQUIRED required variable(s) missing"
  exit 1
elif [ $MISSING_RECOMMENDED -gt 0 ]; then
  echo "⚠️  Validation PASSED with warnings: $MISSING_RECOMMENDED recommended variable(s) missing"
  echo "   Deployment will continue but some features may be disabled"
  exit 0
else
  echo "✅ Validation PASSED: All required and recommended variables are set"
  exit 0
fi
