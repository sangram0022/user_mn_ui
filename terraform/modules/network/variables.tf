# Network Module Variables
# Comprehensive network configuration options

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

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR must be a valid IPv4 CIDR block."
  }
}

# Public Subnets
variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]

  validation {
    condition     = length(var.public_subnet_cidrs) >= 2
    error_message = "At least 2 public subnets are required for high availability."
  }

  validation {
    condition = alltrue([
      for cidr in var.public_subnet_cidrs : can(cidrhost(cidr, 0))
    ])
    error_message = "All public subnet CIDRs must be valid IPv4 CIDR blocks."
  }
}

# Private Subnets
variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]

  validation {
    condition     = length(var.private_subnet_cidrs) >= 2
    error_message = "At least 2 private subnets are required for high availability."
  }

  validation {
    condition = alltrue([
      for cidr in var.private_subnet_cidrs : can(cidrhost(cidr, 0))
    ])
    error_message = "All private subnet CIDRs must be valid IPv4 CIDR blocks."
  }
}

# NAT Gateway Configuration
variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets"
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Use a single NAT Gateway for all private subnets (cost optimization)"
  type        = bool
  default     = false
}

# VPC Flow Logs
variable "enable_vpc_flow_logs" {
  description = "Enable VPC Flow Logs for network monitoring"
  type        = bool
  default     = true
}

variable "flow_log_retention_days" {
  description = "Retention period for VPC Flow Logs in days"
  type        = number
  default     = 30

  validation {
    condition = contains([
      1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653
    ], var.flow_log_retention_days)
    error_message = "Flow log retention days must be a valid CloudWatch Logs retention value."
  }
}

# VPC Endpoints
variable "enable_vpc_endpoints" {
  description = "Enable VPC endpoints for AWS services"
  type        = bool
  default     = true
}

variable "vpc_endpoints" {
  description = "List of VPC endpoints to create"
  type        = list(string)
  default     = ["s3", "ecr.dkr", "ecr.api", "logs"]

  validation {
    condition = alltrue([
      for endpoint in var.vpc_endpoints : contains([
        "s3", "ecr.dkr", "ecr.api", "logs", "monitoring", "ssm", "ssmmessages", "ec2messages"
      ], endpoint)
    ])
    error_message = "Invalid VPC endpoint specified. Allowed values: s3, ecr.dkr, ecr.api, logs, monitoring, ssm, ssmmessages, ec2messages."
  }
}

# Network Security
variable "enable_network_acl" {
  description = "Enable custom Network ACL"
  type        = bool
  default     = true
}

variable "allowed_ssh_cidr_blocks" {
  description = "CIDR blocks allowed for SSH access"
  type        = list(string)
  default     = []

  validation {
    condition = alltrue([
      for cidr in var.allowed_ssh_cidr_blocks : can(cidrhost(cidr, 0))
    ])
    error_message = "All SSH CIDR blocks must be valid IPv4 CIDR blocks."
  }
}

# DNS Configuration
variable "enable_dns_hostnames" {
  description = "Enable DNS hostnames in the VPC"
  type        = bool
  default     = true
}

variable "enable_dns_support" {
  description = "Enable DNS support in the VPC"
  type        = bool
  default     = true
}

# Network Performance
variable "enable_enhanced_networking" {
  description = "Enable enhanced networking features"
  type        = bool
  default     = true
}

# Cost Optimization
variable "enable_cost_optimization" {
  description = "Enable cost optimization features (single NAT gateway, etc.)"
  type        = bool
  default     = false
}

# Monitoring and Alerting
variable "enable_network_monitoring" {
  description = "Enable detailed network monitoring"
  type        = bool
  default     = true
}

variable "network_alert_email" {
  description = "Email address for network alerts"
  type        = string
  default     = ""

  validation {
    condition = var.network_alert_email == "" || can(regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", var.network_alert_email))
    error_message = "Network alert email must be a valid email address or empty string."
  }
}

# Regional Configuration
variable "availability_zones" {
  description = "List of availability zones to use"
  type        = list(string)
  default     = []
}

variable "preferred_azs_count" {
  description = "Number of availability zones to use"
  type        = number
  default     = 2

  validation {
    condition     = var.preferred_azs_count >= 2 && var.preferred_azs_count <= 6
    error_message = "Number of availability zones must be between 2 and 6."
  }
}