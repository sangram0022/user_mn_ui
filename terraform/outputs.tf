# ============================================================================
# Terraform Outputs for S3 + CloudFront Static Website
# ============================================================================

# =============================================================================
# S3 BUCKET OUTPUTS
# =============================================================================

output "s3_bucket_id" {
  description = "ID of the S3 bucket"
  value       = aws_s3_bucket.website.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.website.arn
}

output "s3_bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  value       = aws_s3_bucket.website.bucket_domain_name
}

output "s3_bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket"
  value       = aws_s3_bucket.website.bucket_regional_domain_name
}

output "s3_bucket_region" {
  description = "AWS region where the S3 bucket is created"
  value       = aws_s3_bucket.website.region
}

# =============================================================================
# CLOUDFRONT OUTPUTS
# =============================================================================

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution"
  value       = aws_cloudfront_distribution.website.arn
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "cloudfront_hosted_zone_id" {
  description = "CloudFront hosted zone ID for Route53 alias records"
  value       = aws_cloudfront_distribution.website.hosted_zone_id
}

output "cloudfront_status" {
  description = "Current status of the CloudFront distribution"
  value       = aws_cloudfront_distribution.website.status
}

# =============================================================================
# DEPLOYMENT INFORMATION
# =============================================================================

output "website_url" {
  description = "Primary website URL"
  value       = length(var.domain_names) > 0 ? "https://${var.domain_names[0]}" : "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "alternative_urls" {
  description = "Alternative website URLs (if custom domains configured)"
  value       = [for domain in var.domain_names : "https://${domain}"]
}

# =============================================================================
# CACHE POLICY OUTPUTS
# =============================================================================

output "cache_policy_optimized_id" {
  description = "ID of the optimized cache policy"
  value       = var.cache_policy_id == "" ? aws_cloudfront_cache_policy.optimized[0].id : null
}

output "cache_policy_static_assets_id" {
  description = "ID of the static assets cache policy"
  value       = aws_cloudfront_cache_policy.static_assets.id
}

output "cache_policy_no_cache_id" {
  description = "ID of the no-cache policy for HTML files"
  value       = aws_cloudfront_cache_policy.no_cache.id
}

# =============================================================================
# SECURITY OUTPUTS
# =============================================================================

output "waf_web_acl_id" {
  description = "ID of the WAF Web ACL"
  value       = var.enable_waf ? aws_wafv2_web_acl.cloudfront[0].id : null
}

output "waf_web_acl_arn" {
  description = "ARN of the WAF Web ACL"
  value       = var.enable_waf ? aws_wafv2_web_acl.cloudfront[0].arn : null
}

output "origin_access_control_id" {
  description = "ID of the CloudFront Origin Access Control"
  value       = aws_cloudfront_origin_access_control.website.id
}

# =============================================================================
# LOGGING OUTPUTS
# =============================================================================

output "logs_bucket_id" {
  description = "ID of the logs bucket"
  value       = var.enable_logging ? aws_s3_bucket.logs[0].id : null
}

output "logs_bucket_arn" {
  description = "ARN of the logs bucket"
  value       = var.enable_logging ? aws_s3_bucket.logs[0].arn : null
}

# =============================================================================
# ROUTE53 OUTPUTS
# =============================================================================

output "route53_records" {
  description = "Route53 DNS records created"
  value = var.create_route53_records ? {
    for domain in var.domain_names : domain => {
      a_record    = aws_route53_record.website[domain].fqdn
      aaaa_record = aws_route53_record.website_ipv6[domain].fqdn
    }
  } : null
}

# =============================================================================
# GITLAB CI/CD VARIABLES
# =============================================================================

output "gitlab_ci_variables" {
  description = "Environment variables for GitLab CI/CD pipeline"
  value = {
    S3_BUCKET                   = aws_s3_bucket.website.id
    CLOUDFRONT_DISTRIBUTION_ID  = aws_cloudfront_distribution.website.id
    AWS_REGION                  = var.aws_region
    WEBSITE_URL                 = length(var.domain_names) > 0 ? "https://${var.domain_names[0]}" : "https://${aws_cloudfront_distribution.website.domain_name}"
  }
  sensitive = false
}

# =============================================================================
# DEPLOYMENT COMMANDS
# =============================================================================

output "deployment_commands" {
  description = "Useful commands for deployment"
  value = {
    sync_to_s3 = "aws s3 sync ./dist s3://${aws_s3_bucket.website.id} --delete --cache-control 'public, max-age=31536000, immutable'"
    invalidate_cache = "aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.website.id} --paths '/*'"
    check_status = "aws cloudfront get-distribution --id ${aws_cloudfront_distribution.website.id} --query 'Distribution.Status' --output text"
  }
}

# =============================================================================
# COST ESTIMATION
# =============================================================================

output "estimated_monthly_cost" {
  description = "Estimated monthly cost breakdown (approximate)"
  value = {
    s3_storage_per_gb       = "$0.023 per GB (first 50 TB)"
    s3_requests_per_1000    = "$0.0004 per 1,000 PUT requests, $0.00036 per 1,000 GET requests"
    cloudfront_data_transfer = "$0.085 per GB (first 10 TB, US/Europe)"
    cloudfront_requests     = "$0.0075 per 10,000 HTTP requests, $0.01 per 10,000 HTTPS requests"
    waf_web_acl            = var.enable_waf ? "$5.00 per month + $1.00 per million requests" : "Disabled"
    note                   = "Actual costs depend on usage. See AWS pricing calculator for detailed estimates."
  }
}
