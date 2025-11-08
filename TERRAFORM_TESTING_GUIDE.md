# Terraform Testing Guide - S3 + CloudFront Deployment

## 🎯 Purpose

This guide provides step-by-step instructions for testing the Terraform infrastructure before deploying to production.

---

## 📋 Pre-Test Checklist

### Requirements

- [x] AWS CLI installed and configured
- [x] Terraform >= 1.7.0 installed
- [x] AWS credentials with required permissions
- [x] Access to d:\code\reactjs\usermn1\terraform directory

### Verify Tools

```powershell
# Check AWS CLI
aws --version
# Expected: aws-cli/2.x

# Check AWS credentials
aws sts get-caller-identity
# Should return your AWS account info

# Check Terraform
terraform version
# Expected: Terraform v1.7.0 or higher

# Check Git status (should be clean)
cd d:\code\reactjs\usermn1
git status
```

---

## 🧪 Test Phase 1: Validation (5 minutes)

### Step 1.1: Initialize Terraform

```powershell
cd d:\code\reactjs\usermn1\terraform

# Initialize (downloads providers)
terraform init

# Expected output:
# ✓ Provider hashicorp/aws downloaded
# ✓ Terraform has been successfully initialized!
```

**Verify:**
- `.terraform` directory created
- `.terraform.lock.hcl` file created
- No error messages

### Step 1.2: Format Check

```powershell
# Check formatting
terraform fmt -check

# Expected: No output (files are formatted)
# If files listed, run: terraform fmt -recursive
```

### Step 1.3: Validate Configuration

```powershell
# Validate syntax
terraform validate

# Expected output:
# Success! The configuration is valid.
```

**If errors:**
- Review error messages carefully
- Check file syntax in reported files
- Verify variable types match usage

### Step 1.4: Lint with tflint (Optional)

```powershell
# Install tflint (if not installed)
choco install tflint

# Run linter
tflint --init
tflint

# Review any warnings
```

---

## 🧪 Test Phase 2: Plan Review (10 minutes)

### Step 2.1: Plan for Development

```powershell
# Generate plan
terraform plan -var-file=dev.tfvars -out=tfplan-dev

# Save plan in human-readable format
terraform show tfplan-dev > plan-dev.txt
```

**Review plan-dev.txt carefully:**

Expected resources (~15-20):
- `aws_s3_bucket.website` - Main bucket
- `aws_s3_bucket_website_configuration.website` - Website config
- `aws_s3_bucket_versioning.website` - Versioning (disabled in dev)
- `aws_s3_bucket_public_access_block.website` - Public access block
- `aws_s3_bucket_policy.website` - Bucket policy for CloudFront
- `aws_cloudfront_origin_access_control.website` - OAC
- `aws_cloudfront_cache_policy.static_assets` - Assets cache policy
- `aws_cloudfront_cache_policy.html_files` - HTML cache policy
- `aws_cloudfront_cache_policy.api_requests` - API cache policy
- `aws_cloudfront_distribution.website` - Main distribution
- `aws_cloudwatch_metric_alarm.cloudfront_4xx_errors` - 4xx alarm
- `aws_cloudwatch_metric_alarm.cloudfront_5xx_errors` - 5xx alarm

**Verify in plan:**
- ✅ Bucket name: `[project-name]-dev-website`
- ✅ CloudFront enabled: `true`
- ✅ Price class: `PriceClass_100` (North America, Europe)
- ✅ Versioning: `Disabled` (dev environment)
- ✅ WAF: Not created (dev environment)
- ✅ Logging: Not created (dev environment)
- ✅ No resources destroyed (first deployment)

### Step 2.2: Cost Estimate (Optional)

```powershell
# Using Infracost (if installed)
infracost breakdown --path .

# Expected dev cost: ~$5/month
# - S3: ~$0.50
# - CloudFront: ~$4-5 (depends on traffic)
```

### Step 2.3: Security Review

```powershell
# Using Checkov (if installed)
checkov -d . --framework terraform

# Review any security findings
```

**Manual security checks:**
- ✅ S3 bucket has public access blocked
- ✅ S3 bucket policy only allows CloudFront OAC
- ✅ CloudFront uses OAC (not legacy OAI)
- ✅ HTTPS-only traffic enforced
- ✅ No hardcoded credentials in tfvars

---

## 🧪 Test Phase 3: Development Deployment (30 minutes)

### Step 3.1: Apply Infrastructure

```powershell
# Apply the plan
terraform apply tfplan-dev

# Type: yes
```

**Monitor output:**
- S3 bucket creation: ~10 seconds
- S3 configurations: ~20 seconds
- CloudFront distribution: ~15-20 minutes ⏳

**Expected duration:** 15-25 minutes total

### Step 3.2: Save Outputs

```powershell
# After successful apply, save outputs
terraform output -json > outputs-dev.json

# View specific outputs
terraform output website_url
terraform output s3_bucket_id
terraform output cloudfront_distribution_id
terraform output cloudfront_domain
```

**Expected outputs:**
```
website_url = "https://d1234567890.cloudfront.net"
s3_bucket_id = "usermn-dev-website"
cloudfront_distribution_id = "E1234567890ABC"
cloudfront_domain = "d1234567890.cloudfront.net"
```

### Step 3.3: Verify Resources in AWS Console

**S3 Bucket:**
1. Navigate to AWS Console > S3
2. Find bucket: `[project-name]-dev-website`
3. Check:
   - ✅ Versioning: Disabled
   - ✅ Public access: Blocked
   - ✅ Bucket policy: Allows CloudFront OAC
   - ✅ Static website hosting: Enabled

**CloudFront Distribution:**
1. Navigate to AWS Console > CloudFront
2. Find distribution ID from output
3. Check:
   - ✅ Status: Deployed
   - ✅ State: Enabled
   - ✅ Price class: PriceClass_100
   - ✅ Origins: S3 bucket with OAC
   - ✅ Behaviors: 3 cache policies configured
   - ✅ HTTPS only: Yes

**CloudWatch Alarms:**
1. Navigate to AWS Console > CloudWatch > Alarms
2. Find alarms: `[project-name]-dev-cloudfront-*`
3. Check:
   - ✅ 4xx errors alarm: OK state
   - ✅ 5xx errors alarm: OK state

---

## 🧪 Test Phase 4: Application Deployment (10 minutes)

### Step 4.1: Build Application

```powershell
cd d:\code\reactjs\usermn1

# Build
npm run build

# Expected: Build completes in < 5 seconds
# Output: dist/ directory with ~20-30 files
```

**Verify build output:**
```powershell
dir dist\

# Should contain:
# - index.html
# - assets/ (JS/CSS bundles)
# - health.html
# - robots.txt
# - sitemap.xml
```

### Step 4.2: Deploy to S3

```powershell
# Get bucket name
cd terraform
$BUCKET = terraform output -raw s3_bucket_id

# Deploy files
cd ..
aws s3 sync dist/ s3://$BUCKET --delete

# Expected: ~20-30 files uploaded
```

**Verify:**
```powershell
# List files in S3
aws s3 ls s3://$BUCKET/ --recursive

# Check file count
(aws s3 ls s3://$BUCKET/ --recursive | Measure-Object).Count
# Expected: ~20-30 files
```

### Step 4.3: Invalidate CloudFront Cache

```powershell
# Get distribution ID
cd terraform
$DIST_ID = terraform output -raw cloudfront_distribution_id

# Create invalidation
aws cloudfront create-invalidation `
  --distribution-id $DIST_ID `
  --paths "/*"

# Note the invalidation ID from output
```

**Wait for invalidation:**
```powershell
# Check status (replace with your invalidation ID)
aws cloudfront get-invalidation `
  --distribution-id $DIST_ID `
  --id I1234567890ABC

# Wait until Status: Completed (usually 1-5 minutes)
```

---

## 🧪 Test Phase 5: Functional Testing (15 minutes)

### Step 5.1: Health Check

```powershell
# Get website URL
cd terraform
$URL = terraform output -raw website_url

# Health check
curl.exe -I "$URL/health.html"

# Expected:
# HTTP/2 200
# content-type: text/html
# x-cache: Miss from cloudfront (first request)
```

### Step 5.2: Main Page Test

```powershell
# Test main page
curl.exe -I $URL

# Expected:
# HTTP/2 200
# content-type: text/html
# x-cache: Miss from cloudfront (first request)

# Test again (should be cached)
curl.exe -I $URL

# Expected:
# x-cache: Hit from cloudfront
```

### Step 5.3: Cache Behavior Test

**Test static assets caching:**
```powershell
# Find a JS file in dist/assets
$JS_FILE = (Get-ChildItem dist\assets\*.js | Select-Object -First 1).Name

# Test JS file
curl.exe -I "$URL/assets/$JS_FILE"

# Expected:
# HTTP/2 200
# cache-control: public, max-age=31536000 (1 year)
# x-cache: Miss from cloudfront (first request)
```

### Step 5.4: Browser Testing

Open browser and navigate to CloudFront URL:
```
https://d1234567890.cloudfront.net
```

**Manual checks:**
- ✅ Page loads correctly
- ✅ No console errors (F12 > Console)
- ✅ All assets load correctly
- ✅ Navigation works
- ✅ API calls work (if applicable)
- ✅ Mobile responsive (F12 > Device toolbar)

### Step 5.5: Performance Testing

**Use browser DevTools:**
1. Open F12 > Network tab
2. Disable cache
3. Reload page (Ctrl+Shift+R)
4. Check metrics:
   - ✅ Page load time < 3s
   - ✅ First contentful paint < 1.5s
   - ✅ Time to interactive < 3s

**Use WebPageTest (optional):**
```
https://www.webpagetest.org/
Test Location: Virginia, USA
Browser: Chrome
```

---

## 🧪 Test Phase 6: Monitoring Validation (5 minutes)

### Step 6.1: CloudWatch Metrics

```powershell
# Check CloudFront metrics (wait 5-10 minutes after first requests)
aws cloudwatch get-metric-statistics `
  --namespace AWS/CloudFront `
  --metric-name Requests `
  --dimensions Name=DistributionId,Value=$DIST_ID `
  --start-time (Get-Date).AddHours(-1).ToString("yyyy-MM-ddTHH:mm:ss") `
  --end-time (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss") `
  --period 300 `
  --statistics Sum

# Expected: Data points showing your test requests
```

### Step 6.2: CloudWatch Alarms

```powershell
# Check alarm status
aws cloudwatch describe-alarms `
  --alarm-name-prefix "usermn-dev-cloudfront"

# Expected: Both alarms in OK state
```

### Step 6.3: CloudFront Statistics

**In AWS Console:**
1. Navigate to CloudFront > Distributions
2. Select your distribution
3. Click "Monitoring" tab
4. Check graphs:
   - ✅ Requests graph shows traffic
   - ✅ Error rates low/zero
   - ✅ Bytes downloaded increasing

---

## 🧪 Test Phase 7: Rollback Test (10 minutes)

### Step 7.1: Make a Change

```powershell
# Modify a file in dist/
echo "<!-- Test rollback -->" >> dist\index.html

# Deploy change
aws s3 sync dist/ s3://$BUCKET --delete

# Invalidate cache
aws cloudfront create-invalidation `
  --distribution-id $DIST_ID `
  --paths "/index.html"
```

### Step 7.2: Verify Change

```powershell
# Wait 1-2 minutes for invalidation
Start-Sleep -Seconds 120

# Check page (should show updated content)
curl.exe $URL/index.html | Select-String "Test rollback"
```

### Step 7.3: Rollback

```powershell
# List S3 versions
aws s3api list-object-versions `
  --bucket $BUCKET `
  --prefix "index.html"

# Get previous version ID
$VERSION_ID = "..." # Copy from output

# Restore previous version
aws s3api copy-object `
  --bucket $BUCKET `
  --copy-source "$BUCKET/index.html?versionId=$VERSION_ID" `
  --key "index.html"

# Invalidate cache
aws cloudfront create-invalidation `
  --distribution-id $DIST_ID `
  --paths "/index.html"
```

**Note:** Rollback won't work in dev environment if versioning is disabled. Test this in staging.

---

## 🧪 Test Phase 8: Cleanup (Optional)

### Step 8.1: Destroy Development Infrastructure

**⚠️ Warning:** This destroys all resources. Only do this if you want to clean up.

```powershell
cd d:\code\reactjs\usermn1\terraform

# Empty S3 bucket first (Terraform can't delete non-empty buckets)
$BUCKET = terraform output -raw s3_bucket_id
aws s3 rm s3://$BUCKET --recursive

# Destroy infrastructure
terraform destroy -var-file=dev.tfvars

# Type: yes
```

**Wait time:** 20-30 minutes (CloudFront distribution deletion)

### Step 8.2: Verify Cleanup

```powershell
# Check S3
aws s3 ls | Select-String $BUCKET
# Expected: No results

# Check CloudFront
aws cloudfront list-distributions
# Expected: Your distribution not listed (or status: Deleting)
```

---

## ✅ Test Success Criteria

### Infrastructure

- ✅ Terraform init successful
- ✅ Terraform validate successful
- ✅ Terraform plan shows expected resources
- ✅ Terraform apply completes without errors
- ✅ All outputs generated correctly

### Application

- ✅ Build completes in < 5 seconds
- ✅ Files upload to S3 successfully
- ✅ CloudFront invalidation completes
- ✅ Health check returns HTTP 200
- ✅ Main page loads correctly

### Performance

- ✅ Page load time < 3 seconds
- ✅ First contentful paint < 1.5 seconds
- ✅ Cache hit rate > 0% (after warming)
- ✅ No console errors

### Monitoring

- ✅ CloudWatch metrics populated
- ✅ CloudWatch alarms in OK state
- ✅ CloudFront statistics visible

---

## 🐛 Common Issues and Solutions

### Issue 1: "Bucket already exists"

**Error:**
```
Error: creating Amazon S3 Bucket: BucketAlreadyExists
```

**Solution:**
```powershell
# Bucket names must be globally unique
# Edit dev.tfvars and change s3_bucket_name:
# s3_bucket_name = "usermn-dev-website-uniqueid123"

# Or let Terraform generate unique name (remove from tfvars)
```

### Issue 2: CloudFront distribution deployment stuck

**Symptom:** "Still creating... [15m30s elapsed]"

**Solution:**
- This is normal! CloudFront distributions take 15-25 minutes
- Be patient and wait
- Do NOT interrupt (Ctrl+C)

### Issue 3: 403 Forbidden after deployment

**Symptom:** Website returns 403

**Diagnosis:**
```powershell
# Check S3 bucket policy
aws s3api get-bucket-policy --bucket $BUCKET

# Check CloudFront OAC
aws cloudfront get-origin-access-control --id [oac-id]
```

**Solution:**
```powershell
# Re-apply Terraform (fixes bucket policy)
terraform apply -var-file=dev.tfvars -auto-approve

# Verify files in S3
aws s3 ls s3://$BUCKET/
```

### Issue 4: Stale content after invalidation

**Symptom:** Old content still showing

**Solution:**
```powershell
# Check invalidation status
aws cloudfront get-invalidation `
  --distribution-id $DIST_ID `
  --id [invalidation-id]

# Wait until Status: Completed

# Clear browser cache (Ctrl+Shift+Delete)
# Or use incognito mode (Ctrl+Shift+N)
```

---

## 📊 Test Results Template

```
=== Terraform Testing Report ===

Date: YYYY-MM-DD HH:MM
Environment: Development
Tested By: [Name]
Terraform Version: [Version]
AWS Region: [Region]

Phase 1: Validation
- [ ] terraform init: PASS / FAIL
- [ ] terraform validate: PASS / FAIL
- [ ] terraform fmt: PASS / FAIL

Phase 2: Plan Review
- [ ] Plan generation: PASS / FAIL
- [ ] Resource count: [Number]
- [ ] Expected resources: PASS / FAIL
- [ ] Security review: PASS / FAIL

Phase 3: Deployment
- [ ] terraform apply: PASS / FAIL
- [ ] Duration: [Minutes]
- [ ] Outputs generated: PASS / FAIL
- [ ] AWS Console verification: PASS / FAIL

Phase 4: Application Deployment
- [ ] Build: PASS / FAIL
- [ ] S3 upload: PASS / FAIL
- [ ] CloudFront invalidation: PASS / FAIL

Phase 5: Functional Testing
- [ ] Health check: PASS / FAIL
- [ ] Main page: PASS / FAIL
- [ ] Cache behavior: PASS / FAIL
- [ ] Browser testing: PASS / FAIL
- [ ] Performance: PASS / FAIL

Phase 6: Monitoring
- [ ] CloudWatch metrics: PASS / FAIL
- [ ] CloudWatch alarms: PASS / FAIL
- [ ] CloudFront statistics: PASS / FAIL

Phase 7: Rollback Test
- [ ] Rollback execution: PASS / FAIL

Overall Result: PASS / FAIL

Issues Encountered:
[List any issues]

Recommendations:
[List any recommendations]

Next Steps:
[List next steps]
```

---

## 🎯 Next Steps After Successful Testing

1. **Document Results**
   - Fill out test results template
   - Save test report
   - Share with team

2. **Set Up Remote State**
   - Follow [terraform/backend-README.md](./terraform/backend-README.md)
   - Migrate local state to remote

3. **Configure GitLab CI/CD**
   - Set GitLab variables with dev outputs
   - Test automated deployment

4. **Proceed to Staging**
   - Test with `staging.tfvars`
   - Enable versioning, WAF, logging
   - Perform full regression testing

5. **Plan Production Deployment**
   - Review security settings
   - Prepare runbook
   - Schedule deployment window

---

**Last Updated**: 2025-11-08  
**Version**: 1.0.0  
**Owner**: DevOps Team
