# ============================================================================
# CloudWatch Dashboard for S3 + CloudFront Monitoring
# Add to terraform/main.tf or create separate monitoring.tf
# ============================================================================

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "website" {
  count = var.enable_cloudwatch_dashboard ? 1 : 0

  dashboard_name = "${var.project_name}-${var.environment}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      # CloudFront Requests
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/CloudFront", "Requests", { stat = "Sum", region = "us-east-1" }]
          ]
          period = 300
          stat   = "Sum"
          region = "us-east-1"
          title  = "CloudFront Requests"
          yAxis = {
            left = {
              min = 0
            }
          }
        }
        width  = 12
        height = 6
        x      = 0
        y      = 0
      },
      # CloudFront Error Rates
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/CloudFront", "4xxErrorRate", { stat = "Average", region = "us-east-1", color = "#ff7f0e" }],
            [".", "5xxErrorRate", { stat = "Average", region = "us-east-1", color = "#d62728" }]
          ]
          period = 300
          stat   = "Average"
          region = "us-east-1"
          title  = "CloudFront Error Rates"
          yAxis = {
            left = {
              min = 0
              max = 10
            }
          }
        }
        width  = 12
        height = 6
        x      = 12
        y      = 0
      },
      # CloudFront Bytes Downloaded
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/CloudFront", "BytesDownloaded", { stat = "Sum", region = "us-east-1" }],
            [".", "BytesUploaded", { stat = "Sum", region = "us-east-1", color = "#2ca02c" }]
          ]
          period = 300
          stat   = "Sum"
          region = "us-east-1"
          title  = "CloudFront Bandwidth"
          yAxis = {
            left = {
              min = 0
            }
          }
        }
        width  = 12
        height = 6
        x      = 0
        y      = 6
      },
      # CloudFront Cache Hit Rate
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/CloudFront", "CacheHitRate", { stat = "Average", region = "us-east-1" }]
          ]
          period = 300
          stat   = "Average"
          region = "us-east-1"
          title  = "Cache Hit Rate"
          yAxis = {
            left = {
              min = 0
              max = 100
            }
          }
        }
        width  = 12
        height = 6
        x      = 12
        y      = 6
      },
      # WAF Blocked Requests (if WAF enabled)
      {
        type = "metric"
        properties = {
          metrics = var.enable_waf ? [
            ["AWS/WAFV2", "BlockedRequests", { stat = "Sum", region = "us-east-1" }],
            [".", "AllowedRequests", { stat = "Sum", region = "us-east-1", color = "#2ca02c" }]
          ] : []
          period = 300
          stat   = "Sum"
          region = "us-east-1"
          title  = "WAF Requests"
          yAxis = {
            left = {
              min = 0
            }
          }
        }
        width  = 12
        height = 6
        x      = 0
        y      = 12
      },
      # Origin Response Time
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/CloudFront", "OriginLatency", { stat = "Average", region = "us-east-1" }]
          ]
          period = 300
          stat   = "Average"
          region = "us-east-1"
          title  = "Origin Response Time (S3)"
          yAxis = {
            left = {
              min = 0
            }
          }
        }
        width  = 12
        height = 6
        x      = 12
        y      = 12
      }
    ]
  })

  depends_on = [aws_cloudfront_distribution.website]
}

# SNS Topic for Alarms
resource "aws_sns_topic" "alerts" {
  count = var.create_sns_topic ? 1 : 0

  name              = "${var.project_name}-${var.environment}-alerts"
  display_name      = "CloudFront Alerts for ${var.project_name}"
  kms_master_key_id = var.sns_kms_key_id

  tags = {
    Name        = "${var.project_name}-${var.environment}-alerts"
    Environment = var.environment
  }
}

# SNS Topic Subscription (Email)
resource "aws_sns_topic_subscription" "alerts_email" {
  count = var.create_sns_topic && length(var.alert_emails) > 0 ? length(var.alert_emails) : 0

  topic_arn = aws_sns_topic.alerts[0].arn
  protocol  = "email"
  endpoint  = var.alert_emails[count.index]
}

# SNS Topic Subscription (Slack - via Lambda or HTTPS)
resource "aws_sns_topic_subscription" "alerts_slack" {
  count = var.create_sns_topic && var.slack_webhook_url != "" ? 1 : 0

  topic_arn = aws_sns_topic.alerts[0].arn
  protocol  = "https"
  endpoint  = var.slack_webhook_url
}

# Additional Variables for monitoring.tf
variable "enable_cloudwatch_dashboard" {
  description = "Enable CloudWatch dashboard"
  type        = bool
  default     = true
}

variable "create_sns_topic" {
  description = "Create SNS topic for alerts"
  type        = bool
  default     = false
}

variable "alert_emails" {
  description = "List of email addresses for CloudWatch alarms"
  type        = list(string)
  default     = []
}

variable "slack_webhook_url" {
  description = "Slack webhook URL for alerts"
  type        = string
  default     = ""
  sensitive   = true
}

variable "sns_kms_key_id" {
  description = "KMS key ID for SNS topic encryption"
  type        = string
  default     = "alias/aws/sns"
}

# Additional Alarms

# High Request Rate Alarm
resource "aws_cloudwatch_metric_alarm" "high_request_rate" {
  count = var.enable_cloudwatch_alarms ? 1 : 0

  alarm_name          = "${var.project_name}-${var.environment}-high-request-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Requests"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Sum"
  threshold           = var.high_request_threshold
  alarm_description   = "Alert when request rate is unusually high"
  treat_missing_data  = "notBreaching"

  dimensions = {
    DistributionId = aws_cloudfront_distribution.website.id
  }

  alarm_actions = var.alarm_sns_topic_arn != "" ? [var.alarm_sns_topic_arn] : (var.create_sns_topic ? [aws_sns_topic.alerts[0].arn] : [])
}

# Low Cache Hit Rate Alarm
resource "aws_cloudwatch_metric_alarm" "low_cache_hit_rate" {
  count = var.enable_cloudwatch_alarms ? 1 : 0

  alarm_name          = "${var.project_name}-${var.environment}-low-cache-hit-rate"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "3"
  metric_name         = "CacheHitRate"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Average"
  threshold           = var.cache_hit_rate_threshold
  alarm_description   = "Alert when cache hit rate drops below threshold"
  treat_missing_data  = "notBreaching"

  dimensions = {
    DistributionId = aws_cloudfront_distribution.website.id
  }

  alarm_actions = var.alarm_sns_topic_arn != "" ? [var.alarm_sns_topic_arn] : (var.create_sns_topic ? [aws_sns_topic.alerts[0].arn] : [])
}

# High Origin Latency Alarm
resource "aws_cloudwatch_metric_alarm" "high_origin_latency" {
  count = var.enable_cloudwatch_alarms ? 1 : 0

  alarm_name          = "${var.project_name}-${var.environment}-high-origin-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "OriginLatency"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Average"
  threshold           = var.origin_latency_threshold
  alarm_description   = "Alert when S3 origin latency is high"
  treat_missing_data  = "notBreaching"

  dimensions = {
    DistributionId = aws_cloudfront_distribution.website.id
  }

  alarm_actions = var.alarm_sns_topic_arn != "" ? [var.alarm_sns_topic_arn] : (var.create_sns_topic ? [aws_sns_topic.alerts[0].arn] : [])
}

# WAF Blocked Requests Alarm
resource "aws_cloudwatch_metric_alarm" "waf_blocked_requests" {
  count = var.enable_waf && var.enable_cloudwatch_alarms ? 1 : 0

  alarm_name          = "${var.project_name}-${var.environment}-waf-blocked-requests"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "BlockedRequests"
  namespace           = "AWS/WAFV2"
  period              = "300"
  statistic           = "Sum"
  threshold           = var.waf_blocked_threshold
  alarm_description   = "Alert when WAF blocks unusual number of requests"
  treat_missing_data  = "notBreaching"

  dimensions = {
    WebACL = aws_wafv2_web_acl.cloudfront[0].name
    Region = "us-east-1"
    Rule   = "ALL"
  }

  alarm_actions = var.alarm_sns_topic_arn != "" ? [var.alarm_sns_topic_arn] : (var.create_sns_topic ? [aws_sns_topic.alerts[0].arn] : [])
}

# Additional Variables for Thresholds
variable "high_request_threshold" {
  description = "Threshold for high request rate alarm"
  type        = number
  default     = 10000  # 10k requests per 5 minutes
}

variable "cache_hit_rate_threshold" {
  description = "Minimum acceptable cache hit rate (percentage)"
  type        = number
  default     = 80  # 80%
}

variable "origin_latency_threshold" {
  description = "Maximum acceptable origin latency in milliseconds"
  type        = number
  default     = 1000  # 1 second
}

variable "waf_blocked_threshold" {
  description = "Threshold for WAF blocked requests alarm"
  type        = number
  default     = 100  # 100 blocked requests per 5 minutes
}

# Outputs for Monitoring
output "cloudwatch_dashboard_url" {
  description = "URL to CloudWatch dashboard"
  value = var.enable_cloudwatch_dashboard ? "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.website[0].dashboard_name}" : null
}

output "sns_topic_arn" {
  description = "ARN of SNS topic for alerts"
  value       = var.create_sns_topic ? aws_sns_topic.alerts[0].arn : null
}

output "monitoring_setup_commands" {
  description = "Commands to complete monitoring setup"
  value = {
    subscribe_email = var.create_sns_topic ? "aws sns subscribe --topic-arn ${aws_sns_topic.alerts[0].arn} --protocol email --notification-endpoint your-email@example.com" : "SNS topic not created"
    view_dashboard  = var.enable_cloudwatch_dashboard ? "https://console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.website[0].dashboard_name}" : "Dashboard not created"
    test_alarm      = "aws cloudwatch set-alarm-state --alarm-name ${var.project_name}-${var.environment}-cloudfront-5xx-errors --state-value ALARM --state-reason 'Testing alarm'"
  }
}
