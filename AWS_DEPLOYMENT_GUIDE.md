# AWS CloudFront Deployment Guide

## Overview

This guide covers deploying the React User Management application to AWS using CloudFront for optimal global performance. AWS CloudFront handles compression, caching, and edge optimization automatically.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS CloudFront                          │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │   Edge Locations    │  │       Cache Behaviors           │  │
│  │  • 200+ worldwide   │  │  • HTML: No cache              │  │
│  │  • Brotli/Gzip     │  │  • Vendor chunks: 1 year       │  │
│  │  • HTTP/2 + HTTP/3  │  │  • Feature chunks: 1 week      │  │
│  └─────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      S3 Bucket      │
                         │  • React SPA files  │
                         │  • Static assets    │
                         │  • Versioned chunks │
                         └─────────────────────┘
```

## Bundle Optimization

### Chunk Strategy

Our Vite configuration creates optimized chunks for CloudFront caching:

```typescript
// Automatic chunking strategy
manualChunks: (id) => {
  // Vendor chunks (long cache - 1 year)
  if (id.includes('react') || id.includes('react-dom')) {
    return 'vendor-react'; // ~45KB gzipped
  }
  
  // Feature chunks (medium cache - 1 week)
  if (id.includes('/domains/auth/')) return 'feature-auth';
  if (id.includes('/domains/admin/')) return 'feature-admin';
  
  // Shared components (long cache - 1 year)
  if (id.includes('/shared/')) return 'shared-components';
}
```

### Cache Strategy

| Asset Type | Cache Duration | CloudFront Behavior |
|------------|----------------|---------------------|
| `index.html` | No cache | Immediate updates |
| `vendor-*.js` | 1 year | Long-term stability |
| `shared-*.js` | 1 year | Component library |
| `feature-*.js` | 1 week | Feature updates |
| `main-*.js` | 1 hour | App logic updates |
| `*.css` | 1 year | Style files |
| Images/Fonts | 1 day | Static assets |

## Prerequisites

### 1. AWS CLI Installation

```bash
# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
```

### 2. Required AWS Services

- **S3**: Static file hosting
- **CloudFront**: Global CDN
- **Route 53** (optional): DNS management
- **ACM** (optional): SSL certificates
- **IAM**: Deployment permissions

### 3. IAM Permissions

Create an IAM user with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:PutBucketWebsite"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetDistribution"
      ],
      "Resource": "*"
    }
  ]
}
```

## Quick Deployment

### 1. Build the Application

```bash
# Development build
npm run build

# Production build (optimized)
npm run build:prod
```

### 2. Analyze Bundle

```bash
# Analyze bundle with AWS CloudFront insights
npm run analyze-bundle
```

Expected output:
```
📊 Chunk Analysis (CloudFront Optimized)
────────────────────────────────────────────────────────────────────────────────
🟢 vendor-react         45.2 KB (long-term)
🟡 feature-admin        32.8 KB (short-term)
🟢 shared-components    28.5 KB (long-term)
🟡 feature-auth         24.1 KB (short-term)
🔴 main                 18.7 KB (no-cache)

💡 CloudFront Optimization Recommendations
──────────────────────────────────────────────────────────────
🚀 Good chunk granularity for HTTP/2 parallel loading
📦 Create more vendor chunks for better CloudFront caching
```

### 3. Deploy to AWS

```bash
# Set environment variables
export S3_BUCKET=your-bucket-name
export CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
export AWS_PROFILE=default

# Deploy
npm run deploy

# Production deployment
npm run deploy:prod
```

## CloudFront Infrastructure Setup

### 1. Create CloudFront Stack

```bash
# Deploy CloudFront infrastructure
aws cloudformation deploy \
  --template-file aws/cloudfront-template.yml \
  --stack-name usermn-frontend \
  --parameter-overrides \
    DomainName=usermn.yourdomain.com \
    CertificateArn=arn:aws:acm:us-east-1:123456789:certificate/xxx \
  --capabilities CAPABILITY_IAM
```

### 2. Get Stack Outputs

```bash
# Get S3 bucket name
aws cloudformation describe-stacks \
  --stack-name usermn-frontend \
  --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
  --output text

# Get CloudFront distribution ID
aws cloudformation describe-stacks \
  --stack-name usermn-frontend \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text
```

## Manual CloudFront Setup

If you prefer manual setup:

### 1. Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://your-bucket-name --region us-east-1

# Enable website hosting
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document index.html
```

### 2. Create CloudFront Distribution

Use AWS Console or CLI:

```json
{
  "CallerReference": "usermn-frontend-2024",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-Origin",
        "DomainName": "your-bucket-name.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-Origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "MinTTL": 0,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    }
  }
}
```

## Performance Monitoring

### 1. CloudWatch Metrics

Monitor these CloudFront metrics:

- **OriginLatency**: S3 response time
- **CacheHitRate**: CDN efficiency
- **BytesDownloaded**: Bandwidth usage
- **Requests**: Traffic volume

### 2. Real User Monitoring

```javascript
// Client-side performance tracking (development only)
if (import.meta.env.MODE === 'development') {
  // AWS CloudWatch RUM handles production monitoring
  console.log('Performance metrics sent to CloudWatch');
}
```

## Deployment Pipeline Integration

### GitHub Actions Example

```yaml
name: Deploy to AWS CloudFront
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build:prod
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to AWS
        run: npm run deploy:prod
        env:
          S3_BUCKET: ${{ secrets.S3_BUCKET }}
          CLOUDFRONT_DISTRIBUTION_ID: ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}
```

## Troubleshooting

### Common Issues

1. **403 Forbidden Error**
   - Check S3 bucket permissions
   - Verify CloudFront Origin Access Control

2. **Stale Content After Deployment**
   - Invalidation may take 5-10 minutes
   - Check cache headers in browser DevTools

3. **Slow Initial Load**
   - Verify HTTP/2 is enabled
   - Check chunk sizes with `npm run analyze-bundle`

### Debug Commands

```bash
# Check S3 sync status
aws s3 ls s3://your-bucket-name --recursive

# Check CloudFront cache behavior
aws cloudfront get-distribution --id E1234567890ABC

# Test website directly from S3
curl -I http://your-bucket-name.s3-website-us-east-1.amazonaws.com

# Test website through CloudFront
curl -I https://your-cloudfront-domain.cloudfront.net
```

## Cost Optimization

### 1. CloudFront Pricing

- **Data Transfer**: $0.085/GB (first 10TB)
- **Requests**: $0.0075/10,000 requests
- **Invalidations**: $0.005/path (first 1,000 free)

### 2. S3 Pricing

- **Storage**: $0.023/GB/month
- **Requests**: $0.0004/1,000 PUT requests

### 3. Cost-Saving Tips

- Use intelligent chunking for better cache hit rates
- Minimize invalidations by versioning assets
- Enable CloudFront compression
- Use appropriate cache TTLs

## Security Best Practices

### 1. S3 Security

- Block all public access to S3 bucket
- Use CloudFront Origin Access Control (OAC)
- Enable S3 bucket versioning
- Configure bucket lifecycle policies

### 2. CloudFront Security

- Enable AWS WAF for DDoS protection
- Use security headers (HSTS, CSP, etc.)
- Restrict access by geography if needed
- Monitor access logs

### 3. Content Security

```javascript
// Security headers in CloudFront response policy
{
  "Strict-Transport-Security": "max-age=31536000; includeSubdomains",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

## Next Steps

1. **Set up monitoring**: CloudWatch dashboards and alarms
2. **Implement CI/CD**: Automated deployments via GitHub Actions
3. **Add staging environment**: Separate CloudFront distribution
4. **Enable AWS WAF**: Additional security layer
5. **Configure backup**: S3 cross-region replication

## Resources

- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [React Production Build](https://reactjs.org/docs/optimizing-performance.html#use-the-production-build)