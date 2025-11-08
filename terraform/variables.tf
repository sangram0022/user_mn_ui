# ============================================================================
# Terraform Variables for S3 + CloudFront Static Website
# React 19 Application - Simplified Configuration
# ============================================================================

# =============================================================================
# GENERAL CONFIGURATION
# =============================================================================

variable "project_name" {
  description = "Name of the project (used in resource naming)"
  type        = string
  default     = "react-app"
  
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "environment" {
  description = "Environment name"
  type        = string
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

variable "aws_region" {
  description = "AWS region for S3 bucket and related resources"
  type        = string
  default     = "us-east-1"
}

variable "cost_center" {
  description = "Cost center tag for billing"
  type        = string
  default     = "Engineering"
}

variable "repository_url" {
  description = "Repository URL for tracking"
  type        = string
  default     = ""
}

# =============================================================================
# S3 BUCKET CONFIGURATION
# =============================================================================

variable "s3_bucket_name" {
  description = "Name for the S3 bucket (leave empty for auto-generated name with account ID)"
  type        = string
  default     = ""
  
  validation {
    condition     = var.s3_bucket_name == "" || can(regex("^[a-z0-9][a-z0-9-]*[a-z0-9]$", var.s3_bucket_name))
    error_message = "S3 bucket name must be lowercase alphanumeric with hyphens, start and end with alphanumeric."
  }
}

variable "enable_versioning" {
  description = "Enable versioning for S3 bucket (recommended for production)"
  type        = bool
  default     = true
}

variable "noncurrent_version_expiration_days" {
  description = "Days after which non-current object versions will be deleted"
  type        = number
  default     = 30
  
  validation {
    condition     = var.noncurrent_version_expiration_days >= 1 && var.noncurrent_version_expiration_days <= 3650
    error_message = "Non-current version expiration must be between 1 and 3650 days."
  }
}

# =============================================================================
# CLOUDFRONT DISTRIBUTION CONFIGURATION
# =============================================================================

variable "domain_names" {
  description = "List of custom domain names (CNAMEs) for CloudFront distribution"
  type        = list(string)
  default     = []
  
  validation {
    condition     = alltrue([for domain in var.domain_names : can(regex("^[a-z0-9][a-z0-9.-]*[a-z0-9]$", domain))])
    error_message = "Domain names must be valid hostnames."
  }
}

variable "acm_certificate_arn" {
  description = "ARN of ACM certificate for custom domains (must be in us-east-1 for CloudFront)"
  type        = string
  default     = ""
}

variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"  # Use only North America and Europe
  
  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.cloudfront_price_class)
    error_message = "Price class must be one of: PriceClass_100, PriceClass_200, PriceClass_All."
  }
}

variable "enable_origin_shield" {
  description = "Enable CloudFront Origin Shield for additional caching layer"
  type        = bool
  default     = false
}

variable "cache_policy_id" {
  description = "Custom cache policy ID (leave empty to use default optimized policy)"
  type        = string
  default     = ""
}

variable "enable_spa_mode" {
  description = "Enable SPA mode (redirects 403/404 errors to index.html for client-side routing)"
  type        = bool
  default     = true
}

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================

variable "content_security_policy" {
  description = "Content Security Policy header value"
  type        = string
  default     = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.example.com;"
}

variable "cors_allowed_origins" {
  description = "List of allowed origins for CORS"
  type        = list(string)
  default     = ["*"]
}

variable "custom_headers" {
  description = "List of custom headers to add to responses"
  type = list(object({
    header = string
    value  = string
  }))
  default = []
}

variable "geo_restriction_type" {
  description = "Type of geo restriction (none, whitelist, blacklist)"
  type        = string
  default     = "none"
  
  validation {
    condition     = contains(["none", "whitelist", "blacklist"], var.geo_restriction_type)
    error_message = "Geo restriction type must be: none, whitelist, or blacklist."
  }
}

variable "geo_restriction_locations" {
  description = "List of country codes for geo restriction (ISO 3166-1-alpha-2)"
  type        = list(string)
  default     = []
}

# =============================================================================
# WAF CONFIGURATION
# =============================================================================

variable "enable_waf" {
  description = "Enable AWS WAF for CloudFront distribution"
  type        = bool
  default     = true
}

variable "waf_rate_limit" {
  description = "Maximum number of requests per 5 minutes from a single IP"
  type        = number
  default     = 2000
  
  validation {
    condition     = var.waf_rate_limit >= 100 && var.waf_rate_limit <= 20000000
    error_message = "WAF rate limit must be between 100 and 20,000,000."
  }
}

# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================

variable "enable_logging" {
  description = "Enable access logging for S3 and CloudFront"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "Number of days to retain logs"
  type        = number
  default     = 90
  
  validation {
    condition     = var.log_retention_days >= 1 && var.log_retention_days <= 3650
    error_message = "Log retention days must be between 1 and 3650."
  }
}

variable "enable_realtime_logs" {
  description = "Enable CloudFront real-time logs (via Kinesis)"
  type        = bool
  default     = false
}

variable "realtime_log_sampling_rate" {
  description = "Sampling rate for real-time logs (1-100)"
  type        = number
  default     = 100
  
  validation {
    condition     = var.realtime_log_sampling_rate >= 1 && var.realtime_log_sampling_rate <= 100
    error_message = "Real-time log sampling rate must be between 1 and 100."
  }
}

# =============================================================================
# ROUTE53 CONFIGURATION
# =============================================================================

variable "create_route53_records" {
  description = "Create Route53 DNS records for custom domains"
  type        = bool
  default     = false
}

variable "route53_zone_name" {
  description = "Route53 hosted zone name (required if create_route53_records is true)"
  type        = string
  default     = ""
}

# =============================================================================
# MONITORING AND ALARMS
# =============================================================================

variable "enable_cloudwatch_alarms" {
  description = "Enable CloudWatch alarms for CloudFront metrics"
  type        = bool
  default     = true
}

variable "cloudfront_4xx_error_threshold" {
  description = "Threshold for 4xx error rate alarm (percentage)"
  type        = number
  default     = 5.0
}

variable "cloudfront_5xx_error_threshold" {
  description = "Threshold for 5xx error rate alarm (percentage)"
  type        = number
  default     = 1.0
}

variable "alarm_sns_topic_arn" {
  description = "SNS topic ARN for CloudWatch alarms"
  type        = string
  default     = ""
}
