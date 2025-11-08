# Deployment Runbook - S3 + CloudFront

## 🎯 Purpose

This runbook provides step-by-step procedures for deploying and managing the React 19 application on AWS S3 + CloudFront infrastructure.

---

## 📋 Pre-Deployment Checklist

### Prerequisites

- [ ] AWS CLI installed and configured
- [ ] Terraform >= 1.7.0 installed
- [ ] Node.js 20+ installed
- [ ] GitLab access with appropriate permissions
- [ ] AWS credentials with required permissions
- [ ] Access to AWS Console (for verification)

### Required AWS Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "cloudfront:*",
        "wafv2:*",
        "route53:*",
        "acm:*",
        "cloudwatch:*",
        "sns:*"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 🚀 Initial Deployment (First Time)

### Step 1: Review Infrastructure Code

```bash
cd d:\code\reactjs\usermn1\terraform
```

**Files to review:**
- `main.tf` - Infrastructure definition
- `variables.tf` - Variable definitions
- `dev.tfvars` / `staging.tfvars` / `production.tfvars` - Environment configs

### Step 2: Initialize Terraform

```bash
terraform init
```

**Expected output:**
```
Terraform has been successfully initialized!
```

**Verify:**
```bash
terraform version
# Should show: Terraform v1.7.0 or higher
```

### Step 3: Plan Infrastructure (Development)

```bash
terraform plan -var-file=dev.tfvars -out=tfplan-dev
```

**Review output carefully:**
- Number of resources to create
- S3 bucket name
- CloudFront distribution settings
- WAF rules (if enabled)

**Estimated resources:** ~15-20 resources

### Step 4: Apply Infrastructure

```bash
terraform apply tfplan-dev
```

**Wait time:** 15-20 minutes (CloudFront distribution deployment)

**Monitor progress:**
- Watch for errors
- Note any warnings
- Copy outputs at completion

### Step 5: Save Terraform Outputs

```bash
terraform output -json > outputs.json
terraform output website_url
terraform output s3_bucket_id
terraform output cloudfront_distribution_id
```

**Save these values** - needed for GitLab CI/CD and deployment.

### Step 6: Configure GitLab CI/CD Variables

Navigate to: **GitLab > Settings > CI/CD > Variables**

Add the following variables:

| Variable Name | Value | Protected | Masked |
|---------------|-------|-----------|--------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key | Yes | Yes |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key | Yes | Yes |
| `AWS_DEFAULT_REGION` | `us-east-1` | No | No |
| `S3_BUCKET_STAGING` | From terraform output | No | No |
| `S3_BUCKET_PRODUCTION` | From terraform output | Yes | No |
| `CLOUDFRONT_DISTRIBUTION_ID_STAGING` | From terraform output | No | No |
| `CLOUDFRONT_DISTRIBUTION_ID_PRODUCTION` | From terraform output | Yes | No |

### Step 7: Build Application

```bash
cd d:\code\reactjs\usermn1
npm run build
```

**Verify build:**
```bash
# Check dist/ folder exists
dir dist\
# Should contain: index.html, assets/, health.html, etc.
```

### Step 8: Deploy to S3

```bash
make deploy-s3-dev
```

**Or manually:**
```bash
aws s3 sync dist/ s3://[bucket-name] --delete
```

### Step 9: Invalidate CloudFront Cache

```bash
make invalidate-cloudfront-dev
```

**Or manually:**
```bash
aws cloudfront create-invalidation \
  --distribution-id [distribution-id] \
  --paths "/*"
```

### Step 10: Verify Deployment

```bash
# Get website URL
terraform output website_url

# Health check
make health-check-dev

# Manual verification
curl -I https://[cloudfront-domain]/
curl -I https://[cloudfront-domain]/health.html
```

**Expected:**
- HTTP 200 status
- Correct content-type headers
- Cache-control headers present

---

## 🔄 Regular Deployments

### Staging Deployment (Automatic via GitLab)

1. **Create branch and make changes**
   ```bash
   git checkout -b feature/your-feature
   # Make changes
   git add .
   git commit -m "feat: your feature"
   git push origin feature/your-feature
   ```

2. **Create merge request**
   - Navigate to GitLab
   - Create MR to `main` branch
   - Wait for CI/CD pipeline to pass

3. **Merge to main**
   - Review and approve MR
   - Merge to `main` branch
   - **Staging deployment automatically triggers**

4. **Verify staging deployment**
   ```bash
   # Check GitLab pipeline logs
   # Visit staging URL
   curl -I https://[staging-cloudfront-domain]/
   ```

### Production Deployment (Manual Trigger)

1. **Verify staging deployment**
   - Test all functionality on staging
   - Run smoke tests
   - Check for errors in logs

2. **Navigate to GitLab pipeline**
   - Go to **CI/CD > Pipelines**
   - Find successful pipeline from `main` branch
   - Locate **"Deploy to Production"** stage

3. **Click "Deploy to Production"** (manual action)
   - Review deployment details
   - Confirm deployment

4. **Monitor deployment**
   - Watch pipeline logs
   - Check for errors
   - Note completion time (~3-5 minutes)

5. **Verify production deployment**
   ```bash
   # Health check
   curl -f https://[production-domain]/health.html

   # Test main page
   curl -I https://[production-domain]/

   # Check CloudFront status
   make check-cloudfront-status
   ```

6. **Post-deployment checks**
   - [ ] Website loads correctly
   - [ ] No console errors
   - [ ] API calls working
   - [ ] Authentication working
   - [ ] All routes accessible
   - [ ] Mobile responsive

---

## 🆘 Rollback Procedures

### Scenario 1: Bad Deployment Detected Within Minutes

**Quick Rollback via S3 Versioning:**

```bash
# 1. Get S3 bucket name
terraform output s3_bucket_id

# 2. List recent versions of index.html
aws s3api list-object-versions \
  --bucket [bucket-name] \
  --prefix "index.html" \
  --max-items 5

# 3. Restore previous version
aws s3api copy-object \
  --bucket [bucket-name] \
  --copy-source "[bucket-name]/index.html?versionId=[version-id]" \
  --key "index.html"

# 4. Invalidate CloudFront cache
make invalidate-cloudfront-production
```

**Or use Makefile:**
```bash
make rollback-s3-production
```

### Scenario 2: Bad Deployment Detected Hours Later

**Full Rollback via GitLab:**

1. **Navigate to GitLab**
   - Go to **CI/CD > Pipelines**
   - Find last successful production deployment

2. **Click "Rollback Production"** (manual action)
   - This restores from S3 backup
   - Automatically invalidates cache

3. **Verify rollback**
   ```bash
   curl -f https://[production-domain]/health.html
   ```

### Scenario 3: Critical Issue - Immediate Action Needed

**Emergency Disable:**

```bash
# 1. Disable CloudFront distribution (stops serving traffic)
aws cloudfront get-distribution-config --id [distribution-id] > config.json

# 2. Edit config.json: Set "Enabled": false

# 3. Get ETag
aws cloudfront get-distribution --id [distribution-id] --query 'ETag' --output text

# 4. Update distribution
aws cloudfront update-distribution \
  --id [distribution-id] \
  --if-match [etag] \
  --distribution-config file://config.json

# 5. Notify team immediately
```

**Re-enable after fix:**
```bash
# Edit config.json: Set "Enabled": true
aws cloudfront update-distribution \
  --id [distribution-id] \
  --if-match [new-etag] \
  --distribution-config file://config.json
```

---

## 🔍 Troubleshooting

### Issue 1: Build Fails

**Symptoms:** `npm run build` fails

**Diagnosis:**
```bash
# Check Node version
node --version  # Should be 20+

# Check dependencies
npm ls

# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Common causes:**
- Outdated dependencies
- Node version mismatch
- Corrupted node_modules
- TypeScript errors

### Issue 2: Terraform Apply Fails

**Symptoms:** `terraform apply` errors

**Diagnosis:**
```bash
# Validate configuration
terraform validate

# Check state
terraform state list

# Re-initialize
terraform init -reconfigure
```

**Common causes:**
- S3 bucket name conflict (already exists)
- Insufficient AWS permissions
- State file locked (DynamoDB)
- Provider version mismatch

**Resolution:**
```bash
# If bucket exists
aws s3 rb s3://[bucket-name] --force

# If state locked
terraform force-unlock [lock-id]

# If provider issue
terraform init -upgrade
```

### Issue 3: CloudFront 403 Errors

**Symptoms:** Website returns 403 Forbidden

**Diagnosis:**
```bash
# Check bucket policy
aws s3api get-bucket-policy --bucket [bucket-name]

# Check CloudFront OAC
aws cloudfront get-origin-access-control --id [oac-id]

# Check S3 objects exist
aws s3 ls s3://[bucket-name]/
```

**Common causes:**
- S3 bucket policy not allowing CloudFront
- Files not uploaded to S3
- CloudFront OAC misconfigured

**Resolution:**
```bash
# Re-apply Terraform to fix bucket policy
terraform apply -var-file=production.tfvars

# Re-upload files
make deploy-s3-production
```

### Issue 4: Stale Content After Deployment

**Symptoms:** Old content still showing

**Diagnosis:**
```bash
# Check CloudFront cache status
aws cloudfront list-invalidations --distribution-id [distribution-id]

# Check cache headers
curl -I https://[cloudfront-domain]/
```

**Common causes:**
- Cache not invalidated
- Browser cache
- CDN edge cache

**Resolution:**
```bash
# Invalidate entire cache
make invalidate-cloudfront-production

# Or selective invalidation
make invalidate-cloudfront-selective PATHS="/index.html /assets/index-*.js"

# Check status
aws cloudfront get-invalidation \
  --distribution-id [distribution-id] \
  --id [invalidation-id]
```

### Issue 5: High Error Rates

**Symptoms:** CloudWatch alarms triggering

**Diagnosis:**
```bash
# Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name 5xxErrorRate \
  --dimensions Name=DistributionId,Value=[distribution-id] \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average

# Check CloudFront logs
aws s3 ls s3://[logs-bucket]/cloudfront-logs/
```

**Common causes:**
- S3 bucket issues
- Missing files (404)
- WAF blocking legitimate traffic
- DDoS attack

**Resolution:**
```bash
# Check S3 bucket health
aws s3 ls s3://[bucket-name]/

# Review WAF rules
aws wafv2 list-web-acls --scope CLOUDFRONT --region us-east-1

# Temporary: Increase rate limits
# Edit production.tfvars: waf_rate_limit = 5000
terraform apply -var-file=production.tfvars
```

---

## 📊 Monitoring

### Daily Checks

**Morning routine:**
```bash
# 1. Check health
make health-check-production

# 2. Check CloudWatch alarms
aws cloudwatch describe-alarms \
  --alarm-names [project-name]-production-cloudfront-4xx-errors \
  [project-name]-production-cloudfront-5xx-errors

# 3. Check recent deployments
# Navigate to GitLab > CI/CD > Pipelines

# 4. Review metrics
# Navigate to AWS Console > CloudWatch > Dashboards
```

### Key Metrics to Monitor

1. **Request Count** - Normal traffic patterns?
2. **Error Rates** - 4xx < 5%, 5xx < 1%
3. **Cache Hit Rate** - Should be > 80%
4. **Origin Latency** - Should be < 1000ms
5. **WAF Blocked Requests** - Unusual spikes?

### Weekly Reviews

- [ ] Review CloudWatch logs
- [ ] Check S3 storage costs
- [ ] Review CloudFront bandwidth usage
- [ ] Check WAF blocked request patterns
- [ ] Review access logs for anomalies
- [ ] Update dependencies if needed

---

## 🔐 Security Procedures

### Rotate AWS Credentials

**Quarterly rotation:**

1. **Create new IAM access key**
   ```bash
   aws iam create-access-key --user-name [username]
   ```

2. **Update GitLab CI/CD variables**
   - Replace `AWS_ACCESS_KEY_ID`
   - Replace `AWS_SECRET_ACCESS_KEY`

3. **Test deployment**
   ```bash
   # Trigger pipeline manually
   # Verify deployment succeeds
   ```

4. **Delete old access key**
   ```bash
   aws iam delete-access-key \
     --user-name [username] \
     --access-key-id [old-key-id]
   ```

### Review Security

**Monthly security review:**

- [ ] Review IAM permissions
- [ ] Check S3 bucket policies
- [ ] Review CloudFront security headers
- [ ] Check WAF rule effectiveness
- [ ] Review CloudWatch alarm configurations
- [ ] Check SSL certificate expiration
- [ ] Review access logs for suspicious activity

---

## 📞 Emergency Contacts

**During incidents, contact in this order:**

1. **DevOps On-Call**: [Phone Number]
2. **Engineering Lead**: [Phone Number]
3. **CTO**: [Phone Number]

**Escalation Matrix:**

| Severity | Response Time | Escalation |
|----------|--------------|------------|
| P1 (Critical) | 15 minutes | Immediate |
| P2 (High) | 1 hour | After 2 hours |
| P3 (Medium) | 4 hours | After 8 hours |
| P4 (Low) | Next business day | N/A |

---

## 📝 Deployment Log Template

**Record each production deployment:**

```
Date: YYYY-MM-DD HH:MM UTC
Environment: Production
Deployed By: [Name]
GitLab Pipeline: [URL]
Git Commit: [SHA]
Changes: [Brief description]
Pre-Deployment Tests: [Pass/Fail]
Deployment Duration: [Minutes]
Post-Deployment Tests: [Pass/Fail]
Issues Encountered: [None/Description]
Rollback Required: [Yes/No]
Notes: [Additional notes]
```

---

## 🎓 Training Resources

**New team members should review:**

1. This deployment runbook
2. `S3_CLOUDFRONT_DEPLOYMENT_GUIDE.md`
3. `INFRASTRUCTURE_MIGRATION_SUMMARY.md`
4. `terraform/README.md`
5. GitLab CI/CD pipeline configuration
6. AWS CloudWatch dashboard

**Hands-on training:**

1. Deploy to development environment
2. Perform rollback in development
3. Monitor CloudWatch metrics
4. Review access logs
5. Shadow production deployment

---

**Last Updated**: 2025-11-08  
**Version**: 1.0.0  
**Owner**: DevOps Team  
**Review Frequency**: Quarterly
