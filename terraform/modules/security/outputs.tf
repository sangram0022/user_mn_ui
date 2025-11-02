# Security Module Outputs
# Provides security resource information for other modules

# IAM Roles
output "ecs_task_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  value       = aws_iam_role.ecs_task_execution_role.arn
}

output "ecs_task_execution_role_name" {
  description = "Name of the ECS task execution role"
  value       = aws_iam_role.ecs_task_execution_role.name
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  value       = aws_iam_role.ecs_task_role.arn
}

output "ecs_task_role_name" {
  description = "Name of the ECS task role"
  value       = aws_iam_role.ecs_task_role.name
}

# Security Groups
output "alb_security_group_id" {
  description = "ID of the ALB security group"
  value       = aws_security_group.alb.id
}

output "ecs_service_security_group_id" {
  description = "ID of the ECS service security group"
  value       = aws_security_group.ecs_service.id
}

output "database_security_group_id" {
  description = "ID of the database security group"
  value       = var.enable_database_security_group ? aws_security_group.database[0].id : null
}

# WAF
output "waf_web_acl_id" {
  description = "ID of the WAF Web ACL"
  value       = var.enable_waf ? aws_wafv2_web_acl.main[0].id : null
}

output "waf_web_acl_arn" {
  description = "ARN of the WAF Web ACL"
  value       = var.enable_waf ? aws_wafv2_web_acl.main[0].arn : null
}

# Encryption
output "kms_key_id" {
  description = "ID of the KMS key"
  value       = var.enable_encryption ? aws_kms_key.main[0].key_id : null
}

output "kms_key_arn" {
  description = "ARN of the KMS key"
  value       = var.enable_encryption ? aws_kms_key.main[0].arn : null
}

output "kms_alias_name" {
  description = "Name of the KMS key alias"
  value       = var.enable_encryption ? aws_kms_alias.main[0].name : null
}

# Secrets Manager
output "secrets_manager_secret_arn" {
  description = "ARN of the Secrets Manager secret"
  value       = var.enable_secrets_manager ? aws_secretsmanager_secret.app_secrets[0].arn : null
}

output "secrets_manager_secret_name" {
  description = "Name of the Secrets Manager secret"
  value       = var.enable_secrets_manager ? aws_secretsmanager_secret.app_secrets[0].name : null
}

# SSL Certificate
output "ssl_certificate_arn" {
  description = "ARN of the SSL certificate"
  value = var.create_ssl_certificate && var.domain_name != "" ? aws_acm_certificate.main[0].arn : var.ssl_certificate_arn
}

output "ssl_certificate_domain_name" {
  description = "Domain name of the SSL certificate"
  value       = var.create_ssl_certificate && var.domain_name != "" ? aws_acm_certificate.main[0].domain_name : var.domain_name
}

# CloudTrail
output "cloudtrail_arn" {
  description = "ARN of the CloudTrail"
  value       = var.enable_cloudtrail ? aws_cloudtrail.main[0].arn : null
}

output "cloudtrail_s3_bucket" {
  description = "S3 bucket for CloudTrail logs"
  value       = var.enable_cloudtrail ? aws_s3_bucket.cloudtrail[0].bucket : null
}

# CloudWatch Log Groups
output "waf_log_group_name" {
  description = "Name of the WAF CloudWatch log group"
  value       = var.enable_waf && var.enable_waf_logging ? aws_cloudwatch_log_group.waf[0].name : null
}

output "waf_log_group_arn" {
  description = "ARN of the WAF CloudWatch log group"
  value       = var.enable_waf && var.enable_waf_logging ? aws_cloudwatch_log_group.waf[0].arn : null
}

# Security Summary
output "security_summary" {
  description = "Summary of security configuration"
  value = {
    waf_enabled                = var.enable_waf
    encryption_enabled         = var.enable_encryption
    secrets_manager_enabled    = var.enable_secrets_manager
    ssl_certificate_configured = var.create_ssl_certificate || var.ssl_certificate_arn != ""
    cloudtrail_enabled         = var.enable_cloudtrail
    database_security_enabled  = var.enable_database_security_group
    compliance_standard        = var.compliance_standard
  }
}

# Security Configuration for GitLab CI/CD
output "gitlab_variables" {
  description = "Variables for GitLab CI/CD integration"
  value = {
    ECS_TASK_EXECUTION_ROLE_ARN = aws_iam_role.ecs_task_execution_role.arn
    ECS_TASK_ROLE_ARN          = aws_iam_role.ecs_task_role.arn
    ALB_SECURITY_GROUP_ID      = aws_security_group.alb.id
    ECS_SECURITY_GROUP_ID      = aws_security_group.ecs_service.id
    WAF_WEB_ACL_ARN           = var.enable_waf ? aws_wafv2_web_acl.main[0].arn : ""
    KMS_KEY_ARN               = var.enable_encryption ? aws_kms_key.main[0].arn : ""
    SSL_CERTIFICATE_ARN       = var.create_ssl_certificate && var.domain_name != "" ? aws_acm_certificate.main[0].arn : var.ssl_certificate_arn
    SECRETS_MANAGER_ARN       = var.enable_secrets_manager ? aws_secretsmanager_secret.app_secrets[0].arn : ""
  }
}

# Security Monitoring URLs
output "security_monitoring_urls" {
  description = "URLs for security monitoring dashboards"
  value = {
    waf_dashboard     = var.enable_waf ? "https://console.aws.amazon.com/wafv2/homev2/web-acl/${aws_wafv2_web_acl.main[0].id}/overview" : null
    cloudtrail_events = var.enable_cloudtrail ? "https://console.aws.amazon.com/cloudtrail/home" : null
    kms_keys          = var.enable_encryption ? "https://console.aws.amazon.com/kms/home" : null
    secrets_manager   = var.enable_secrets_manager ? "https://console.aws.amazon.com/secretsmanager/home" : null
  }
}

# Cost Information
output "estimated_monthly_costs" {
  description = "Estimated monthly costs for security resources"
  value = {
    waf_cost              = var.enable_waf ? 5.00 : 0                                    # $5 per Web ACL
    kms_key_cost          = var.enable_encryption ? 1.00 : 0                            # $1 per key per month
    secrets_manager_cost  = var.enable_secrets_manager ? 0.40 : 0                       # $0.40 per secret per month
    cloudtrail_cost       = var.enable_cloudtrail ? 2.00 : 0                            # $2 per trail per month
    certificate_cost      = var.create_ssl_certificate ? 0 : 0                          # ACM certificates are free
    total_estimated       = (var.enable_waf ? 5.00 : 0) + (var.enable_encryption ? 1.00 : 0) + (var.enable_secrets_manager ? 0.40 : 0) + (var.enable_cloudtrail ? 2.00 : 0)
  }
}

# Compliance Information
output "compliance_info" {
  description = "Compliance and security posture information"
  value = {
    compliance_standard         = var.compliance_standard
    encryption_in_transit       = var.enable_encryption_in_transit
    encryption_at_rest          = var.enable_encryption_at_rest
    waf_protection_enabled     = var.enable_waf
    ssl_tls_configured         = var.create_ssl_certificate || var.ssl_certificate_arn != ""
    logging_enabled            = var.enable_waf_logging || var.enable_cloudtrail
    secrets_management_enabled = var.enable_secrets_manager
    iam_least_privilege        = true # Our IAM roles follow least privilege
  }
}

# Health Check Information
output "security_health_checks" {
  description = "Security health check endpoints and information"
  value = {
    waf_metrics_available    = var.enable_waf
    certificate_expiry_check = var.create_ssl_certificate || var.ssl_certificate_arn != ""
    kms_key_rotation_enabled = var.enable_encryption
    secrets_rotation_enabled = var.enable_secrets_manager
  }
}