# Terraform Outputs
# React 19 Application Infrastructure Outputs

# =============================================================================
# GENERAL OUTPUTS
# =============================================================================

output "account_id" {
  description = "AWS Account ID"
  value       = local.account_id
}

output "region" {
  description = "AWS Region"
  value       = local.region
}

output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "project_name" {
  description = "Project name"
  value       = var.project_name
}

# =============================================================================
# NETWORK OUTPUTS
# =============================================================================

output "vpc_id" {
  description = "VPC ID"
  value       = module.network.vpc_id
}

output "vpc_cidr_block" {
  description = "VPC CIDR block"
  value       = module.network.vpc_cidr_block
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.network.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.network.private_subnet_ids
}

output "internet_gateway_id" {
  description = "Internet Gateway ID"
  value       = module.network.internet_gateway_id
}

output "nat_gateway_ids" {
  description = "NAT Gateway IDs"
  value       = module.network.nat_gateway_ids
}

# =============================================================================
# SECURITY OUTPUTS
# =============================================================================

output "alb_security_group_id" {
  description = "Application Load Balancer Security Group ID"
  value       = module.security.alb_security_group_id
}

output "ecs_security_group_id" {
  description = "ECS Security Group ID"
  value       = module.security.ecs_security_group_id
}

output "ecs_task_execution_role_arn" {
  description = "ECS Task Execution Role ARN"
  value       = module.security.ecs_task_execution_role_arn
}

output "ecs_task_role_arn" {
  description = "ECS Task Role ARN"
  value       = module.security.ecs_task_role_arn
}

output "waf_web_acl_id" {
  description = "WAF Web ACL ID"
  value       = var.enable_waf ? module.security.waf_web_acl_id : null
}

# =============================================================================
# CONTAINER OUTPUTS
# =============================================================================

output "ecr_repository_url" {
  description = "ECR Repository URL"
  value       = module.container.ecr_repository_url
}

output "ecr_repository_arn" {
  description = "ECR Repository ARN"
  value       = module.container.ecr_repository_arn
}

output "task_definition_arn" {
  description = "ECS Task Definition ARN"
  value       = module.container.task_definition_arn
}

output "task_definition_family" {
  description = "ECS Task Definition Family"
  value       = module.container.task_definition_family
}

output "task_definition_revision" {
  description = "ECS Task Definition Revision"
  value       = module.container.task_definition_revision
}

# =============================================================================
# COMPUTE OUTPUTS
# =============================================================================

output "ecs_cluster_id" {
  description = "ECS Cluster ID"
  value       = module.compute.ecs_cluster_id
}

output "ecs_cluster_name" {
  description = "ECS Cluster Name"
  value       = module.compute.ecs_cluster_name
}

output "ecs_cluster_arn" {
  description = "ECS Cluster ARN"
  value       = module.compute.ecs_cluster_arn
}

output "ecs_service_id" {
  description = "ECS Service ID"
  value       = module.compute.ecs_service_id
}

output "ecs_service_name" {
  description = "ECS Service Name"
  value       = module.compute.ecs_service_name
}

output "ecs_service_arn" {
  description = "ECS Service ARN"
  value       = module.compute.ecs_service_arn
}

output "alb_arn" {
  description = "Application Load Balancer ARN"
  value       = module.compute.alb_arn
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS Name"
  value       = module.compute.alb_dns_name
}

output "alb_zone_id" {
  description = "Application Load Balancer Zone ID"
  value       = module.compute.alb_zone_id
}

output "alb_target_group_arn" {
  description = "ALB Target Group ARN"
  value       = module.compute.alb_target_group_arn
}

# =============================================================================
# API GATEWAY OUTPUTS
# =============================================================================

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = var.create_api_gateway ? module.api[0].api_gateway_id : null
}

output "api_gateway_url" {
  description = "API Gateway URL"
  value       = var.create_api_gateway ? module.api[0].api_gateway_url : null
}

output "api_gateway_stage_name" {
  description = "API Gateway stage name"
  value       = var.create_api_gateway ? module.api[0].api_gateway_stage_name : null
}

# =============================================================================
# MONITORING OUTPUTS
# =============================================================================

output "cloudwatch_log_group_name" {
  description = "CloudWatch Log Group Name"
  value       = module.monitoring.cloudwatch_log_group_name
}

output "cloudwatch_log_group_arn" {
  description = "CloudWatch Log Group ARN"
  value       = module.monitoring.cloudwatch_log_group_arn
}

output "sns_topic_arn" {
  description = "SNS Topic ARN for alerts"
  value       = module.monitoring.sns_topic_arn
}

# =============================================================================
# APPLICATION URLS
# =============================================================================

output "application_url" {
  description = "Application URL (HTTP)"
  value       = "http://${module.compute.alb_dns_name}"
}

output "application_https_url" {
  description = "Application URL (HTTPS)"
  value       = var.ssl_certificate_arn != "" ? "https://${module.compute.alb_dns_name}" : "SSL certificate not configured"
}

# =============================================================================
# DEPLOYMENT INFORMATION
# =============================================================================

output "deployment_info" {
  description = "Deployment information for CI/CD"
  value = {
    cluster_name         = module.compute.ecs_cluster_name
    service_name         = module.compute.ecs_service_name
    task_definition_arn  = module.container.task_definition_arn
    ecr_repository_url   = module.container.ecr_repository_url
    alb_target_group_arn = module.compute.alb_target_group_arn
    region              = local.region
    account_id          = local.account_id
  }
}

# =============================================================================
# RESOURCE IDENTIFIERS FOR GITLAB CI/CD
# =============================================================================

output "gitlab_ci_variables" {
  description = "Variables to be set in GitLab CI/CD"
  value = {
    AWS_REGION                = local.region
    AWS_ACCOUNT_ID           = local.account_id
    ECR_REPOSITORY_URL       = module.container.ecr_repository_url
    ECS_CLUSTER_NAME         = module.compute.ecs_cluster_name
    ECS_SERVICE_NAME         = module.compute.ecs_service_name
    TASK_DEFINITION_FAMILY   = module.container.task_definition_family
    ALB_TARGET_GROUP_ARN     = module.compute.alb_target_group_arn
    APPLICATION_URL          = "http://${module.compute.alb_dns_name}"
    CLOUDWATCH_LOG_GROUP     = module.monitoring.cloudwatch_log_group_name
  }
  sensitive = false
}

# =============================================================================
# HEALTH CHECK INFORMATION
# =============================================================================

output "health_check_url" {
  description = "Health check URL"
  value       = "http://${module.compute.alb_dns_name}${var.health_check_path}"
}

# =============================================================================
# COST INFORMATION
# =============================================================================

output "estimated_monthly_cost" {
  description = "Estimated monthly cost (approximate)"
  value = {
    fargate_tasks    = "$${var.desired_count * var.container_cpu * 0.04048 * 24 * 30 + var.desired_count * var.container_memory * 0.004445 * 24 * 30}"
    application_load_balancer = "$22.00"
    nat_gateway     = var.enable_nat_gateway ? (var.single_nat_gateway ? "$32.00" : "$${length(local.azs) * 32}") : "$0.00"
    cloudwatch_logs = "$5.00 - $20.00"
    data_transfer   = "$Variable based on usage"
    note           = "This is an approximate cost. Actual costs may vary based on usage patterns."
  }
}