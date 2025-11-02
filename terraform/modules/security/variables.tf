# Security Module Variables
# Comprehensive security configuration options

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "common_tags" {
  description = "Common tags to be applied to all resources"
  type        = map(string)
  default     = {}
}

# Network Configuration
variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "container_port" {
  description = "Port on which the container runs"
  type        = number
  default     = 3000

  validation {
    condition     = var.container_port > 0 && var.container_port <= 65535
    error_message = "Container port must be between 1 and 65535."
  }
}

# Database Configuration
variable "enable_database_security_group" {
  description = "Enable database security group"
  type        = bool
  default     = false
}

variable "database_port" {
  description = "Database port"
  type        = number
  default     = 5432

  validation {
    condition     = var.database_port > 0 && var.database_port <= 65535
    error_message = "Database port must be between 1 and 65535."
  }
}

# WAF Configuration
variable "enable_waf" {
  description = "Enable AWS WAF protection"
  type        = bool
  default     = true
}

variable "waf_rate_limit" {
  description = "Rate limit for WAF (requests per 5 minutes)"
  type        = number
  default     = 2000

  validation {
    condition     = var.waf_rate_limit >= 100 && var.waf_rate_limit <= 20000000
    error_message = "WAF rate limit must be between 100 and 20,000,000."
  }
}

variable "enable_waf_logging" {
  description = "Enable WAF logging to CloudWatch"
  type        = bool
  default     = true
}

variable "waf_blocked_countries" {
  description = "List of country codes to block (ISO 3166-1 alpha-2)"
  type        = list(string)
  default     = []

  validation {
    condition = alltrue([
      for country in var.waf_blocked_countries : length(country) == 2
    ])
    error_message = "Country codes must be 2-character ISO 3166-1 alpha-2 codes."
  }
}

# Encryption Configuration
variable "enable_encryption" {
  description = "Enable KMS encryption for resources"
  type        = bool
  default     = true
}

variable "kms_deletion_window" {
  description = "KMS key deletion window in days"
  type        = number
  default     = 7

  validation {
    condition     = var.kms_deletion_window >= 7 && var.kms_deletion_window <= 30
    error_message = "KMS deletion window must be between 7 and 30 days."
  }
}

# Secrets Management
variable "enable_secrets_manager" {
  description = "Enable AWS Secrets Manager for application secrets"
  type        = bool
  default     = true
}

variable "secrets_recovery_window" {
  description = "Secrets recovery window in days"
  type        = number
  default     = 7

  validation {
    condition     = var.secrets_recovery_window >= 7 && var.secrets_recovery_window <= 30
    error_message = "Secrets recovery window must be between 7 and 30 days."
  }
}

# SSL Certificate Configuration
variable "create_ssl_certificate" {
  description = "Create SSL certificate with ACM"
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Domain name for SSL certificate"
  type        = string
  default     = ""

  validation {
    condition = var.domain_name == "" || can(regex("^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\\.[a-zA-Z]{2,}$", var.domain_name))
    error_message = "Domain name must be a valid domain or empty string."
  }
}

variable "subject_alternative_names" {
  description = "Subject alternative names for SSL certificate"
  type        = list(string)
  default     = []

  validation {
    condition = alltrue([
      for san in var.subject_alternative_names : can(regex("^[a-zA-Z0-9][a-zA-Z0-9-*.]{0,61}[a-zA-Z0-9]?\\.[a-zA-Z]{2,}$", san))
    ])
    error_message = "All subject alternative names must be valid domain names."
  }
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID for certificate validation"
  type        = string
  default     = ""
}

variable "ssl_certificate_arn" {
  description = "ARN of existing SSL certificate (if not creating new one)"
  type        = string
  default     = ""

  validation {
    condition = var.ssl_certificate_arn == "" || can(regex("^arn:aws:acm:", var.ssl_certificate_arn))
    error_message = "SSL certificate ARN must be a valid ACM certificate ARN or empty string."
  }
}

# CloudTrail Configuration
variable "enable_cloudtrail" {
  description = "Enable AWS CloudTrail for API logging"
  type        = bool
  default     = false
}

variable "cloudtrail_s3_key_prefix" {
  description = "S3 key prefix for CloudTrail logs"
  type        = string
  default     = "cloudtrail"
}

# Security Monitoring
variable "enable_security_monitoring" {
  description = "Enable security monitoring and alerting"
  type        = bool
  default     = true
}

variable "security_alert_email" {
  description = "Email address for security alerts"
  type        = string
  default     = ""

  validation {
    condition = var.security_alert_email == "" || can(regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", var.security_alert_email))
    error_message = "Security alert email must be a valid email address or empty string."
  }
}

# IAM Configuration
variable "enable_iam_access_analyzer" {
  description = "Enable IAM Access Analyzer"
  type        = bool
  default     = true
}

variable "ecs_task_cpu" {
  description = "CPU units for ECS task (used for IAM policies)"
  type        = number
  default     = 256

  validation {
    condition = contains([256, 512, 1024, 2048, 4096], var.ecs_task_cpu)
    error_message = "ECS task CPU must be one of: 256, 512, 1024, 2048, 4096."
  }
}

variable "ecs_task_memory" {
  description = "Memory for ECS task (used for IAM policies)"
  type        = number
  default     = 512

  validation {
    condition     = var.ecs_task_memory >= 512 && var.ecs_task_memory <= 30720
    error_message = "ECS task memory must be between 512 and 30720 MB."
  }
}

# Network Security
variable "allowed_cidr_blocks" {
  description = "List of CIDR blocks allowed to access the application"
  type        = list(string)
  default     = ["0.0.0.0/0"]

  validation {
    condition = alltrue([
      for cidr in var.allowed_cidr_blocks : can(cidrhost(cidr, 0))
    ])
    error_message = "All CIDR blocks must be valid IPv4 CIDR blocks."
  }
}

variable "enable_https_redirect" {
  description = "Enable HTTP to HTTPS redirect"
  type        = bool
  default     = true
}

# Security Compliance
variable "enable_encryption_in_transit" {
  description = "Enable encryption in transit"
  type        = bool
  default     = true
}

variable "enable_encryption_at_rest" {
  description = "Enable encryption at rest"
  type        = bool
  default     = true
}

variable "compliance_standard" {
  description = "Compliance standard to follow (SOC2, HIPAA, PCI-DSS, etc.)"
  type        = string
  default     = "SOC2"

  validation {
    condition = contains([
      "SOC2", "HIPAA", "PCI-DSS", "GDPR", "ISO27001", "FedRAMP", "none"
    ], var.compliance_standard)
    error_message = "Compliance standard must be one of: SOC2, HIPAA, PCI-DSS, GDPR, ISO27001, FedRAMP, none."
  }
}

# Advanced Security Features
variable "enable_guard_duty" {
  description = "Enable AWS GuardDuty threat detection"
  type        = bool
  default     = false
}

variable "enable_security_hub" {
  description = "Enable AWS Security Hub"
  type        = bool
  default     = false
}

variable "enable_config" {
  description = "Enable AWS Config for compliance monitoring"
  type        = bool
  default     = false
}