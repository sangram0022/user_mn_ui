# S3+CloudFront Deployment - Quick Reference Card

**Version**: 1.0.0 | **Date**: 2025-11-08 | **Status**: Ready for Testing 🧪

---

## 🚀 Quick Start (First Time)

```powershell
# 1. Navigate to terraform directory
cd d:\code\reactjs\usermn1\terraform

# 2. Initialize Terraform
terraform init

# 3. Plan deployment
terraform plan -var-file=dev.tfvars -out=tfplan-dev

# 4. Apply (creates S3 + CloudFront)
terraform apply tfplan-dev  # Takes 20-25 minutes

# 5. Build and deploy app
cd ..
npm run build
make deploy-full-dev  # Or use individual commands below
```

---

## 📦 Essential Commands

### Terraform Operations

```powershell
# Development
make terraform-plan-dev        # Plan changes
make terraform-apply-dev       # Apply changes

# Staging
make terraform-plan-staging
make terraform-apply-staging

# Production
make terraform-plan-production
make terraform-apply-production

# Get outputs
terraform output website_url
terraform output -json > outputs.json
```

### Build & Deploy

```powershell
# Build only
npm run build                  # Builds to dist/ folder

# Deploy to S3 only
make deploy-s3-dev            # Dev environment
make deploy-s3-staging        # Staging
make deploy-s3-production     # Production

# Invalidate CloudFront cache
make invalidate-cloudfront-dev
make invalidate-cloudfront-staging
make invalidate-cloudfront-production

# Full deployment (build + deploy + invalidate)
make deploy-full-dev
make deploy-full-staging
make deploy-full-production
```

### Health & Monitoring

```powershell
# Health check
make health-check-dev
make health-check-staging
make health-check-production

# Check CloudFront status
make check-cloudfront-status

# Warm cache (pre-load important pages)
make warm-cache-dev
```

### Rollback

```powershell
# Rollback S3 deployment
make rollback-s3-production

# Rollback CloudFront (restore from backup)
make rollback-cloudfront-production

# Manual rollback (if Makefile fails)
aws s3 sync s3://[backup-bucket] s3://[website-bucket] --delete
aws cloudfront create-invalidation --distribution-id [id] --paths "/*"
```

---

## 🏗️ Infrastructure

### Resources Created

| Resource | Purpose | Cost Impact |
|----------|---------|-------------|
| **S3 Bucket** | Static website hosting | $0.50-2/month |
| **CloudFront** | Global CDN | $4-15/month |
| **CloudFront OAC** | Secure S3 access | Free |
| **WAF** (optional) | DDoS protection | $5/month |
| **Route53** (optional) | DNS management | $1/month |
| **CloudWatch Alarms** | Error monitoring | $0.50/month |

### Environments

| Environment | Cost/Month | Features |
|-------------|------------|----------|
| **Dev** | $5 | Minimal (no versioning, WAF, logging) |
| **Staging** | $20 | Full (versioning, WAF, logging) |
| **Production** | $25 | Full + global CDN |

---

## 📊 Monitoring

### Key Metrics

| Metric | Threshold | Alarm |
|--------|-----------|-------|
| **4xx Error Rate** | > 5% | ✅ Configured |
| **5xx Error Rate** | > 1% | ✅ Configured |
| **Cache Hit Rate** | < 80% | Optional |
| **Request Rate** | > 10k/5min | Optional |
| **Origin Latency** | > 1000ms | Optional |

### CloudWatch Dashboard (Optional)

- **Requests**: Total CloudFront requests
- **Errors**: 4xx/5xx error rates
- **Bandwidth**: Data transfer
- **Cache**: Hit rate percentage
- **WAF**: Blocked requests
- **Latency**: S3 response time

### Check Metrics

```powershell
# Via AWS CLI
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=[id] \
  --start-time [time] \
  --end-time [time] \
  --period 300 \
  --statistics Sum

# Via AWS Console
# CloudWatch > Dashboards > [project-name]-[env]-website
```

---

## 🆘 Troubleshooting

### Issue: Build Fails

```powershell
# Check Node version
node --version  # Should be 20+

# Clear cache and rebuild
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: 403 Forbidden

```powershell
# Re-apply Terraform (fixes bucket policy)
terraform apply -var-file=[env].tfvars -auto-approve

# Verify files in S3
aws s3 ls s3://[bucket-name]/

# Check CloudFront OAC
terraform output cloudfront_oac_id
```

### Issue: Stale Content

```powershell
# Invalidate CloudFront cache
make invalidate-cloudfront-[env]

# Check invalidation status
aws cloudfront list-invalidations --distribution-id [id]

# Clear browser cache (Ctrl+Shift+Delete)
# Or use incognito mode (Ctrl+Shift+N)
```

### Issue: Terraform State Locked

```powershell
# Check lock
terraform state list

# Force unlock (use Lock ID from error message)
terraform force-unlock [lock-id]
```

### Issue: High Error Rates

```powershell
# Check CloudWatch alarms
aws cloudwatch describe-alarms

# View recent logs
aws s3 ls s3://[logs-bucket]/cloudfront-logs/

# Check CloudFront distribution status
aws cloudfront get-distribution --id [id]
```

---

## 🔐 Security

### Best Practices

- ✅ S3 bucket: Public access blocked
- ✅ CloudFront: HTTPS-only
- ✅ CloudFront: OAC (not legacy OAI)
- ✅ S3 bucket policy: Restricts to CloudFront OAC
- ✅ WAF: Rate limiting + managed rules (staging/prod)
- ✅ Versioning: Enabled in staging/prod
- ✅ Encryption: S3 server-side encryption

### AWS Credentials

**Never commit:**
- AWS access keys
- AWS secret keys
- Terraform state files
- `.tfvars` files with sensitive data

**GitLab CI/CD Variables:**
- Set as "Protected" for production
- Set as "Masked" for credentials
- Rotate quarterly

---

## 📚 Documentation

### Quick Reference

1. **This file** - Quick commands and troubleshooting
2. **OPERATIONAL_READINESS_CHECKLIST.md** - Progress tracking
3. **TERRAFORM_TESTING_GUIDE.md** - First deployment guide

### Comprehensive Guides

4. **S3_CLOUDFRONT_DEPLOYMENT_GUIDE.md** (600+ lines)
   - Architecture, configuration, security, monitoring

5. **DEPLOYMENT_RUNBOOK.md** (800+ lines)
   - Procedures, rollback, troubleshooting, monitoring

6. **INFRASTRUCTURE_MIGRATION_SUMMARY.md** (450+ lines)
   - Migration details, cost analysis, comparison

### Technical Reference

7. **terraform/README.md** (400+ lines)
   - Terraform-specific documentation

8. **terraform/backend-README.md** (140 lines)
   - Remote state configuration

9. **MIGRATION_COMPLETE_SUMMARY.md** (600+ lines)
   - Complete migration summary with all files

---

## 🎯 Common Workflows

### Daily Development

```powershell
# 1. Make code changes
# 2. Test locally
npm run dev

# 3. Build
npm run build

# 4. Deploy to dev
make deploy-full-dev

# 5. Verify
make health-check-dev
```

### Feature Branch → Staging

```powershell
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: new feature"
git push origin feature/new-feature

# 3. Create merge request in GitLab
# 4. Merge to main → GitLab CI/CD auto-deploys to staging
```

### Staging → Production

```powershell
# 1. Verify staging deployment successful
make health-check-staging

# 2. Navigate to GitLab > CI/CD > Pipelines
# 3. Find successful pipeline from main branch
# 4. Click "Deploy to Production" (manual action)
# 5. Monitor deployment logs
# 6. Verify production
make health-check-production
```

### Emergency Rollback

```powershell
# Option 1: Use Makefile (fastest)
make rollback-s3-production
make rollback-cloudfront-production

# Option 2: GitLab CI/CD
# Navigate to last successful pipeline
# Click "Rollback Production"

# Option 3: Manual
# Navigate to GitLab > Pipelines
# Find last good deployment
# Re-run "Deploy to Production" job
```

---

## 💰 Cost Tracking

### Monthly Estimates

```
Development:  ~$5/month
Staging:      ~$20/month
Production:   ~$25/month
────────────────────────
Total:        ~$50/month (vs $300 on ECS)
Savings:      92% reduction
```

### Cost Components

- **S3 Storage**: $0.023/GB/month
- **S3 Requests**: $0.0004 per 1000 requests
- **CloudFront Data Transfer**: $0.085/GB (first 10TB)
- **CloudFront Requests**: $0.0075 per 10,000 requests
- **WAF**: $5/month + $1 per million requests
- **CloudWatch Alarms**: $0.10 each

### Optimization Tips

- Enable CloudFront caching (reduces S3 requests)
- Use appropriate cache policies (longer for static assets)
- Compress assets (Gzip/Brotli)
- Enable S3 lifecycle policies (delete old versions)
- Monitor CloudWatch costs (adjust alarm thresholds)

---

## 📞 Emergency Contacts

**During incidents, contact in this order:**

1. **DevOps On-Call**: [Phone Number]
2. **Engineering Lead**: [Phone Number]
3. **CTO**: [Phone Number]

**Escalation:**
- P1 (Critical): 15 minutes response
- P2 (High): 1 hour response
- P3 (Medium): 4 hours response
- P4 (Low): Next business day

---

## ✅ Pre-Deployment Checklist

### Before First Deployment

- [ ] AWS CLI configured with credentials
- [ ] Terraform v1.7.0+ installed
- [ ] Node.js 20+ installed
- [ ] Read TERRAFORM_TESTING_GUIDE.md
- [ ] Understand rollback procedures

### Before Production Deployment

- [ ] Tested in dev environment
- [ ] Tested in staging environment
- [ ] Full regression testing passed
- [ ] Performance metrics acceptable
- [ ] Monitoring configured and tested
- [ ] Rollback procedure tested
- [ ] Team trained on deployment process

---

## 🔗 Useful Links

### AWS Console

- **S3 Buckets**: https://console.aws.amazon.com/s3/
- **CloudFront**: https://console.aws.amazon.com/cloudfront/
- **CloudWatch**: https://console.aws.amazon.com/cloudwatch/
- **WAF**: https://console.aws.amazon.com/wafv2/

### GitLab

- **Pipelines**: [Your GitLab URL]/pipelines
- **CI/CD Variables**: [Your GitLab URL]/settings/ci_cd
- **Merge Requests**: [Your GitLab URL]/merge_requests

### External Tools

- **WebPageTest**: https://www.webpagetest.org/
- **GTmetrix**: https://gtmetrix.com/
- **SSL Labs**: https://www.ssllabs.com/ssltest/

---

## 🎓 Training Checklist

### New Team Members

- [ ] Read this quick reference card
- [ ] Read OPERATIONAL_READINESS_CHECKLIST.md
- [ ] Read TERRAFORM_TESTING_GUIDE.md
- [ ] Read DEPLOYMENT_RUNBOOK.md
- [ ] Deploy to dev environment (hands-on)
- [ ] Make a change and redeploy
- [ ] Practice rollback procedure
- [ ] Review CloudWatch dashboard
- [ ] Shadow staging deployment
- [ ] Shadow production deployment

**Estimated Training Time**: 4-6 hours

---

**Quick Help:**
- 🐛 Troubleshooting: See section above
- 📚 Detailed docs: See "Documentation" section
- 🆘 Emergency: See "Emergency Contacts" section
- 📞 Questions: Ask DevOps team

**Last Updated**: 2025-11-08  
**Next Review**: After first production deployment  
**Maintainer**: DevOps Team
