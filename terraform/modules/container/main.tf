# Container Module - ECR Repository, ECS Task Definitions, Container Configurations
# Provides container registry and task definitions for the application

# ECR Repository for container images
resource "aws_ecr_repository" "main" {
  name = var.repository_name

  image_tag_mutability = var.image_tag_mutability

  image_scanning_configuration {
    scan_on_push = var.enable_image_scanning
  }

  encryption_configuration {
    encryption_type = var.enable_encryption ? "KMS" : "AES256"
    kms_key         = var.enable_encryption ? var.kms_key_arn : null
  }

  tags = merge(var.common_tags, {
    Name = var.repository_name
    Type = "container-registry"
  })
}

# ECR Repository Policy
resource "aws_ecr_repository_policy" "main" {
  repository = aws_ecr_repository.main.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPull"
        Effect = "Allow"
        Principal = {
          AWS = var.ecr_pull_principals
        }
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability"
        ]
      }
    ]
  })
}

# ECR Lifecycle Policy
resource "aws_ecr_lifecycle_policy" "main" {
  repository = aws_ecr_repository.main.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last ${var.max_image_count} production images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["prod"]
          countType     = "imageCountMoreThan"
          countNumber   = var.max_image_count
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Keep last ${var.max_image_count} staging images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["staging", "stage"]
          countType     = "imageCountMoreThan"
          countNumber   = var.max_image_count
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 3
        description  = "Delete untagged images older than ${var.untagged_image_days} days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = var.untagged_image_days
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# CloudWatch Log Group for ECS Tasks
resource "aws_cloudwatch_log_group" "ecs_tasks" {
  name              = "/ecs/${var.project_name}"
  retention_in_days = var.log_retention_days

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-ecs-logs"
    Type = "monitoring"
  })
}

# ECS Task Definition
resource "aws_ecs_task_definition" "main" {
  family                   = var.project_name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = var.execution_role_arn
  task_role_arn           = var.task_role_arn

  container_definitions = jsonencode([
    {
      name  = var.container_name
      image = "${aws_ecr_repository.main.repository_url}:${var.image_tag}"

      cpu    = var.container_cpu
      memory = var.container_memory

      essential = true

      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]

      environment = [
        for key, value in var.environment_variables : {
          name  = key
          value = tostring(value)
        }
      ]

      secrets = [
        for key, value in var.secrets : {
          name      = key
          valueFrom = value
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_tasks.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = var.enable_health_check ? {
        command = var.health_check_command
        interval = var.health_check_interval
        timeout  = var.health_check_timeout
        retries  = var.health_check_retries
        startPeriod = var.health_check_start_period
      } : null

      mountPoints = [
        for mount in var.mount_points : {
          sourceVolume  = mount.source_volume
          containerPath = mount.container_path
          readOnly      = mount.read_only
        }
      ]

      volumesFrom = []

      linuxParameters = var.enable_fargate_spot ? {
        capabilities = {
          add  = []
          drop = ["ALL"]
        }
      } : null

      readonlyRootFilesystem = var.readonly_root_filesystem
      privileged            = false
      user                  = var.container_user

      workingDirectory = var.working_directory

      # Resource limits
      ulimits = var.ulimits

      # Security options
      dockerSecurityOptions = var.docker_security_options

      # System controls
      systemControls = var.system_controls
    }
  ])

  dynamic "volume" {
    for_each = var.volumes
    content {
      name = volume.value.name

      dynamic "host" {
        for_each = volume.value.host != null ? [volume.value.host] : []
        content {
          source_path = host.value.source_path
        }
      }

      dynamic "docker_volume_configuration" {
        for_each = volume.value.docker_volume_configuration != null ? [volume.value.docker_volume_configuration] : []
        content {
          scope         = docker_volume_configuration.value.scope
          autoprovision = docker_volume_configuration.value.autoprovision
          driver        = docker_volume_configuration.value.driver
          driver_opts   = docker_volume_configuration.value.driver_opts
          labels        = docker_volume_configuration.value.labels
        }
      }

      dynamic "efs_volume_configuration" {
        for_each = volume.value.efs_volume_configuration != null ? [volume.value.efs_volume_configuration] : []
        content {
          file_system_id          = efs_volume_configuration.value.file_system_id
          root_directory          = efs_volume_configuration.value.root_directory
          transit_encryption      = efs_volume_configuration.value.transit_encryption
          transit_encryption_port = efs_volume_configuration.value.transit_encryption_port

          dynamic "authorization_config" {
            for_each = efs_volume_configuration.value.authorization_config != null ? [efs_volume_configuration.value.authorization_config] : []
            content {
              access_point_id = authorization_config.value.access_point_id
              iam             = authorization_config.value.iam
            }
          }
        }
      }
    }
  }

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-task-definition"
    Type = "container"
  })
}

# ECS Task Definition for Blue/Green Deployment (optional)
resource "aws_ecs_task_definition" "blue_green" {
  count = var.enable_blue_green_deployment ? 1 : 0

  family                   = "${var.project_name}-bg"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = var.execution_role_arn
  task_role_arn           = var.task_role_arn

  container_definitions = jsonencode([
    {
      name  = var.container_name
      image = "${aws_ecr_repository.main.repository_url}:${var.blue_green_image_tag}"

      cpu    = var.container_cpu
      memory = var.container_memory

      essential = true

      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]

      environment = [
        for key, value in var.environment_variables : {
          name  = key
          value = tostring(value)
        }
      ]

      secrets = [
        for key, value in var.secrets : {
          name      = key
          valueFrom = value
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_tasks.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs-bg"
        }
      }

      healthCheck = var.enable_health_check ? {
        command = var.health_check_command
        interval = var.health_check_interval
        timeout  = var.health_check_timeout
        retries  = var.health_check_retries
        startPeriod = var.health_check_start_period
      } : null

      readonlyRootFilesystem = var.readonly_root_filesystem
      privileged            = false
      user                  = var.container_user
      workingDirectory      = var.working_directory
    }
  ])

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-bg-task-definition"
    Type = "container"
  })
}

# CloudWatch Dashboard for Container Metrics
resource "aws_cloudwatch_dashboard" "container_metrics" {
  count = var.enable_container_monitoring ? 1 : 0

  dashboard_name = "${var.project_name}-container-metrics"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", var.project_name],
            [".", "MemoryUtilization", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "ECS Service CPU and Memory"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.project_name],
            [".", "TargetResponseTime", ".", "."],
            [".", "HTTPCode_Target_2XX_Count", ".", "."],
            [".", "HTTPCode_Target_4XX_Count", ".", "."],
            [".", "HTTPCode_Target_5XX_Count", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "Load Balancer Metrics"
          period  = 300
        }
      }
    ]
  })
}

# Container Insights (Enhanced monitoring)
resource "aws_ecs_cluster_capacity_providers" "main" {
  count = var.enable_container_insights ? 1 : 0

  cluster_name = var.cluster_name

  capacity_providers = var.enable_fargate_spot ? ["FARGATE", "FARGATE_SPOT"] : ["FARGATE"]

  default_capacity_provider_strategy {
    base              = var.enable_fargate_spot ? 0 : 1
    weight            = var.enable_fargate_spot ? 0 : 1
    capacity_provider = "FARGATE"
  }

  dynamic "default_capacity_provider_strategy" {
    for_each = var.enable_fargate_spot ? [1] : []
    content {
      base              = 1
      weight            = 4
      capacity_provider = "FARGATE_SPOT"
    }
  }
}

# Auto Scaling Target for ECS Service
resource "aws_appautoscaling_target" "ecs_target" {
  count = var.enable_auto_scaling ? 1 : 0

  max_capacity       = var.max_capacity
  min_capacity       = var.min_capacity
  resource_id        = "service/${var.cluster_name}/${var.project_name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"

  tags = var.common_tags
}

# Auto Scaling Policy - CPU
resource "aws_appautoscaling_policy" "ecs_policy_cpu" {
  count = var.enable_auto_scaling ? 1 : 0

  name               = "${var.project_name}-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target[0].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target[0].service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = var.cpu_target_value

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    scale_out_cooldown  = var.scale_out_cooldown
    scale_in_cooldown   = var.scale_in_cooldown
    disable_scale_in    = false
  }
}

# Auto Scaling Policy - Memory
resource "aws_appautoscaling_policy" "ecs_policy_memory" {
  count = var.enable_auto_scaling ? 1 : 0

  name               = "${var.project_name}-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target[0].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target[0].service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = var.memory_target_value

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }

    scale_out_cooldown  = var.scale_out_cooldown
    scale_in_cooldown   = var.scale_in_cooldown
    disable_scale_in    = false
  }
}