# Production Deployment Guide

**User Management System - React 19 Enterprise Application**

Complete step-by-step guide for deploying the application to AWS with CloudFront, S3, and full production setup.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Build & Test](#build--test)
4. [AWS Infrastructure Setup](#aws-infrastructure-setup)
5. [Docker Deployment](#docker-deployment)
6. [CDN Configuration](#cdn-configuration)
7. [Monitoring Setup](#monitoring-setup)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Rollback Procedures](#rollback-procedures)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Pre-Deployment Checklist

### Critical Items (P0 - Must Complete)

- [ ] **Update `.env.production`** with actual values
  - [ ] `VITE_BACKEND_URL` - Real API URL (not localhost)
  - [ ] `VITE_API_BASE_URL` - Real API base URL
  - [ ] `VITE_ENCRYPTION_KEY` - Generate: `openssl rand -base64 32`
  - [ ] `VITE_SENTRY_DSN` - Get from sentry.io
  - [ ] `VITE_ANALYTICS_ID` - Google Analytics 4 ID

- [ ] **Generate Images** (see `IMAGE_GENERATION_GUIDE.md`)
  - [ ] Favicons (16x16, 32x32)
  - [ ] Apple Touch Icon (180x180)
  - [ ] PWA Icons (192x192, 512x512)
  - [ ] OG Image (1200x630)
  - [ ] Twitter Card Image (1200x600)

- [ ] **Update `index.html`**
  - [ ] Replace `https://yourdomain.com` with actual domain
  - [ ] Update preconnect URLs
  - [ ] Update social media handles (@yourhandle)
  - [ ] Update canonical URLs

- [ ] **Security Review**
  - [ ] Verify tokens using encrypted storage (not localStorage)
  - [ ] Review CSP configuration
  - [ ] Check CORS settings
  - [ ] Verify API authentication

### High Priority (P1 - Should Complete)

- [ ] Run full test suite: `npm run test`
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Run Lighthouse audit: `npm run lighthouse`
- [ ] Check bundle size: `npm run build && npm run analyze`
- [ ] Review and fix all TODO comments
- [ ] Update documentation
- [ ] Configure error monitoring (Sentry)

### Medium Priority (P2 - Nice to Have)

- [ ] Visual regression tests
- [ ] Load testing
- [ ] Security audit (OWASP ZAP)
- [ ] Accessibility audit (axe-core)
- [ ] Performance budget enforcement

---

## 🔧 Environment Configuration

### 1. Install Dependencies

```bash
cd d:\code\reactjs\user_mn_ui
npm install
```

### 2. Generate Encryption Key

```bash
# Generate a secure 256-bit encryption key
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 3. Configure `.env.production`

```bash
# Copy example and edit
cp .env.production .env.production.local

# Edit with your values
code .env.production.local
```

**Required Values:**

```env
VITE_BACKEND_URL=https://api.yourdomain.com
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
VITE_ENCRYPTION_KEY=YOUR_GENERATED_KEY_HERE
VITE_SENTRY_DSN=https://your-key@sentry.io/project-id
VITE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_SITE_URL=https://yourdomain.com
```

### 4. Update Domain References

```bash
# Find and replace all yourdomain.com references
# Linux/Mac
grep -r "yourdomain.com" index.html public/ src/

# Windows (PowerShell)
Select-String -Path "index.html","public\*","src\*" -Pattern "yourdomain.com" -Recursive
```

**Files to Update:**

- `index.html` - Meta tags, canonical URLs
- `public/robots.txt` - Sitemap URL
- `public/sitemap.xml` - All URLs
- `public/manifest.json` - Start URL
- `.env.production` - All URL variables

---

## 🏗️ Build & Test

### 1. Clean Build

```bash
# Remove old build artifacts
rm -rf dist node_modules/.vite

# Clean install dependencies
npm ci

# Type check
npm run type-check

# Lint check
npm run lint

# Build for production
npm run build:production
```

### 2. Preview Production Build Locally

```bash
npm run preview

# Open http://localhost:4173 in browser
# Test all critical paths
```

### 3. Test Checklist

- [ ] Login/Logout flow
- [ ] User management operations (CRUD)
- [ ] Admin features (bulk operations, audit logs)
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Dark mode toggle
- [ ] Error handling
- [ ] Performance (Lighthouse score >90)
- [ ] Accessibility (WCAG 2.1 AA)

### 4. Bundle Analysis

```bash
npm run build:production
npm run analyze

# Check output in browser
# Ensure no unexpected large dependencies
```

**Target Bundle Sizes:**

- Initial JS: <200KB gzipped
- Initial CSS: <50KB gzipped
- Largest chunk: <300KB gzipped

---

## ☁️ AWS Infrastructure Setup

### Option 1: S3 + CloudFront (Recommended)

#### Step 1: Create S3 Bucket

```bash
# Create S3 bucket
aws s3 mb s3://your-app-name --region us-east-1

# Enable static website hosting
aws s3 website s3://your-app-name \
  --index-document index.html \
  --error-document index.html

# Set bucket policy (public read)
cat > bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-app-name/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket your-app-name \
  --policy file://bucket-policy.json
```

#### Step 2: Upload Build to S3

```bash
# Sync build to S3
aws s3 sync dist/ s3://your-app-name \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html" \
  --exclude "*.json"

# Upload index.html with no-cache
aws s3 cp dist/index.html s3://your-app-name/ \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"

# Upload JSON files
aws s3 sync dist/ s3://your-app-name \
  --exclude "*" \
  --include "*.json" \
  --cache-control "public, max-age=3600"
```

#### Step 3: Create CloudFront Distribution

```bash
# Create CloudFront distribution
cat > cloudfront-config.json <<EOF
{
  "CallerReference": "user-management-$(date +%s)",
  "Comment": "User Management System Distribution",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-your-app-name",
        "DomainName": "your-app-name.s3.us-east-1.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-your-app-name",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  }
}
EOF

aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

#### Step 4: Configure Custom Domain

```bash
# Request SSL certificate (ACM)
aws acm request-certificate \
  --domain-name yourdomain.com \
  --domain-name www.yourdomain.com \
  --validation-method DNS \
  --region us-east-1

# After DNS validation, update CloudFront distribution
# with custom domain and certificate ARN
```

#### Step 5: Configure Route 53

```bash
# Create hosted zone (if not exists)
aws route53 create-hosted-zone \
  --name yourdomain.com \
  --caller-reference $(date +%s)

# Create A record pointing to CloudFront
# Use AWS Console or CLI to create alias record
```

---

## 🐳 Docker Deployment

### Option 2: Docker Container (ECS/EKS/Fargate)

#### Step 1: Build Docker Image

```bash
# Build image with build args
docker build \
  --build-arg VITE_BACKEND_URL=https://api.yourdomain.com \
  --build-arg VITE_API_BASE_URL=https://api.yourdomain.com/api/v1 \
  --build-arg VITE_ENCRYPTION_KEY=your-key-here \
  --build-arg VITE_SENTRY_DSN=your-sentry-dsn \
  -t user-management-ui:1.0.0 \
  -t user-management-ui:latest \
  .

# Test locally
docker run -p 8080:80 user-management-ui:latest

# Open http://localhost:8080 in browser
```

#### Step 2: Push to ECR

```bash
# Create ECR repository
aws ecr create-repository --repository-name user-management-ui

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag user-management-ui:latest \
  YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/user-management-ui:latest

# Push image
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/user-management-ui:latest
```

#### Step 3: Deploy to ECS Fargate

```bash
# Create task definition
cat > task-definition.json <<EOF
{
  "family": "user-management-ui",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "user-management-ui",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/user-management-ui:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost/health.json || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 10
      }
    }
  ]
}
EOF

# Register task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json

# Create or update service
aws ecs create-service \
  --cluster your-cluster \
  --service-name user-management-ui \
  --task-definition user-management-ui \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

---

## 🌐 CDN Configuration

### CloudFront Custom Error Pages

```bash
# Configure SPA routing
aws cloudfront update-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --custom-error-responses \
    ErrorCode=403,ResponseCode=200,ResponsePagePath=/index.html \
    ErrorCode=404,ResponseCode=200,ResponsePagePath=/index.html
```

### Cache Invalidation

```bash
# Invalidate CloudFront cache after deployment
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Lambda@Edge for CSP (Optional)

Create Lambda@Edge function for nonce-based CSP injection:

```javascript
// csp-lambda-edge.js
exports.handler = async (event) => {
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  const nonce = require('crypto').randomBytes(16).toString('base64');

  headers['content-security-policy'] = [
    {
      key: 'Content-Security-Policy',
      value: `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.execute-api.us-east-1.amazonaws.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;`,
    },
  ];

  return response;
};
```

---

## 📊 Monitoring Setup

### 1. Configure Sentry

```bash
# Sign up at sentry.io
# Create new project
# Copy DSN to .env.production

# Install Sentry CLI
npm install -g @sentry/cli

# Upload source maps (optional, after build)
sentry-cli releases new user-management-ui@1.0.0
sentry-cli releases files user-management-ui@1.0.0 upload-sourcemaps dist/
sentry-cli releases finalize user-management-ui@1.0.0
```

### 2. Configure Google Analytics

```bash
# Create GA4 property at analytics.google.com
# Copy Measurement ID (G-XXXXXXXXXX)
# Add to .env.production: VITE_ANALYTICS_ID=G-XXXXXXXXXX
```

### 3. Configure CloudWatch (for ECS)

```bash
# Enable Container Insights
aws ecs update-cluster-settings \
  --cluster your-cluster \
  --settings name=containerInsights,value=enabled

# Create CloudWatch dashboard
# Monitor: CPU, Memory, Request Count, Error Rate, Latency
```

### 4. Set Up Uptime Monitoring

Services to consider:

- **Pingdom** (pingdom.com)
- **UptimeRobot** (uptimerobot.com)
- **StatusCake** (statuscake.com)

Monitor:

- Main URL: https://yourdomain.com
- Health endpoint: https://yourdomain.com/health.json
- API endpoint: https://api.yourdomain.com/health

---

## ✅ Post-Deployment Verification

### 1. Functional Testing

- [ ] **Homepage loads** (https://yourdomain.com)
- [ ] **All routes work** (no 404 errors)
- [ ] **API connectivity** (check Network tab)
- [ ] **Authentication works** (login/logout)
- [ ] **CRUD operations** work
- [ ] **Error handling** displays correctly
- [ ] **Loading states** show properly

### 2. Performance Testing

```bash
# Run Lighthouse on production
lighthouse https://yourdomain.com \
  --output html \
  --output-path lighthouse-production.html \
  --preset desktop

# Check Core Web Vitals
# Target scores:
# - Performance: >90
# - Accessibility: >95
# - Best Practices: >90
# - SEO: >95
```

### 3. Security Testing

- [ ] **HTTPS enforced** (http redirects to https)
- [ ] **Security headers present** (check with securityheaders.com)
- [ ] **No mixed content warnings**
- [ ] **CORS configured correctly**
- [ ] **CSP working** (no violations in console)
- [ ] **Tokens encrypted** (check Network > Storage)

### 4. SEO Verification

```bash
# Check robots.txt
curl https://yourdomain.com/robots.txt

# Check sitemap.xml
curl https://yourdomain.com/sitemap.xml

# Test Open Graph
# Facebook: https://developers.facebook.com/tools/debug/
# LinkedIn: https://www.linkedin.com/post-inspector/
# Twitter: https://cards-dev.twitter.com/validator

# Submit to Google Search Console
# - Add property
# - Verify ownership
# - Submit sitemap
```

### 5. Browser Testing

Test in:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Chrome Mobile
- [ ] Safari iOS

### 6. Monitoring Verification

- [ ] Sentry receiving events (trigger test error)
- [ ] Google Analytics tracking pageviews
- [ ] CloudWatch showing metrics
- [ ] Uptime monitor active
- [ ] Alerts configured and working

---

## 🔄 Rollback Procedures

### S3 + CloudFront Rollback

```bash
# Option 1: Restore from previous version
aws s3 sync s3://your-app-name-backup/ s3://your-app-name/

# Option 2: Re-deploy previous build
git checkout v1.0.0-previous
npm ci
npm run build:production
aws s3 sync dist/ s3://your-app-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### ECS Rollback

```bash
# Rollback to previous task definition revision
aws ecs update-service \
  --cluster your-cluster \
  --service user-management-ui \
  --task-definition user-management-ui:PREVIOUS_REVISION

# Or rollback using deployment circuit breaker (automatic)
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Blank Page After Deployment

**Symptoms:** White screen, no errors  
**Causes:**

- Base URL misconfiguration
- Missing environment variables
- CSP blocking resources

**Solution:**

```bash
# Check browser console for errors
# Verify VITE_BACKEND_URL is correct
# Check CSP in Network > Response Headers
# Ensure index.html loads correctly
```

#### 2. API Connection Fails

**Symptoms:** Network errors, CORS errors  
**Causes:**

- Wrong API URL
- CORS not configured on backend
- CSP blocking API requests

**Solution:**

```bash
# Verify VITE_API_BASE_URL
# Check backend CORS settings
# Update CSP connect-src directive
```

#### 3. Assets Not Loading (404)

**Symptoms:** Missing images, fonts, CSS  
**Causes:**

- Wrong base URL
- CloudFront cache not invalidated
- S3 bucket policy incorrect

**Solution:**

```bash
# Check S3 bucket policy (public read)
# Invalidate CloudFront cache
# Verify asset URLs in Network tab
```

#### 4. Slow Performance

**Symptoms:** Long load times  
**Causes:**

- No CDN caching
- Large bundle size
- Unoptimized images

**Solution:**

```bash
# Enable CloudFront caching
# Check bundle size: npm run analyze
# Optimize images (WebP, lazy loading)
# Enable gzip/brotli compression
```

---

## 📞 Support & Escalation

### Critical Issues (P0)

- **Security breach:** Immediate lockdown, notify security team
- **Service down:** Rollback immediately, investigate
- **Data loss:** Restore from backup, notify users

### Contact Information

- DevOps Team: devops@yourcompany.com
- Security Team: security@yourcompany.com
- On-call: [PagerDuty link]

---

## 📚 Additional Resources

- [AWS S3 Static Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Google Analytics 4](https://support.google.com/analytics/answer/10089681)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

**Document Version:** 1.0.0  
**Last Updated:** October 17, 2025  
**Status:** Production Ready

---

## ✅ Deployment Success Criteria

Your deployment is successful when:

- [ ] All tests passing (unit, E2E, Lighthouse)
- [ ] Application accessible at production URL
- [ ] All features working correctly
- [ ] Performance scores >90 (Lighthouse)
- [ ] Security headers present and correct
- [ ] Monitoring active (Sentry, Analytics)
- [ ] SEO assets indexed (Google Search Console)
- [ ] Error rate <1%
- [ ] Uptime >99.9%

**Congratulations! Your app is production-ready! 🎉**
