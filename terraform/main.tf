# ============================================================================
# Terraform Configuration for React 19 Static Website
# Architecture: S3 + CloudFront + Route53 + WAF
# ============================================================================

terraform {
  required_version = ">= 1.7.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # S3 backend for state management
  # Configure via: terraform init -backend-config="bucket=your-state-bucket"
  backend "s3" {
    key            = "react-app/terraform.tfstate"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

# ============================================================================
# Provider Configuration
# ============================================================================

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project           = var.project_name
      Environment       = var.environment
      ManagedBy         = "Terraform"
      Application       = "React19-StaticWebsite"
      CostCenter        = var.cost_center
      Repository        = var.repository_url
      Owner             = var.owner_team
      BusinessUnit      = var.business_unit
      ComplianceLevel   = var.compliance_level
      DataClassification = var.data_classification
      BackupFrequency   = var.backup_frequency
      DisasterRecovery  = var.disaster_recovery_tier
      AutoShutdown      = var.auto_shutdown_schedule
    }
  }
}

# CloudFront requires ACM certificates in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Application = "React19-StaticWebsite"
    }
  }
}

# ============================================================================
# Data Sources
# ============================================================================
data "aws_caller_identity" "current" {}

data "aws_canonical_user_id" "current" {}

# ============================================================================
# Local Variables
# ============================================================================

locals {
  account_id  = data.aws_caller_identity.current.account_id
  bucket_name = var.s3_bucket_name != "" ? var.s3_bucket_name : "${var.project_name}-${var.environment}-${local.account_id}"
  
  # Origin ID for CloudFront
  s3_origin_id = "S3-${local.bucket_name}"
  
  # Common MIME types for caching
  cache_control_by_type = {
    "text/html"                 = "public, max-age=0, must-revalidate"
    "application/json"          = "public, max-age=0, must-revalidate"
    "text/css"                  = "public, max-age=31536000, immutable"
    "application/javascript"    = "public, max-age=31536000, immutable"
    "image/jpeg"               = "public, max-age=31536000, immutable"
    "image/png"                = "public, max-age=31536000, immutable"
    "image/svg+xml"            = "public, max-age=31536000, immutable"
    "image/webp"               = "public, max-age=31536000, immutable"
    "font/woff"                = "public, max-age=31536000, immutable"
    "font/woff2"               = "public, max-age=31536000, immutable"
  }
}

# ============================================================================
# S3 Bucket for Static Website Hosting
# ============================================================================

resource "aws_s3_bucket" "website" {
  bucket        = local.bucket_name
  force_destroy = var.environment != "production" # Only allow in non-prod

  tags = {
    Name        = local.bucket_name
    Purpose     = "StaticWebsiteHosting"
    Environment = var.environment
  }
}

# Enable versioning for backup and rollback capability (disabled since code is managed via git)
resource "aws_s3_bucket_versioning" "website" {
  bucket = aws_s3_bucket.website.id

  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Suspended"
  }
}

# Configure server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# Block public access (CloudFront will access via OAC)
resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Configure lifecycle rules
resource "aws_s3_bucket_lifecycle_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = var.noncurrent_version_expiration_days
    }
  }

  rule {
    id     = "delete-incomplete-uploads"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }

  # Intelligent Tiering for frequently accessed objects
  rule {
    id     = "intelligent-tiering-main"
    status = var.enable_intelligent_tiering ? "Enabled" : "Suspended"

    filter {
      prefix = ""
    }

    transition {
      days          = 0
      storage_class = "INTELLIGENT_TIERING"
    }
  }

  # Move logs to cheaper storage after 30 days
  rule {
    id     = "logs-transition"
    status = "Enabled"

    filter {
      prefix = "logs/"
    }

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = var.log_retention_days
    }
  }

  # Move old versions to cheaper storage
  rule {
    id     = "version-transition"
    status = "Enabled"

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }

    noncurrent_version_transition {
      noncurrent_days = 90
      storage_class   = "GLACIER"
    }
  }
}

# Enable bucket logging (optional)
resource "aws_s3_bucket_logging" "website" {
  count = var.enable_logging ? 1 : 0

  bucket        = aws_s3_bucket.website.id
  target_bucket = aws_s3_bucket.logs[0].id
  target_prefix = "s3-access-logs/"
}

# S3 bucket for logs
resource "aws_s3_bucket" "logs" {
  count = var.enable_logging ? 1 : 0

  bucket        = "${local.bucket_name}-logs"
  force_destroy = var.environment != "production"

  tags = {
    Name    = "${local.bucket_name}-logs"
    Purpose = "AccessLogs"
  }
}

resource "aws_s3_bucket_public_access_block" "logs" {
  count = var.enable_logging ? 1 : 0

  bucket = aws_s3_bucket.logs[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "logs" {
  count = var.enable_logging ? 1 : 0

  bucket = aws_s3_bucket.logs[0].id

  rule {
    id     = "expire-logs"
    status = "Enabled"

    expiration {
      days = var.log_retention_days  # 3 months retention for cost optimization
    }
  }
}

# ============================================================================
# S3 Storage Lens for Cost Optimization Analytics
# ============================================================================

resource "aws_s3control_storage_lens_configuration" "website" {
  count = var.enable_storage_lens ? 1 : 0

  config_id = "${var.project_name}-${var.environment}-storage-lens"

  storage_lens_configuration {
    enabled = true
    account_level {
      bucket_level {
        activity_metrics {
          enabled = true
        }
        prefix_level {
          storage_metrics {
            enabled = true
            selection_criteria {
              delimiter = "/"
              max_depth = 5
              min_storage_bytes_percentage = 1.0
            }
          }
        }
      }
    }

    aws_org {
      arn = var.organization_arn != "" ? var.organization_arn : null
    }

    data_export {
      cloud_watch_metrics {
        enabled = true
      }

      s3_bucket_destination {
        format     = "CSV"
        output_schema_version = "V_1"
        account_id = local.account_id
        arn        = aws_s3_bucket.storage_lens[0].arn
        prefix     = "storage-lens/"

        encryption {
          sse_s3 {}
        }
      }
    }

    exclude {
      buckets = []
      regions = []
    }

    include {
      buckets = [aws_s3_bucket.website.bucket]
      regions = [var.aws_region]
    }
  }
}

# S3 bucket for Storage Lens data export
resource "aws_s3_bucket" "storage_lens" {
  count = var.enable_storage_lens ? 1 : 0

  bucket        = "${local.bucket_name}-storage-lens"
  force_destroy = var.environment != "production"

  tags = {
    Name    = "${local.bucket_name}-storage-lens"
    Purpose = "StorageLensDataExport"
  }
}

resource "aws_s3_bucket_public_access_block" "storage_lens" {
  count = var.enable_storage_lens ? 1 : 0

  bucket = aws_s3_bucket.storage_lens[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "storage_lens" {
  count = var.enable_storage_lens ? 1 : 0

  bucket = aws_s3_bucket.storage_lens[0].id

  rule {
    id     = "expire-storage-lens-data"
    status = "Enabled"

    expiration {
      days = 365
    }
  }
}

# ============================================================================

resource "aws_cloudfront_origin_access_control" "website" {
  name                              = "${local.bucket_name}-oac"
  description                       = "OAC for ${local.bucket_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# S3 bucket policy to allow CloudFront OAC access
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.website.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.website.arn
          }
        }
      }
    ]
  })
}

# ============================================================================
# CloudFront Reserved Capacity (Cost Optimization for High Traffic)
# ============================================================================

resource "aws_cloudfront_distribution" "website" {
  # ... existing configuration ...

  # Enable IPv6 for better performance
  is_ipv6_enabled = true

  # HTTP/3 for improved performance with high traffic
  http_version = "http2and3"

  # Global distribution for 100k+ daily users
  price_class = var.cloudfront_price_class

  # ... existing configuration continues ...

  # S3 Origin
  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id                = local.s3_origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id

  # Origin shield for high-traffic optimization (enabled by default for 100k+ users)
  dynamic "origin_shield" {
    for_each = var.enable_origin_shield ? [1] : []
    content {
      enabled              = true
      origin_shield_region = var.origin_shield_region
    }
  }
  }

  # Default cache behavior for all files
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = local.s3_origin_id
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    # Use managed cache policy for optimal performance
    cache_policy_id            = var.cache_policy_id != "" ? var.cache_policy_id : aws_cloudfront_cache_policy.optimized[0].id
    origin_request_policy_id   = data.aws_cloudfront_origin_request_policy.cors_s3.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id
  }

  # Ordered cache behavior for static assets (use high-traffic policy if applicable)
  ordered_cache_behavior {
    path_pattern     = "/assets/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = local.s3_origin_id
    compress         = true

    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = var.expected_daily_users >= 10000 ? aws_cloudfront_cache_policy.high_traffic_static[0].id : aws_cloudfront_cache_policy.static_assets.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.cors_s3.id
  }

  # Ordered cache behavior for index.html (no caching)
  ordered_cache_behavior {
    path_pattern     = "/index.html"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = local.s3_origin_id
    compress         = true

    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = aws_cloudfront_cache_policy.no_cache.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.cors_s3.id
  }

  # Custom error responses for SPA routing
  dynamic "custom_error_response" {
    for_each = var.enable_spa_mode ? [
      { error_code = 403, response_code = 200, response_page_path = "/index.html" },
      { error_code = 404, response_code = 200, response_page_path = "/index.html" }
    ] : []

    content {
      error_code            = custom_error_response.value.error_code
      response_code         = custom_error_response.value.response_code
      response_page_path    = custom_error_response.value.response_page_path
      error_caching_min_ttl = 10
    }
  }

  # Geo restrictions
  restrictions {
    geo_restriction {
      restriction_type = var.geo_restriction_type
      locations        = var.geo_restriction_locations
    }
  }

  # SSL/TLS Certificate
  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn != "" ? var.acm_certificate_arn : null
    cloudfront_default_certificate = var.acm_certificate_arn == ""
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method       = var.acm_certificate_arn != "" ? "sni-only" : null
  }

  # Enable access logs
  dynamic "logging_config" {
    for_each = var.enable_logging ? [1] : []
    content {
      include_cookies = false
      bucket          = aws_s3_bucket.logs[0].bucket_domain_name
      prefix          = "cloudfront-logs/"
    }
  }

  # Enable WAF
  web_acl_id = var.enable_waf ? aws_wafv2_web_acl.cloudfront[0].arn : null

  tags = {
    Name        = "${var.project_name}-${var.environment}-cdn"
    Environment = var.environment
  }
}

# ============================================================================
# CloudFront Cache Policies
# ============================================================================

# Optimized cache policy for application
resource "aws_cloudfront_cache_policy" "optimized" {
  count = var.cache_policy_id == "" ? 1 : 0

  name        = "${var.project_name}-${var.environment}-optimized"
  comment     = "Optimized caching for React application"
  default_ttl = 86400  # 1 day
  max_ttl     = 31536000  # 1 year
  min_ttl     = 1

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

# Cache policy for static assets (max caching)
resource "aws_cloudfront_cache_policy" "static_assets" {
  name        = "${var.project_name}-${var.environment}-static-assets"
  comment     = "Maximum caching for static assets"
  default_ttl = 31536000  # 1 year
  max_ttl     = 31536000  # 1 year
  min_ttl     = 31536000  # 1 year

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

# Cache policy for high-traffic static assets (aggressive caching)
resource "aws_cloudfront_cache_policy" "high_traffic_static" {
  count = var.expected_daily_users >= 10000 ? 1 : 0

  name        = "${var.project_name}-${var.environment}-high-traffic-static"
  comment     = "Aggressive caching for high-traffic static assets"
  default_ttl = 31536000  # 1 year
  max_ttl     = 31536000  # 1 year
  min_ttl     = 86400     # 1 day minimum

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

# Cache policy for API responses (short cache for high traffic)
resource "aws_cloudfront_cache_policy" "api_high_traffic" {
  count = var.expected_daily_users >= 50000 ? 1 : 0

  name        = "${var.project_name}-${var.environment}-api-high-traffic"
  comment     = "Optimized API caching for high traffic"
  default_ttl = 300    # 5 minutes
  max_ttl     = 3600   # 1 hour
  min_ttl     = 60     # 1 minute

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "whitelist"
      headers {
        items = ["authorization", "accept", "accept-language"]
      }
    }

    query_strings_config {
      query_string_behavior = "whitelist"
      query_strings {
        items = ["version", "lang", "limit"]
      }
    }
  }
}

# ============================================================================
# CloudFront Reserved Capacity (Cost Optimization)
# ============================================================================

resource "aws_cloudfront_reserved_capacity" "website" {
  count = var.enable_cloudfront_reserved_capacity ? 1 : 0

  distribution_id = aws_cloudfront_distribution.website.id
  capacity = var.cloudfront_reserved_capacity_monthly
}

# ============================================================================

# Use AWS managed CORS-S3 origin request policy
data "aws_cloudfront_origin_request_policy" "cors_s3" {
  name = "Managed-CORS-S3Origin"
}

# ============================================================================
# CloudFront Response Headers Policy (Security Headers)
# ============================================================================

resource "aws_cloudfront_response_headers_policy" "security_headers" {
  name    = "${var.project_name}-${var.environment}-security-headers"
  comment = "Security headers for ${var.project_name}"

  # Security headers
  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 63072000  # 2 years
      include_subdomains         = true
      preload                    = true
      override                   = true
    }

    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    xss_protection {
      mode_block = true
      protection = true
      override   = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    content_security_policy {
      content_security_policy = var.content_security_policy
      override                = true
    }
  }

  # CORS headers
  cors_config {
    access_control_allow_credentials = false
    
    access_control_allow_headers {
      items = ["*"]
    }
    
    access_control_allow_methods {
      items = ["GET", "HEAD", "OPTIONS"]
    }
    
    access_control_allow_origins {
      items = var.cors_allowed_origins
    }
    
    access_control_max_age_sec = 600
    origin_override            = true
  }

  # Custom headers
  dynamic "custom_headers_config" {
    for_each = var.custom_headers
    content {
      header {
        header   = custom_headers_config.value.header
        value    = custom_headers_config.value.value
        override = true
      }
    }
  }
}

# ============================================================================
# WAF for CloudFront (Optional but Recommended)
# ============================================================================

resource "aws_wafv2_web_acl" "cloudfront" {
  count = var.enable_waf ? 1 : 0

  provider = aws.us_east_1  # WAF for CloudFront must be in us-east-1
  name     = "${var.project_name}-${var.environment}-cloudfront-waf"
  scope    = "CLOUDFRONT"

  default_action {
    allow {}
  }

  # Rate limiting rule
  rule {
    name     = "RateLimitRule"
    priority = 1

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = var.waf_rate_limit
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-${var.environment}-rate-limit"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rules - Core Rule Set
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesCommonRuleSet"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-${var.environment}-common-rules"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rules - Known Bad Inputs
  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 3

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project_name}-${var.environment}-bad-inputs"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_name}-${var.environment}-waf"
    sampled_requests_enabled   = true
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-cloudfront-waf"
    Environment = var.environment
  }
}

# ============================================================================
# Route53 DNS Records (Optional)
# ============================================================================

data "aws_route53_zone" "main" {
  count = var.create_route53_records ? 1 : 0

  name         = var.route53_zone_name
  private_zone = false
}

resource "aws_route53_record" "website" {
  for_each = var.create_route53_records ? toset(var.domain_names) : []

  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = each.key
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

# AAAA record for IPv6
resource "aws_route53_record" "website_ipv6" {
  for_each = var.create_route53_records ? toset(var.domain_names) : []

  zone_id = data.aws_route53_zone.main[0].zone_id
  name    = each.key
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

# ============================================================================
# S3 Request Metrics for Cost Monitoring
# ============================================================================

resource "aws_s3_bucket_metric" "all_requests" {
  bucket = aws_s3_bucket.website.bucket
  name   = "EntireBucket"

  filter {
    prefix = ""
  }
}

resource "aws_s3_bucket_metric" "static_assets" {
  bucket = aws_s3_bucket.website.bucket
  name   = "StaticAssets"

  filter {
    prefix = "assets/"
  }
}

# ============================================================================
# AWS Budget for Cost Control
# ============================================================================

resource "aws_budgets_budget" "monthly_cost" {
  count = var.enable_budget_alerts ? 1 : 0

  name         = "${var.project_name}-${var.environment}-monthly-budget"
  budget_type  = "COST"
  limit_amount = var.monthly_budget_limit
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  cost_filter {
    name   = "TagKeyValue"
    values = ["Project$${var.project_name}"]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = var.budget_alert_threshold_percent
    threshold_type            = "PERCENTAGE"
    notification_type         = "FORECASTED"
    subscriber_email_addresses = var.budget_alert_emails
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = var.budget_alert_emails
  }
}

# ============================================================================

resource "aws_cloudwatch_dashboard" "cost_optimization" {
  count = var.enable_cost_dashboard ? 1 : 0

  dashboard_name = "${var.project_name}-${var.environment}-cost-optimization"

  dashboard_body = jsonencode({
    widgets = [
      # S3 Cost and Usage Metrics
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/S3", "AllRequests", "BucketName", aws_s3_bucket.website.bucket, "StorageType", "AllStorageTypes"],
            [".", "4xxErrors", ".", ".", ".", "."],
            [".", "5xxErrors", ".", ".", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "S3 Request Metrics"
          period  = 300
          stat    = "Sum"
        }
      },

      # CloudFront Cost Metrics
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/CloudFront", "Requests", "DistributionId", aws_cloudfront_distribution.website.id, "Region", "Global"],
            [".", "BytesDownloaded", ".", ".", ".", "."],
            [".", "4xxErrorRate", ".", ".", ".", "."],
            [".", "5xxErrorRate", ".", ".", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "us-east-1"
          title   = "CloudFront Performance & Cost Metrics"
          period  = 300
          stat    = "Sum"
        }
      },

      # S3 Storage Size
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/S3", "BucketSizeBytes", "BucketName", aws_s3_bucket.website.bucket, "StorageType", "StandardStorage"],
            [".", "BucketSizeBytes", ".", ".", "StorageType", "IntelligentTieringAAStorage"],
            [".", "BucketSizeBytes", ".", ".", "StorageType", "IntelligentTieringIAStorage"],
            [".", "BucketSizeBytes", ".", ".", "StorageType", "IntelligentTieringAASizeOverhead"],
            [".", "BucketSizeBytes", ".", ".", "StorageType", "IntelligentTieringIASizeOverhead"]
          ]
          view    = "timeSeries"
          stacked = true
          region  = var.aws_region
          title   = "S3 Storage Size by Class"
          period  = 86400
          stat    = "Maximum"
        }
      },

      # Cost Estimation Widget (Text)
      {
        type   = "text"
        x      = 12
        y      = 6
        width  = 12
        height = 6

        properties = {
          markdown = <<-EOT
# Cost Optimization Dashboard

## Current Configuration
- **S3 Intelligent Tiering**: ${var.enable_intelligent_tiering ? "Enabled" : "Disabled"}
- **Storage Lens**: ${var.enable_storage_lens ? "Enabled" : "Disabled"}
- **Origin Shield**: ${var.enable_origin_shield ? "Enabled" : "Disabled"}
- **CloudFront Price Class**: ${var.cloudfront_price_class}

## Estimated Monthly Savings
- **Intelligent Tiering**: Up to 30% on storage costs
- **Origin Shield**: $10-30/month (if enabled)
- **Storage Lens**: Free analytics for optimization

## Key Metrics to Monitor
- S3 requests should stay below ${var.s3_request_threshold} per 5 minutes
- Bucket size should stay below ${var.s3_bucket_size_threshold_gb} GB
- CloudFront cache hit rate should be >85%

## Cost Optimization Actions
1. Enable Intelligent Tiering for automatic storage class optimization
2. Monitor Storage Lens dashboard for usage patterns
3. Consider Origin Shield for production workloads
4. Set up billing alerts for cost thresholds
5. Use CloudFront price classes based on user geography
          EOT
        }
      }
    ]
  })
}

# ============================================================================

resource "aws_cloudwatch_metric_alarm" "s3_requests_high" {
  count = var.enable_cloudwatch_alarms ? 1 : 0

  alarm_name          = "${var.project_name}-${var.environment}-s3-high-requests"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "AllRequests"
  namespace           = "AWS/S3"
  period              = "300"
  statistic           = "Sum"
  threshold           = var.s3_request_threshold
  alarm_description   = "S3 request rate is too high - potential cost impact"
  treat_missing_data  = "notBreaching"

  dimensions = {
    BucketName = aws_s3_bucket.website.bucket
    StorageType = "AllStorageTypes"
  }

  alarm_actions = var.alarm_sns_topic_arn != "" ? [var.alarm_sns_topic_arn] : []
}

resource "aws_cloudwatch_metric_alarm" "s3_bucket_size_high" {
  count = var.enable_cloudwatch_alarms ? 1 : 0

  alarm_name          = "${var.project_name}-${var.environment}-s3-bucket-size"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "BucketSizeBytes"
  namespace           = "AWS/S3"
  period              = "86400"
  statistic           = "Maximum"
  threshold           = var.s3_bucket_size_threshold_gb * 1024 * 1024 * 1024  # Convert GB to bytes
  alarm_description   = "S3 bucket size is approaching limit"
  treat_missing_data  = "notBreaching"

  dimensions = {
    BucketName = aws_s3_bucket.website.bucket
    StorageType = "StandardStorage"
  }

  alarm_actions = var.alarm_sns_topic_arn != "" ? [var.alarm_sns_topic_arn] : []
}

# ============================================================================

resource "aws_cloudwatch_metric_alarm" "cloudfront_4xx_errors" {
  count = var.enable_cloudwatch_alarms ? 1 : 0

  alarm_name          = "${var.project_name}-${var.environment}-cloudfront-4xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "4xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Average"
  threshold           = var.cloudfront_4xx_error_threshold
  alarm_description   = "This metric monitors CloudFront 4xx errors"
  treat_missing_data  = "notBreaching"

  dimensions = {
    DistributionId = aws_cloudfront_distribution.website.id
  }

  alarm_actions = var.alarm_sns_topic_arn != "" ? [var.alarm_sns_topic_arn] : []
}

resource "aws_cloudwatch_metric_alarm" "cloudfront_5xx_errors" {
  count = var.enable_cloudwatch_alarms ? 1 : 0

  alarm_name          = "${var.project_name}-${var.environment}-cloudfront-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "5xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Average"
  threshold           = var.cloudfront_5xx_error_threshold
  alarm_description   = "This metric monitors CloudFront 5xx errors"
  treat_missing_data  = "notBreaching"

  dimensions = {
    DistributionId = aws_cloudfront_distribution.website.id
  }

  alarm_actions = var.alarm_sns_topic_arn != "" ? [var.alarm_sns_topic_arn] : []
}