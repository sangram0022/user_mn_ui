# ============================================================================
# Terraform Variables - Production Environment
# ============================================================================

project_name = "react-app"
environment  = "production"
aws_region   = "us-east-1"
cost_center  = "Engineering-Production"

# S3 Configuration
s3_bucket_name                     = ""  # Auto-generated with account ID
enable_versioning                  = true
noncurrent_version_expiration_days = 90

# CloudFront Configuration
domain_names             = []  # Add your production domains: ["www.example.com", "example.com"]
acm_certificate_arn      = ""  # REQUIRED: Add ACM certificate ARN (must be in us-east-1)
cloudfront_price_class   = "PriceClass_All"  # Global distribution for production
enable_origin_shield     = true  # Enable for better cache hit ratio
enable_spa_mode          = true

# Security Configuration
content_security_policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.production-domain.com;"
cors_allowed_origins    = []  # Specify exact origins for production security
geo_restriction_type    = "none"  # Or use "whitelist"/"blacklist" for geo-restrictions
geo_restriction_locations = []  # Add country codes if using geo-restriction

# WAF Configuration
enable_waf      = true  # REQUIRED for production
waf_rate_limit  = 2000  # Stricter rate limit for production

# Logging Configuration
enable_logging             = true
log_retention_days         = 90
enable_realtime_logs       = false  # Enable if you need real-time monitoring
realtime_log_sampling_rate = 100

# Route53 Configuration
create_route53_records = false  # Set to true if managing DNS with Terraform
route53_zone_name      = ""     # Add hosted zone name: "example.com"

# Monitoring Configuration
enable_cloudwatch_alarms        = true
cloudfront_4xx_error_threshold  = 5.0  # More sensitive for production
cloudfront_5xx_error_threshold  = 1.0  # Very sensitive to server errors
alarm_sns_topic_arn            = ""  # REQUIRED: Add SNS topic ARN for production alerts

# Custom Headers (Optional)
# custom_headers = [
#   {
#     header = "X-Custom-Header"
#     value  = "custom-value"
#   }
# ]
