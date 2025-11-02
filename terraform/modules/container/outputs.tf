# Container Module Outputs
# Provides container resource information for other modules

# ECR Repository
output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.main.repository_url
}

output "ecr_repository_arn" {
  description = "ARN of the ECR repository"
  value       = aws_ecr_repository.main.arn
}

output "ecr_repository_name" {
  description = "Name of the ECR repository"
  value       = aws_ecr_repository.main.name
}

output "ecr_repository_registry_id" {
  description = "Registry ID of the ECR repository"
  value       = aws_ecr_repository.main.registry_id
}

# ECS Task Definition
output "task_definition_arn" {
  description = "ARN of the task definition"
  value       = aws_ecs_task_definition.main.arn
}

output "task_definition_family" {
  description = "Family of the task definition"
  value       = aws_ecs_task_definition.main.family
}

output "task_definition_revision" {
  description = "Revision of the task definition"
  value       = aws_ecs_task_definition.main.revision
}

# Blue/Green Task Definition
output "blue_green_task_definition_arn" {
  description = "ARN of the blue/green task definition"
  value       = var.enable_blue_green_deployment ? aws_ecs_task_definition.blue_green[0].arn : null
}

output "blue_green_task_definition_family" {
  description = "Family of the blue/green task definition"
  value       = var.enable_blue_green_deployment ? aws_ecs_task_definition.blue_green[0].family : null
}

# CloudWatch Log Group
output "log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.ecs_tasks.name
}

output "log_group_arn" {
  description = "ARN of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.ecs_tasks.arn
}

# Container Configuration
output "container_name" {
  description = "Name of the container"
  value       = var.container_name
}

output "container_port" {
  description = "Port of the container"
  value       = var.container_port
}

output "container_image" {
  description = "Full container image URI"
  value       = "${aws_ecr_repository.main.repository_url}:${var.image_tag}"
}

# Auto Scaling
output "autoscaling_target_resource_id" {
  description = "Resource ID of the auto scaling target"
  value       = var.enable_auto_scaling ? aws_appautoscaling_target.ecs_target[0].resource_id : null
}

output "autoscaling_policies" {
  description = "Auto scaling policy ARNs"
  value = {
    cpu_policy_arn    = var.enable_auto_scaling ? aws_appautoscaling_policy.ecs_policy_cpu[0].arn : null
    memory_policy_arn = var.enable_auto_scaling ? aws_appautoscaling_policy.ecs_policy_memory[0].arn : null
  }
}

# CloudWatch Dashboard
output "dashboard_url" {
  description = "URL of the CloudWatch dashboard"
  value = var.enable_container_monitoring ? "https://console.aws.amazon.com/cloudwatch/home?region=${data.aws_region.current.name}#dashboards:name=${aws_cloudwatch_dashboard.container_metrics[0].dashboard_name}" : null
}

# Container Summary
output "container_summary" {
  description = "Summary of container configuration"
  value = {
    repository_url              = aws_ecr_repository.main.repository_url
    task_definition_arn        = aws_ecs_task_definition.main.arn
    container_name             = var.container_name
    container_port             = var.container_port
    task_cpu                   = var.task_cpu
    task_memory                = var.task_memory
    auto_scaling_enabled       = var.enable_auto_scaling
    min_capacity               = var.enable_auto_scaling ? var.min_capacity : null
    max_capacity               = var.enable_auto_scaling ? var.max_capacity : null
    health_check_enabled       = var.enable_health_check
    blue_green_enabled         = var.enable_blue_green_deployment
    fargate_spot_enabled       = var.enable_fargate_spot
    container_insights_enabled = var.enable_container_insights
  }
}

# GitLab CI/CD Integration
output "gitlab_variables" {
  description = "Variables for GitLab CI/CD integration"
  value = {
    ECR_REPOSITORY_URI      = aws_ecr_repository.main.repository_url
    ECR_REPOSITORY_NAME     = aws_ecr_repository.main.name
    ECR_REGISTRY_ID         = aws_ecr_repository.main.registry_id
    TASK_DEFINITION_ARN     = aws_ecs_task_definition.main.arn
    TASK_DEFINITION_FAMILY  = aws_ecs_task_definition.main.family
    CONTAINER_NAME          = var.container_name
    CONTAINER_PORT          = var.container_port
    LOG_GROUP_NAME          = aws_cloudwatch_log_group.ecs_tasks.name
    AUTO_SCALING_ENABLED    = var.enable_auto_scaling
    FARGATE_SPOT_ENABLED    = var.enable_fargate_spot
    BLUE_GREEN_ENABLED      = var.enable_blue_green_deployment
  }
}

# Docker Build Information
output "docker_build_info" {
  description = "Information for Docker build and push"
  value = {
    registry_url     = aws_ecr_repository.main.repository_url
    image_tag        = var.image_tag
    blue_green_tag   = var.blue_green_image_tag
    build_command    = "docker build -t ${aws_ecr_repository.main.repository_url}:${var.image_tag} ."
    push_command     = "docker push ${aws_ecr_repository.main.repository_url}:${var.image_tag}"
    ecr_login_command = "aws ecr get-login-password --region ${data.aws_region.current.name} | docker login --username AWS --password-stdin ${aws_ecr_repository.main.repository_url}"
  }
}

# Cost Information
output "estimated_monthly_costs" {
  description = "Estimated monthly costs for container resources"
  value = {
    ecr_storage_cost = 10.00 # Approximate cost for container images
    fargate_cost     = var.task_cpu == 256 ? 14.40 : var.task_cpu == 512 ? 28.80 : var.task_cpu == 1024 ? 57.60 : 115.20 # Per month for 1 task
    cloudwatch_cost  = 5.00  # Approximate cost for logs and metrics
    total_estimated  = 10.00 + (var.task_cpu == 256 ? 14.40 : var.task_cpu == 512 ? 28.80 : var.task_cpu == 1024 ? 57.60 : 115.20) + 5.00
  }
}

# Health Check Information
output "health_check_info" {
  description = "Health check configuration"
  value = var.enable_health_check ? {
    command      = var.health_check_command
    interval     = var.health_check_interval
    timeout      = var.health_check_timeout
    retries      = var.health_check_retries
    start_period = var.health_check_start_period
  } : null
}

# Security Information
output "security_info" {
  description = "Security configuration information"
  value = {
    image_scanning_enabled     = var.enable_image_scanning
    encryption_enabled         = var.enable_encryption
    readonly_root_filesystem   = var.readonly_root_filesystem
    container_user            = var.container_user
    privileged_mode           = false
    security_options          = var.docker_security_options
  }
}

# Monitoring URLs
output "monitoring_urls" {
  description = "URLs for monitoring and observability"
  value = {
    ecr_console        = "https://console.aws.amazon.com/ecr/repositories/${aws_ecr_repository.main.name}"
    cloudwatch_logs    = "https://console.aws.amazon.com/cloudwatch/home?region=${data.aws_region.current.name}#logsV2:log-groups/log-group/${replace(aws_cloudwatch_log_group.ecs_tasks.name, "/", "$252F")}"
    ecs_service_metrics = "https://console.aws.amazon.com/ecs/home?region=${data.aws_region.current.name}#/clusters/${var.cluster_name}/services"
    container_insights  = var.enable_container_insights ? "https://console.aws.amazon.com/ecs/home?region=${data.aws_region.current.name}#/clusters/${var.cluster_name}/containerInsights" : null
  }
}