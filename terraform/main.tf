# Terraform Root Configuration
# React 19 Application Infrastructure on AWS

terraform {
  required_version = ">= 1.6.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.1"
    }
  }

  # Backend configuration for state management
  backend "s3" {
    # These values should be set via backend-config during terraform init
    # terraform init -backend-config="bucket=your-terraform-state-bucket"
    # bucket         = "terraform-state-bucket"
    # key            = "react-app/terraform.tfstate"
    # region         = "us-east-1"
    # encrypt        = true
    # dynamodb_table = "terraform-state-lock"
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region

  # Common tags for all resources
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Owner       = var.owner
      Application = "react-19-app"
      CostCenter  = var.cost_center
    }
  }
}

# Data sources for existing AWS resources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
data "aws_availability_zones" "available" {
  state = "available"
}

# Random password for database (if needed)
resource "random_password" "db_password" {
  count   = var.create_database ? 1 : 0
  length  = 16
  special = true
}

# Local values for computed configurations
locals {
  account_id = data.aws_caller_identity.current.account_id
  region     = data.aws_region.current.name
  
  # Common naming convention
  name_prefix = "${var.project_name}-${var.environment}"
  
  # Availability zones (minimum 2 for high availability)
  azs = slice(data.aws_availability_zones.available.names, 0, min(length(data.aws_availability_zones.available.names), var.max_availability_zones))
  
  # Common tags
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Owner       = var.owner
    Application = "react-19-app"
    CostCenter  = var.cost_center
    GitlabProject = var.gitlab_project_path
    CreatedAt   = timestamp()
  }
}

# Network Module - VPC, Subnets, Routing
module "network" {
  source = "./modules/network"

  name_prefix         = local.name_prefix
  vpc_cidr           = var.vpc_cidr
  availability_zones = local.azs
  
  # Subnet configuration
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  
  # NAT Gateway configuration
  enable_nat_gateway     = var.enable_nat_gateway
  single_nat_gateway     = var.single_nat_gateway
  enable_vpn_gateway     = var.enable_vpn_gateway
  
  # DNS configuration
  enable_dns_hostnames = var.enable_dns_hostnames
  enable_dns_support   = var.enable_dns_support
  
  tags = local.common_tags
}

# Security Module - IAM, Security Groups, WAF
module "security" {
  source = "./modules/security"

  name_prefix = local.name_prefix
  vpc_id      = module.network.vpc_id
  
  # Application configuration
  application_port = var.application_port
  allowed_cidrs   = var.allowed_cidrs
  
  # WAF configuration
  enable_waf          = var.enable_waf
  waf_rate_limit      = var.waf_rate_limit
  waf_allowed_countries = var.waf_allowed_countries
  
  # SSL configuration
  ssl_certificate_arn = var.ssl_certificate_arn
  
  tags = local.common_tags
}

# Container Module - ECR, ECS Task Definitions
module "container" {
  source = "./modules/container"

  name_prefix = local.name_prefix
  
  # ECR configuration
  ecr_repository_name = var.ecr_repository_name
  image_tag_mutability = var.image_tag_mutability
  image_scanning_on_push = var.image_scanning_on_push
  
  # Container configuration
  container_name   = var.container_name
  container_port   = var.container_port
  container_cpu    = var.container_cpu
  container_memory = var.container_memory
  
  # Health check configuration
  health_check_path     = var.health_check_path
  health_check_interval = var.health_check_interval
  health_check_timeout  = var.health_check_timeout
  
  # Environment variables
  environment_variables = var.environment_variables
  secrets              = var.secrets
  
  # IAM roles from security module
  ecs_task_execution_role_arn = module.security.ecs_task_execution_role_arn
  ecs_task_role_arn          = module.security.ecs_task_role_arn
  
  tags = local.common_tags
}

# Compute Module - ECS/Fargate, ALB, Auto Scaling
module "compute" {
  source = "./modules/compute"

  name_prefix = local.name_prefix
  
  # Network configuration
  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids
  private_subnet_ids = module.network.private_subnet_ids
  
  # Security configuration
  alb_security_group_id = module.security.alb_security_group_id
  ecs_security_group_id = module.security.ecs_security_group_id
  
  # ECS configuration
  ecs_cluster_name = var.ecs_cluster_name
  enable_container_insights = var.enable_container_insights
  
  # Fargate service configuration
  service_name         = var.service_name
  task_definition_arn  = module.container.task_definition_arn
  desired_count        = var.desired_count
  min_capacity         = var.min_capacity
  max_capacity         = var.max_capacity
  
  # Load balancer configuration
  certificate_arn    = var.ssl_certificate_arn
  health_check_path  = var.health_check_path
  target_port        = var.container_port
  
  # Auto scaling configuration
  cpu_target_value    = var.cpu_target_value
  memory_target_value = var.memory_target_value
  
  # Blue/Green deployment
  enable_blue_green = var.enable_blue_green
  
  tags = local.common_tags
}

# API Module - API Gateway, Lambda (if needed)
module "api" {
  source = "./modules/api"
  count  = var.create_api_gateway ? 1 : 0

  name_prefix = local.name_prefix
  
  # API Gateway configuration
  api_gateway_name        = var.api_gateway_name
  api_gateway_description = var.api_gateway_description
  api_gateway_stage_name  = var.environment
  
  # Lambda configuration (if using Lambda for API)
  lambda_functions = var.lambda_functions
  
  # Integration with ALB (if using direct integration)
  alb_arn = module.compute.alb_arn
  
  # Security
  api_key_required = var.api_key_required
  throttle_settings = var.throttle_settings
  
  tags = local.common_tags
}

# Monitoring Module - CloudWatch, X-Ray, Alarms
module "monitoring" {
  source = "./modules/monitoring"

  name_prefix = local.name_prefix
  
  # ECS monitoring
  ecs_cluster_name = module.compute.ecs_cluster_name
  ecs_service_name = module.compute.ecs_service_name
  
  # ALB monitoring
  alb_arn_suffix = module.compute.alb_arn_suffix
  target_group_arn_suffix = module.compute.target_group_arn_suffix
  
  # CloudWatch configuration
  log_retention_in_days = var.log_retention_in_days
  
  # X-Ray tracing
  enable_xray_tracing = var.enable_xray_tracing
  
  # Alerting
  sns_topic_arn = var.sns_topic_arn
  alert_email   = var.alert_email
  
  # Thresholds
  cpu_alarm_threshold    = var.cpu_alarm_threshold
  memory_alarm_threshold = var.memory_alarm_threshold
  response_time_threshold = var.response_time_threshold
  error_rate_threshold   = var.error_rate_threshold
  
  tags = local.common_tags
}