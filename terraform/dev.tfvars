# ============================================================================
# Terraform Variables - Development Environment
# ============================================================================

project_name = "react-app"
environment  = "dev"
aws_region   = "us-east-1"
cost_center  = "Engineering-Dev"

# S3 Configuration
s3_bucket_name                     = ""  # Auto-generated with account ID
enable_versioning                  = false
noncurrent_version_expiration_days = 7

# CloudFront Configuration
domain_names             = []  # No custom domain for dev
acm_certificate_arn      = ""
cloudfront_price_class   = "PriceClass_100"
enable_origin_shield     = false
enable_spa_mode          = true

# Security Configuration
content_security_policy = "default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' http://localhost:* ws://localhost:*;"
cors_allowed_origins    = ["*"]
geo_restriction_type    = "none"
geo_restriction_locations = []

# WAF Configuration
enable_waf      = false  # Disable WAF for dev to save costs
waf_rate_limit  = 5000

# Logging Configuration
enable_logging             = false  # Disable logging for dev
log_retention_days         = 7
enable_realtime_logs       = false
realtime_log_sampling_rate = 100

# Route53 Configuration
create_route53_records = false
route53_zone_name      = ""

# Monitoring Configuration
enable_cloudwatch_alarms        = false  # Disable alarms for dev
cloudfront_4xx_error_threshold  = 10.0
cloudfront_5xx_error_threshold  = 5.0
alarm_sns_topic_arn            = ""
