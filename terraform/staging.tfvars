# ============================================================================
# Terraform Variables - Staging Environment
# ============================================================================

project_name = "react-app"
environment  = "staging"
aws_region   = "us-east-1"
cost_center  = "Engineering-Staging"

# S3 Configuration
s3_bucket_name                     = ""  # Auto-generated with account ID
enable_versioning                  = true
noncurrent_version_expiration_days = 30

# CloudFront Configuration
domain_names             = []  # Add custom domain if needed: ["staging.example.com"]
acm_certificate_arn      = ""  # Add ACM certificate ARN for custom domain
cloudfront_price_class   = "PriceClass_100"
enable_origin_shield     = false
enable_spa_mode          = true

# Security Configuration
content_security_policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
cors_allowed_origins    = ["*"]
geo_restriction_type    = "none"
geo_restriction_locations = []

# WAF Configuration
enable_waf      = true  # Enable WAF for staging
waf_rate_limit  = 3000

# Logging Configuration
enable_logging             = true
log_retention_days         = 30
enable_realtime_logs       = false
realtime_log_sampling_rate = 100

# Route53 Configuration
create_route53_records = false  # Set to true if using custom domain
route53_zone_name      = ""     # Add hosted zone name if needed

# Monitoring Configuration
enable_cloudwatch_alarms        = true
cloudfront_4xx_error_threshold  = 8.0
cloudfront_5xx_error_threshold  = 3.0
alarm_sns_topic_arn            = ""  # Add SNS topic ARN for alerts
