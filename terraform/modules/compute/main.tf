# Compute Module - ECS Fargate Cluster, ALB, Auto Scaling, Service Configuration
# Provides compute infrastructure for containerized applications

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = var.cluster_name

  setting {
    name  = "containerInsights"
    value = var.enable_container_insights ? "enabled" : "disabled"
  }

  configuration {
    execute_command_configuration {
      kms_key_id = var.enable_encryption ? var.kms_key_arn : null
      logging    = "OVERRIDE"

      log_configuration {
        cloud_watch_encryption_enabled = var.enable_encryption
        cloud_watch_log_group_name     = aws_cloudwatch_log_group.ecs_exec.name
      }
    }
  }

  tags = merge(var.common_tags, {
    Name = var.cluster_name
    Type = "compute-cluster"
  })
}

# ECS Cluster Capacity Providers
resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = var.enable_fargate_spot ? ["FARGATE", "FARGATE_SPOT"] : ["FARGATE"]

  default_capacity_provider_strategy {
    base              = var.enable_fargate_spot ? 0 : 1
    weight            = var.enable_fargate_spot ? 1 : 1
    capacity_provider = "FARGATE"
  }

  dynamic "default_capacity_provider_strategy" {
    for_each = var.enable_fargate_spot ? [1] : []
    content {
      base              = 0
      weight            = 3
      capacity_provider = "FARGATE_SPOT"
    }
  }
}

# CloudWatch Log Group for ECS Exec
resource "aws_cloudwatch_log_group" "ecs_exec" {
  name              = "/aws/ecs/exec/${var.cluster_name}"
  retention_in_days = var.log_retention_days

  tags = merge(var.common_tags, {
    Name = "${var.cluster_name}-exec-logs"
    Type = "monitoring"
  })
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = var.internal_load_balancer
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets           = var.public_subnet_ids

  enable_deletion_protection       = var.enable_deletion_protection
  enable_cross_zone_load_balancing = true
  enable_http2                    = true
  enable_waf_fail_open            = false

  access_logs {
    bucket  = var.enable_access_logs ? aws_s3_bucket.alb_logs[0].bucket : null
    prefix  = var.enable_access_logs ? "alb" : null
    enabled = var.enable_access_logs
  }

  connection_logs {
    bucket  = var.enable_connection_logs ? aws_s3_bucket.alb_logs[0].bucket : null
    prefix  = var.enable_connection_logs ? "connection" : null
    enabled = var.enable_connection_logs
  }

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-alb"
    Type = "load-balancer"
  })
}

# S3 Bucket for ALB Logs
resource "aws_s3_bucket" "alb_logs" {
  count = var.enable_access_logs || var.enable_connection_logs ? 1 : 0

  bucket        = "${var.project_name}-alb-logs-${random_string.bucket_suffix[0].result}"
  force_destroy = true

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-alb-logs"
    Type = "storage"
  })
}

# Random string for S3 bucket suffix
resource "random_string" "bucket_suffix" {
  count = var.enable_access_logs || var.enable_connection_logs ? 1 : 0

  length  = 8
  special = false
  upper   = false
}

# S3 Bucket Policy for ALB Logs
resource "aws_s3_bucket_policy" "alb_logs" {
  count = var.enable_access_logs || var.enable_connection_logs ? 1 : 0

  bucket = aws_s3_bucket.alb_logs[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_elb_service_account.main.id}:root"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.alb_logs[0].arn}/*"
      },
      {
        Effect = "Allow"
        Principal = {
          Service = "delivery.logs.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.alb_logs[0].arn}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      },
      {
        Effect = "Allow"
        Principal = {
          Service = "delivery.logs.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = aws_s3_bucket.alb_logs[0].arn
      }
    ]
  })
}

# ALB Target Group
resource "aws_lb_target_group" "main" {
  name        = "${var.project_name}-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = var.health_check_healthy_threshold
    interval            = var.health_check_interval
    matcher             = var.health_check_matcher
    path                = var.health_check_path
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = var.health_check_timeout
    unhealthy_threshold = var.health_check_unhealthy_threshold
  }

  deregistration_delay = var.deregistration_delay

  stickiness {
    type            = "lb_cookie"
    cookie_duration = var.stickiness_duration
    enabled         = var.enable_stickiness
  }

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-tg"
    Type = "target-group"
  })
}

# ALB Target Group for Blue/Green Deployment
resource "aws_lb_target_group" "blue_green" {
  count = var.enable_blue_green_deployment ? 1 : 0

  name        = "${var.project_name}-tg-bg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = var.health_check_healthy_threshold
    interval            = var.health_check_interval
    matcher             = var.health_check_matcher
    path                = var.health_check_path
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = var.health_check_timeout
    unhealthy_threshold = var.health_check_unhealthy_threshold
  }

  deregistration_delay = var.deregistration_delay

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-tg-bg"
    Type = "target-group"
  })
}

# ALB Listener (HTTP to HTTPS redirect)
resource "aws_lb_listener" "http_redirect" {
  count = var.enable_https_redirect ? 1 : 0

  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }

  tags = var.common_tags
}

# ALB Listener (HTTPS)
resource "aws_lb_listener" "https" {
  count = var.ssl_certificate_arn != "" ? 1 : 0

  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = var.ssl_policy
  certificate_arn   = var.ssl_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }

  tags = var.common_tags
}

# ALB Listener (HTTP) - when HTTPS is not configured
resource "aws_lb_listener" "http" {
  count = var.ssl_certificate_arn == "" && !var.enable_https_redirect ? 1 : 0

  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }

  tags = var.common_tags
}

# ECS Service
resource "aws_ecs_service" "main" {
  name            = var.project_name
  cluster         = aws_ecs_cluster.main.id
  task_definition = var.task_definition_arn
  desired_count   = var.desired_count

  launch_type = var.launch_type

  dynamic "capacity_provider_strategy" {
    for_each = var.launch_type == "FARGATE" && var.enable_fargate_spot ? [1] : []
    content {
      capacity_provider = "FARGATE"
      weight           = 1
      base             = 0
    }
  }

  dynamic "capacity_provider_strategy" {
    for_each = var.launch_type == "FARGATE" && var.enable_fargate_spot ? [1] : []
    content {
      capacity_provider = "FARGATE_SPOT"
      weight           = 3
      base             = 0
    }
  }

  network_configuration {
    security_groups  = [var.ecs_security_group_id]
    subnets         = var.private_subnet_ids
    assign_public_ip = var.assign_public_ip
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = var.container_name
    container_port   = var.container_port
  }

  deployment_configuration {
    maximum_percent         = var.max_deployment_percent
    minimum_healthy_percent = var.min_deployment_percent

    dynamic "deployment_circuit_breaker" {
      for_each = var.enable_deployment_circuit_breaker ? [1] : []
      content {
        enable   = true
        rollback = var.enable_circuit_breaker_rollback
      }
    }
  }

  dynamic "service_registries" {
    for_each = var.service_discovery_registry_arn != "" ? [1] : []
    content {
      registry_arn = var.service_discovery_registry_arn
    }
  }

  enable_execute_command = var.enable_execute_command

  dynamic "ordered_placement_strategy" {
    for_each = var.launch_type == "EC2" ? var.placement_strategies : []
    content {
      type  = ordered_placement_strategy.value.type
      field = ordered_placement_strategy.value.field
    }
  }

  dynamic "placement_constraints" {
    for_each = var.launch_type == "EC2" ? var.placement_constraints : []
    content {
      type       = placement_constraints.value.type
      expression = placement_constraints.value.expression
    }
  }

  depends_on = [
    aws_lb_listener.http,
    aws_lb_listener.https,
    aws_lb_listener.http_redirect
  ]

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-service"
    Type = "ecs-service"
  })

  lifecycle {
    ignore_changes = [desired_count]
  }
}

# Auto Scaling Target
resource "aws_appautoscaling_target" "ecs_target" {
  count = var.enable_auto_scaling ? 1 : 0

  max_capacity       = var.max_capacity
  min_capacity       = var.min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.main.name}"
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
    disable_scale_in    = var.disable_scale_in
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
    disable_scale_in    = var.disable_scale_in
  }
}

# Auto Scaling Policy - ALB Request Count
resource "aws_appautoscaling_policy" "ecs_policy_requests" {
  count = var.enable_auto_scaling && var.enable_request_based_scaling ? 1 : 0

  name               = "${var.project_name}-requests-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target[0].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target[0].service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = var.request_count_target_value

    predefined_metric_specification {
      predefined_metric_type = "ALBRequestCountPerTarget"
      resource_label        = "${aws_lb.main.arn_suffix}/${aws_lb_target_group.main.arn_suffix}"
    }

    scale_out_cooldown  = var.scale_out_cooldown
    scale_in_cooldown   = var.scale_in_cooldown
    disable_scale_in    = var.disable_scale_in
  }
}

# Service Discovery (Cloud Map)
resource "aws_service_discovery_private_dns_namespace" "main" {
  count = var.enable_service_discovery ? 1 : 0

  name        = "${var.project_name}.local"
  description = "Service discovery namespace for ${var.project_name}"
  vpc         = var.vpc_id

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-namespace"
    Type = "service-discovery"
  })
}

resource "aws_service_discovery_service" "main" {
  count = var.enable_service_discovery ? 1 : 0

  name = var.project_name

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main[0].id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_grace_period_seconds = 30

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-service-discovery"
    Type = "service-discovery"
  })
}