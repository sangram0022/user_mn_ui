# Terraform Infrastructure - S3 + CloudFront Static Website

## Overview

This Terraform configuration deploys a production-ready static website infrastructure on AWS using:
- **S3** for static file hosting
- **CloudFront** for global CDN distribution
- **WAF** for security and DDoS protection
- **Route53** for DNS management (optional)
- **CloudWatch** for monitoring and alarms

## Quick Start

### Prerequisites

- AWS CLI configured with credentials
- Terraform >= 1.7.0 installed
- Appropriate AWS permissions (S3, CloudFront, WAF, Route53, CloudWatch)

### Initialize Terraform

```bash
terraform init
```

### Plan Changes

```bash
# Development
terraform plan -var-file=dev.tfvars -out=tfplan-dev

# Staging
terraform plan -var-file=staging.tfvars -out=tfplan-staging

# Production
terraform plan -var-file=production.tfvars -out=tfplan-production
```

### Apply Infrastructure

```bash
# Development
terraform apply tfplan-dev

# Staging
terraform apply tfplan-staging

# Production (requires confirmation)
terraform apply tfplan-production
```

### View Outputs

```bash
# All outputs
terraform output

# Specific output
terraform output website_url
terraform output gitlab_ci_variables
```

## File Structure

```
terraform/
├── main.tf               # Main infrastructure definition (750 lines)
├── variables.tf          # Input variables (25 variables)
├── outputs.tf            # Output values and deployment info
├── dev.tfvars            # Development environment config
├── staging.tfvars        # Staging environment config
└── production.tfvars     # Production environment config
```

## Configuration Files

### Development (`dev.tfvars`)

Optimized for cost savings during development:

```hcl
environment         = "dev"
enable_versioning   = false  # Save costs
enable_waf          = false  # Save costs
enable_logging      = false  # Save costs
enable_cloudwatch_alarms = false
```

**Estimated Cost**: ~$5/month

### Staging (`staging.tfvars`)

Production-like environment for testing:

```hcl
environment         = "staging"
enable_versioning   = true
enable_waf          = true   # Test security rules
enable_logging      = true
waf_rate_limit      = 3000
```

**Estimated Cost**: ~$20/month

### Production (`production.tfvars`)

Full production configuration with all features:

```hcl
environment              = "production"
enable_versioning        = true   # CRITICAL for rollbacks
enable_waf               = true   # CRITICAL for security
enable_logging           = true   # CRITICAL for auditing
enable_origin_shield     = true   # Better cache hit ratio
cloudfront_price_class   = "PriceClass_All"  # Global CDN
```

**Estimated Cost**: ~$25/month

## Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `project_name` | Project name | `react-app` |
| `environment` | Environment | `dev`, `staging`, `production` |
| `aws_region` | AWS region | `us-east-1` |

### Optional Variables (with Defaults)

| Variable | Description | Default |
|----------|-------------|---------|
| `s3_bucket_name` | S3 bucket name (auto-generated if empty) | `""` |
| `enable_versioning` | Enable S3 versioning | `true` |
| `domain_names` | Custom domains for CloudFront | `[]` |
| `acm_certificate_arn` | ACM certificate ARN (us-east-1) | `""` |
| `enable_waf` | Enable WAF | `true` |
| `waf_rate_limit` | Max requests per 5 min per IP | `2000` |
| `enable_spa_mode` | Redirect 404 to index.html | `true` |
| `enable_logging` | Enable S3/CloudFront logs | `true` |
| `cloudfront_price_class` | CloudFront price class | `PriceClass_100` |

See `variables.tf` for complete list with descriptions and validation rules.

## Outputs

### Infrastructure Outputs

```bash
s3_bucket_id                   # S3 bucket ID
s3_bucket_arn                  # S3 bucket ARN
cloudfront_distribution_id     # CloudFront distribution ID
cloudfront_domain_name         # CloudFront domain name
website_url                    # Primary website URL
```

### GitLab CI/CD Variables

```bash
terraform output gitlab_ci_variables
```

Returns JSON with required GitLab CI/CD variables:
- `S3_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID`
- `AWS_REGION`
- `WEBSITE_URL`

Copy these to **Settings > CI/CD > Variables** in GitLab.

### Deployment Commands

```bash
terraform output deployment_commands
```

Returns useful AWS CLI commands:
- S3 sync command
- CloudFront invalidation command
- Status check command

## Resources Created

### S3 Bucket

- **Purpose**: Static website hosting
- **Encryption**: AES-256 server-side encryption
- **Versioning**: Enabled (production/staging)
- **Access**: Blocked (CloudFront-only via OAC)
- **Lifecycle**: Auto-expire old versions after 30 days

### CloudFront Distribution

- **Edge Locations**: 400+ globally
- **HTTP Version**: HTTP/2 and HTTP/3
- **SSL/TLS**: TLS 1.2+ minimum
- **Caching**: 3 custom cache policies
  - Optimized (1 day TTL)
  - Static assets (1 year TTL)
  - No cache for HTML (0 TTL)

### Cache Policies

1. **Optimized Policy** - General application files
   - Default TTL: 1 day
   - Max TTL: 1 year
   - Brotli/Gzip compression enabled

2. **Static Assets Policy** - CSS, JS, images, fonts
   - TTL: 1 year (immutable)
   - Brotli/Gzip compression enabled

3. **No Cache Policy** - HTML files
   - TTL: 0 (always fresh)
   - Ensures instant updates

### Response Headers Policy

Security headers applied to all responses:
- `Strict-Transport-Security`: 2 years, includeSubDomains
- `X-Content-Type-Options`: nosniff
- `X-Frame-Options`: DENY
- `X-XSS-Protection`: 1; mode=block
- `Referrer-Policy`: strict-origin-when-cross-origin
- `Content-Security-Policy`: Configurable per environment

### WAF Web ACL

Protection against common attacks:
- **Rate Limiting**: 2000 requests per 5 minutes per IP
- **AWS Managed Rules**:
  - Core Rule Set (common vulnerabilities)
  - Known Bad Inputs (malicious payloads)
- **CloudWatch Metrics**: Enabled for monitoring

### Route53 DNS (Optional)

If `create_route53_records = true`:
- A record (IPv4)
- AAAA record (IPv6)
- Alias to CloudFront distribution

### CloudWatch Alarms

- **4xx Error Rate**: Threshold 5% (production)
- **5xx Error Rate**: Threshold 1% (production)
- **Actions**: SNS notifications (if configured)

## Common Operations

### Initialize for First Time

```bash
terraform init
```

### Switch Environments

```bash
# Using workspaces
terraform workspace new staging
terraform workspace select staging
terraform apply -var-file=staging.tfvars
```

### Update Infrastructure

```bash
# Make changes to .tfvars or main.tf
terraform plan -var-file=production.tfvars
terraform apply -var-file=production.tfvars
```

### View State

```bash
terraform show
```

### Import Existing Resources

```bash
# If you have existing S3 bucket
terraform import aws_s3_bucket.website my-existing-bucket
```

### Destroy Infrastructure

```bash
# Development only
terraform destroy -var-file=dev.tfvars

# Production (requires approval)
terraform destroy -var-file=production.tfvars
```

## Security Best Practices

1. **Use Remote State**: Store state in S3 with DynamoDB locking
   ```bash
   terraform init -backend-config="bucket=my-state-bucket"
   ```

2. **Enable Versioning**: Always enabled for production S3 buckets

3. **Use WAF**: Enable for staging and production

4. **Encrypt Everything**: S3 encryption enabled by default

5. **Least Privilege**: CloudFront OAC provides minimal S3 access

6. **Monitor Alarms**: Configure SNS topic for CloudWatch alerts

7. **Review Logs**: Enable logging for production environments

## Cost Optimization

### Development Environment

- Disable WAF: Save $15/month
- Disable logging: Save storage costs
- Disable versioning: Save storage costs
- Use PriceClass_100: US/Europe only

**Estimated**: ~$5/month

### Production Environment

- Enable Origin Shield: Better cache hit ratio
- Use appropriate price class based on audience
- Configure lifecycle policies: Auto-expire old versions
- Use Brotli compression: Reduce bandwidth costs

**Estimated**: ~$25/month (vs. $300+ for ECS/Fargate)

## Troubleshooting

### Issue: Terraform Apply Fails with "Bucket Already Exists"

**Solution**: Delete existing bucket or choose different name
```bash
aws s3 ls | grep react-app
aws s3 rb s3://react-app-dev-123456789 --force
```

### Issue: CloudFront Distribution Not Accessible

**Check Status**:
```bash
aws cloudfront get-distribution --id <distribution-id> --query 'Distribution.Status'
```

Distributions take 15-20 minutes to deploy initially.

### Issue: 403 Forbidden Errors

**Cause**: S3 bucket policy not allowing CloudFront OAC

**Solution**: Re-apply Terraform to update bucket policy
```bash
terraform apply -var-file=staging.tfvars
```

### Issue: Changes Not Visible After Deployment

**Solution**: Invalidate CloudFront cache
```bash
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*"
```

## Monitoring

### CloudWatch Metrics

View in AWS Console: **CloudWatch > Dashboards**

Key metrics to monitor:
- Requests
- Bytes Downloaded
- 4xx/5xx Error Rate
- Cache Hit Rate

### Logs

**S3 Access Logs**: `s3://[bucket]-logs/s3-access-logs/`
**CloudFront Logs**: `s3://[bucket]-logs/cloudfront-logs/`

Query logs with Athena for detailed analysis.

## Validation

### Validate Configuration

```bash
terraform validate
```

### Check Formatting

```bash
terraform fmt -check
```

### Lint with tflint

```bash
tflint
```

## Support

For detailed documentation, see:
- **Main Guide**: `../S3_CLOUDFRONT_DEPLOYMENT_GUIDE.md`
- **Migration Summary**: `../INFRASTRUCTURE_MIGRATION_SUMMARY.md`

For issues:
1. Check Terraform outputs
2. Review AWS Console
3. Check CloudWatch logs
4. Contact DevOps team

## Additional Resources

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [CloudFront Best Practices](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/best-practices.html)
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [WAF Documentation](https://docs.aws.amazon.com/waf/latest/developerguide/what-is-aws-waf.html)
