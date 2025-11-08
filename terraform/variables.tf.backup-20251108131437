# Terraform Variables
# React 19 Application Infrastructure Configuration

# =============================================================================
# GENERAL CONFIGURATION
# =============================================================================

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "react-app"
  
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "owner" {
  description = "Owner of the resources"
  type        = string
  default     = "DevOps Team"
}

variable "cost_center" {
  description = "Cost center for billing"
  type        = string
  default     = "Engineering"
}

variable "gitlab_project_path" {
  description = "GitLab project path for tracking"
  type        = string
  default     = ""
}

variable "max_availability_zones" {
  description = "Maximum number of availability zones to use"
  type        = number
  default     = 3
}

# =============================================================================
# NETWORK CONFIGURATION
# =============================================================================

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
  
  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR must be a valid IPv4 CIDR block."
  }
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24", "10.0.30.0/24"]
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets"
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Use single NAT Gateway for cost optimization"
  type        = bool
  default     = false
}

variable "enable_vpn_gateway" {
  description = "Enable VPN Gateway"
  type        = bool
  default     = false
}

variable "enable_dns_hostnames" {
  description = "Enable DNS hostnames in VPC"
  type        = bool
  default     = true
}

variable "enable_dns_support" {
  description = "Enable DNS support in VPC"
  type        = bool
  default     = true
}

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================

variable "application_port" {
  description = "Port on which the application runs"
  type        = number
  default     = 3000
}

variable "allowed_cidrs" {
  description = "CIDR blocks allowed to access the application"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "enable_waf" {
  description = "Enable AWS WAF for additional security"
  type        = bool
  default     = true
}

variable "waf_rate_limit" {
  description = "WAF rate limit per 5-minute period"
  type        = number
  default     = 2000
}

variable "waf_allowed_countries" {
  description = "List of allowed country codes for WAF geo-blocking"
  type        = list(string)
  default     = ["US", "CA", "GB", "DE", "FR", "AU", "JP", "IN"]
}

variable "ssl_certificate_arn" {
  description = "ARN of SSL certificate for HTTPS"
  type        = string
  default     = ""
}

# =============================================================================
# CONTAINER CONFIGURATION
# =============================================================================

variable "ecr_repository_name" {
  description = "Name of the ECR repository"
  type        = string
  default     = "react-app"
}

variable "image_tag_mutability" {
  description = "Image tag mutability setting for ECR"
  type        = string
  default     = "MUTABLE"
  
  validation {
    condition     = contains(["MUTABLE", "IMMUTABLE"], var.image_tag_mutability)
    error_message = "Image tag mutability must be either MUTABLE or IMMUTABLE."
  }
}

variable "image_scanning_on_push" {
  description = "Enable image scanning on push to ECR"
  type        = bool
  default     = true
}

variable "container_name" {
  description = "Name of the container"
  type        = string
  default     = "react-app"
}

variable "container_port" {
  description = "Port exposed by the container"
  type        = number
  default     = 3000
}

variable "container_cpu" {
  description = "CPU units for the container (1024 = 1 vCPU)"
  type        = number
  default     = 512
  
  validation {
    condition     = contains([256, 512, 1024, 2048, 4096], var.container_cpu)
    error_message = "Container CPU must be one of: 256, 512, 1024, 2048, 4096."
  }
}

variable "container_memory" {
  description = "Memory for the container (in MB)"
  type        = number
  default     = 1024
  
  validation {
    condition = (
      (var.container_cpu == 256 && contains([512, 1024, 2048], var.container_memory)) ||
      (var.container_cpu == 512 && var.container_memory >= 1024 && var.container_memory <= 4096) ||
      (var.container_cpu == 1024 && var.container_memory >= 2048 && var.container_memory <= 8192) ||
      (var.container_cpu == 2048 && var.container_memory >= 4096 && var.container_memory <= 16384) ||
      (var.container_cpu == 4096 && var.container_memory >= 8192 && var.container_memory <= 30720)
    )
    error_message = "Container memory must be compatible with CPU allocation. See AWS Fargate task sizing documentation."
  }
}

variable "health_check_path" {
  description = "Health check path for the application"
  type        = string
  default     = "/health"
}

variable "health_check_interval" {
  description = "Health check interval in seconds"
  type        = number
  default     = 30
}

variable "health_check_timeout" {
  description = "Health check timeout in seconds"
  type        = number
  default     = 5
}

variable "environment_variables" {
  description = "Environment variables for the container"
  type        = map(string)
  default     = {
    NODE_ENV = "production"
    PORT     = "3000"
  }
}

variable "secrets" {
  description = "Secrets for the container (stored in AWS Secrets Manager)"
  type        = map(string)
  default     = {}
}

# =============================================================================
# COMPUTE CONFIGURATION
# =============================================================================

variable "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
  default     = "react-app-cluster"
}

variable "enable_container_insights" {
  description = "Enable CloudWatch Container Insights"
  type        = bool
  default     = true
}

variable "service_name" {
  description = "Name of the ECS service"
  type        = string
  default     = "react-app-service"
}

variable "desired_count" {
  description = "Desired number of running tasks"
  type        = number
  default     = 2
  
  validation {
    condition     = var.desired_count >= 1 && var.desired_count <= 100
    error_message = "Desired count must be between 1 and 100."
  }
}

variable "min_capacity" {
  description = "Minimum number of running tasks"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum number of running tasks"
  type        = number
  default     = 10
}

variable "cpu_target_value" {
  description = "Target CPU utilization percentage for auto scaling"
  type        = number
  default     = 70
  
  validation {
    condition     = var.cpu_target_value >= 1 && var.cpu_target_value <= 100
    error_message = "CPU target value must be between 1 and 100."
  }
}

variable "memory_target_value" {
  description = "Target memory utilization percentage for auto scaling"
  type        = number
  default     = 80
  
  validation {
    condition     = var.memory_target_value >= 1 && var.memory_target_value <= 100
    error_message = "Memory target value must be between 1 and 100."
  }
}

variable "enable_blue_green" {
  description = "Enable blue/green deployment"
  type        = bool
  default     = true
}

# =============================================================================
# API GATEWAY CONFIGURATION
# =============================================================================

variable "create_api_gateway" {
  description = "Create API Gateway for API endpoints"
  type        = bool
  default     = false
}

variable "api_gateway_name" {
  description = "Name of the API Gateway"
  type        = string
  default     = "react-app-api"
}

variable "api_gateway_description" {
  description = "Description of the API Gateway"
  type        = string
  default     = "API Gateway for React 19 application"
}

variable "lambda_functions" {
  description = "Lambda functions configuration for API Gateway"
  type = map(object({
    filename         = string
    function_name    = string
    handler         = string
    runtime         = string
    memory_size     = number
    timeout         = number
    environment_vars = map(string)
  }))
  default = {}
}

variable "api_key_required" {
  description = "Require API key for API Gateway"
  type        = bool
  default     = false
}

variable "throttle_settings" {
  description = "API Gateway throttle settings"
  type = object({
    rate_limit  = number
    burst_limit = number
  })
  default = {
    rate_limit  = 1000
    burst_limit = 2000
  }
}

# =============================================================================
# MONITORING CONFIGURATION
# =============================================================================

variable "log_retention_in_days" {
  description = "CloudWatch log retention period in days"
  type        = number
  default     = 14
  
  validation {
    condition = contains([
      1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653
    ], var.log_retention_in_days)
    error_message = "Log retention must be a valid CloudWatch log retention value."
  }
}

variable "enable_xray_tracing" {
  description = "Enable X-Ray tracing"
  type        = bool
  default     = true
}

variable "sns_topic_arn" {
  description = "SNS topic ARN for alerts"
  type        = string
  default     = ""
}

variable "alert_email" {
  description = "Email address for alerts"
  type        = string
  default     = ""
}

variable "cpu_alarm_threshold" {
  description = "CPU utilization threshold for alarms (%)"
  type        = number
  default     = 80
}

variable "memory_alarm_threshold" {
  description = "Memory utilization threshold for alarms (%)"
  type        = number
  default     = 85
}

variable "response_time_threshold" {
  description = "Response time threshold for alarms (seconds)"
  type        = number
  default     = 2
}

variable "error_rate_threshold" {
  description = "Error rate threshold for alarms (%)"
  type        = number
  default     = 5
}

# =============================================================================
# DATABASE CONFIGURATION (Optional)
# =============================================================================

variable "create_database" {
  description = "Create RDS database"
  type        = bool
  default     = false
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage (GB)"
  type        = number
  default     = 20
}

variable "db_engine" {
  description = "RDS engine"
  type        = string
  default     = "postgres"
}

variable "db_engine_version" {
  description = "RDS engine version"
  type        = string
  default     = "13.7"
}