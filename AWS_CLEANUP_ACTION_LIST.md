# 🗑️ AWS Deployment - Files to Remove

## Quick Action List

These files are **NOT NEEDED** for AWS EC2/Fargate deployment. Safe to delete from your codebase.

---

## ✅ Execute These Commands

### Remove AWS S3 Static Hosting Files

```bash
# Remove S3 configuration (not using S3 website hosting)
git rm s3-static-website-config.json
```

### Remove CloudFront CDN Functions

```bash
# Remove CloudFront URL rewriting (Nginx handles routing)
git rm cloudfront-url-rewrite.js
```

### Remove Lighthouse Config

```bash
# Lighthouse is dev tool only
git rm lighthouserc.json
```

### Remove Windows-Specific Development Scripts

```bash
# PowerShell development scripts not needed for deployment
git rm scripts/fix-user-management-state.ps1
git rm scripts/optimize-codebase.ps1
```

---

## 📋 Files Breakdown

### ❌ DELETE (Recommended)

```
s3-static-website-config.json          # S3 static website config - not using
cloudfront-url-rewrite.js              # CloudFront functions - Nginx handles this
lighthouserc.json                      # Lighthouse (dev tool only)
scripts/fix-user-management-state.ps1  # Windows dev script - not needed
scripts/optimize-codebase.ps1          # Windows dev script - not needed
```

**Space Saved:** ~200 KB

### ⚠️ KEEP IN REPO but Not in Docker Build

```
.storybook/                    # Component documentation (dev only)
e2e/                          # E2E tests (use for CI/CD validation)
vitest.config.ts              # Unit test config
playwright.config.ts          # E2E test config
```

### ✅ KEEP (Essential for Deployment)

```
Dockerfile                     # ✅ Production ready
nginx.conf                     # ✅ Web server config
scripts/validate-env.sh        # ✅ Environment validation
vite.config.ts                 # ✅ Build config
package.json                   # ✅ Dependencies
src/                          # ✅ Source code
```

---

## 🔍 Verify Current State

```bash
# Show what files exist currently
ls -la s3-static-website-config.json
ls -la cloudfront-url-rewrite.js
ls -la lighthouserc.json
ls -la scripts/*.ps1

# Show current git status
git status
```

---

## 📝 Git Commit

After deleting files, commit the cleanup:

```bash
git add -A
git commit -m "chore: remove AWS S3 and CloudFront config (using EC2/Fargate instead)

- Remove s3-static-website-config.json (not using S3 website hosting)
- Remove cloudfront-url-rewrite.js (Nginx handles SPA routing)
- Remove lighthouserc.json (dev tool only)
- Remove Windows dev scripts (.ps1 files)

These files are specific to AWS S3/CloudFront static hosting.
Since deploying to EC2/Fargate with Docker/Nginx, they're no longer needed."
```

---

## 🚀 Next Steps After Cleanup

1. Build Docker image
2. Push to AWS ECR
3. Deploy to EC2 or Fargate
4. Set environment variables in AWS
5. Configure load balancer (optional)
6. Test application

---

## 📊 Impact Analysis

| File                            | Size       | Impact         | Reason           |
| ------------------------------- | ---------- | -------------- | ---------------- |
| `s3-static-website-config.json` | ~1 KB      | Low            | S3 config only   |
| `cloudfront-url-rewrite.js`     | ~2 KB      | Low            | CloudFront only  |
| `lighthouserc.json`             | ~1 KB      | Low            | Dev tool only    |
| `fix-user-management-state.ps1` | ~5 KB      | Low            | Windows dev only |
| `optimize-codebase.ps1`         | ~10 KB     | Low            | Windows dev only |
| **Total**                       | **~20 KB** | **Negligible** | Safe to remove   |

---

## ✨ Summary

- **Files to delete:** 5 files (~20 KB)
- **Docker image size impact:** None (not included in build)
- **Runtime impact:** None (not used in production)
- **Recommendation:** Delete all 5 files

Your application will run **exactly the same** on AWS without these files! ✅

---

**Status:** Ready to deploy to AWS EC2/Fargate 🚀
