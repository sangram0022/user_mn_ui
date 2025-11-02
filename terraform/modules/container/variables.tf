# Container Module Variables
# Comprehensive container configuration options

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

# ECR Repository Configuration
variable "repository_name" {
  description = "Name of the ECR repository"
  type        = string
}

variable "image_tag_mutability" {
  description = "Image tag mutability setting for ECR repository"
  type        = string
  default     = "MUTABLE"

  validation {
    condition     = contains(["MUTABLE", "IMMUTABLE"], var.image_tag_mutability)
    error_message = "Image tag mutability must be either MUTABLE or IMMUTABLE."
  }
}

variable "enable_image_scanning" {
  description = "Enable image scanning on push"
  type        = bool
  default     = true
}

variable "enable_encryption" {
  description = "Enable encryption for ECR repository"
  type        = bool
  default     = true
}

variable "kms_key_arn" {
  description = "ARN of KMS key for ECR encryption"
  type        = string
  default     = ""
}

variable "ecr_pull_principals" {
  description = "List of principals allowed to pull from ECR repository"
  type        = list(string)
  default     = []
}

# Image Lifecycle Management
variable "max_image_count" {
  description = "Maximum number of images to keep for each environment"
  type        = number
  default     = 10

  validation {
    condition     = var.max_image_count >= 1 && var.max_image_count <= 1000
    error_message = "Max image count must be between 1 and 1000."
  }
}

variable "untagged_image_days" {
  description = "Number of days to keep untagged images"
  type        = number
  default     = 7

  validation {
    condition     = var.untagged_image_days >= 1 && var.untagged_image_days <= 365
    error_message = "Untagged image days must be between 1 and 365."
  }
}

# ECS Task Configuration
variable "task_cpu" {
  description = "CPU units for the ECS task"
  type        = number
  default     = 256

  validation {
    condition = contains([256, 512, 1024, 2048, 4096], var.task_cpu)
    error_message = "Task CPU must be one of: 256, 512, 1024, 2048, 4096."
  }
}

variable "task_memory" {
  description = "Memory (in MiB) for the ECS task"
  type        = number
  default     = 512

  validation {
    condition = var.task_memory >= 512 && var.task_memory <= 30720
    error_message = "Task memory must be between 512 and 30720 MiB."
  }
}

variable "execution_role_arn" {
  description = "ARN of the ECS task execution role"
  type        = string
}

variable "task_role_arn" {
  description = "ARN of the ECS task role"
  type        = string
}

# Container Configuration
variable "container_name" {
  description = "Name of the container"
  type        = string
  default     = "app"
}

variable "container_cpu" {
  description = "CPU units for the container (0 means use task CPU)"
  type        = number
  default     = 0

  validation {
    condition     = var.container_cpu >= 0
    error_message = "Container CPU must be non-negative."
  }
}

variable "container_memory" {
  description = "Memory (in MiB) for the container"
  type        = number
  default     = 512

  validation {
    condition     = var.container_memory >= 128
    error_message = "Container memory must be at least 128 MiB."
  }
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

variable "image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

variable "blue_green_image_tag" {
  description = "Docker image tag for blue/green deployment"
  type        = string
  default     = "blue-green"
}

# Environment Variables and Secrets
variable "environment_variables" {
  description = "Environment variables for the container"
  type        = map(string)
  default     = {}
}

variable "secrets" {
  description = "Secrets for the container (key = env var name, value = ARN)"
  type        = map(string)
  default     = {}
}

# Logging Configuration
variable "log_retention_days" {
  description = "Number of days to retain logs"
  type        = number
  default     = 30

  validation {
    condition = contains([
      1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653
    ], var.log_retention_days)
    error_message = "Log retention days must be a valid CloudWatch Logs retention value."
  }
}

# Health Check Configuration
variable "enable_health_check" {
  description = "Enable container health check"
  type        = bool
  default     = true
}

variable "health_check_command" {
  description = "Health check command"
  type        = list(string)
  default     = ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
}

variable "health_check_interval" {
  description = "Health check interval in seconds"
  type        = number
  default     = 30

  validation {
    condition     = var.health_check_interval >= 5 && var.health_check_interval <= 300
    error_message = "Health check interval must be between 5 and 300 seconds."
  }
}

variable "health_check_timeout" {
  description = "Health check timeout in seconds"
  type        = number
  default     = 5

  validation {
    condition     = var.health_check_timeout >= 2 && var.health_check_timeout <= 60
    error_message = "Health check timeout must be between 2 and 60 seconds."
  }
}

variable "health_check_retries" {
  description = "Health check retries"
  type        = number
  default     = 3

  validation {
    condition     = var.health_check_retries >= 1 && var.health_check_retries <= 10
    error_message = "Health check retries must be between 1 and 10."
  }
}

variable "health_check_start_period" {
  description = "Health check start period in seconds"
  type        = number
  default     = 60

  validation {
    condition     = var.health_check_start_period >= 0 && var.health_check_start_period <= 300
    error_message = "Health check start period must be between 0 and 300 seconds."
  }
}

# Security Configuration
variable "readonly_root_filesystem" {
  description = "Enable read-only root filesystem"
  type        = bool
  default     = false
}

variable "container_user" {
  description = "User to run the container as"
  type        = string
  default     = ""
}

variable "working_directory" {
  description = "Working directory for the container"
  type        = string
  default     = ""
}

variable "docker_security_options" {
  description = "Docker security options"
  type        = list(string)
  default     = []
}

variable "system_controls" {
  description = "System controls for the container"
  type        = list(object({
    namespace = string
    value     = string
  }))
  default = []
}

variable "ulimits" {
  description = "Ulimits for the container"
  type        = list(object({
    name      = string
    softLimit = number
    hardLimit = number
  }))
  default = []
}

# Volume Configuration
variable "volumes" {
  description = "Volumes for the task definition"
  type = list(object({
    name = string
    host = optional(object({
      source_path = string
    }))
    docker_volume_configuration = optional(object({
      scope         = string
      autoprovision = bool
      driver        = string
      driver_opts   = map(string)
      labels        = map(string)
    }))
    efs_volume_configuration = optional(object({
      file_system_id          = string
      root_directory          = string
      transit_encryption      = string
      transit_encryption_port = number
      authorization_config = optional(object({
        access_point_id = string
        iam             = string
      }))
    }))
  }))
  default = []
}

variable "mount_points" {
  description = "Mount points for the container"
  type = list(object({
    source_volume  = string
    container_path = string
    read_only      = bool
  }))
  default = []
}

# Blue/Green Deployment
variable "enable_blue_green_deployment" {
  description = "Enable blue/green deployment"
  type        = bool
  default     = false
}

# Monitoring Configuration
variable "enable_container_monitoring" {
  description = "Enable container monitoring with CloudWatch dashboard"
  type        = bool
  default     = true
}

variable "enable_container_insights" {
  description = "Enable ECS Container Insights"
  type        = bool
  default     = true
}

variable "cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
}

# Fargate Configuration
variable "enable_fargate_spot" {
  description = "Enable Fargate Spot instances"
  type        = bool
  default     = false
}

# Auto Scaling Configuration
variable "enable_auto_scaling" {
  description = "Enable auto scaling for ECS service"
  type        = bool
  default     = true
}

variable "min_capacity" {
  description = "Minimum number of tasks"
  type        = number
  default     = 1

  validation {
    condition     = var.min_capacity >= 1
    error_message = "Minimum capacity must be at least 1."
  }
}

variable "max_capacity" {
  description = "Maximum number of tasks"
  type        = number
  default     = 10

  validation {
    condition     = var.max_capacity >= 1
    error_message = "Maximum capacity must be at least 1."
  }
}

variable "cpu_target_value" {
  description = "Target CPU utilization percentage for auto scaling"
  type        = number
  default     = 70.0

  validation {
    condition     = var.cpu_target_value >= 1.0 && var.cpu_target_value <= 100.0
    error_message = "CPU target value must be between 1.0 and 100.0."
  }
}

variable "memory_target_value" {
  description = "Target memory utilization percentage for auto scaling"
  type        = number
  default     = 80.0

  validation {
    condition     = var.memory_target_value >= 1.0 && var.memory_target_value <= 100.0
    error_message = "Memory target value must be between 1.0 and 100.0."
  }
}

variable "scale_out_cooldown" {
  description = "Scale out cooldown period in seconds"
  type        = number
  default     = 300

  validation {
    condition     = var.scale_out_cooldown >= 0
    error_message = "Scale out cooldown must be non-negative."
  }
}

variable "scale_in_cooldown" {
  description = "Scale in cooldown period in seconds"
  type        = number
  default     = 300

  validation {
    condition     = var.scale_in_cooldown >= 0
    error_message = "Scale in cooldown must be non-negative."
  }
}