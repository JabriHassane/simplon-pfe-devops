# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/${var.project_name}/${var.environment}/application"
  retention_in_days = 30

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-app-logs"
    }
  )
}

resource "aws_cloudwatch_log_group" "backend_logs" {
  name              = "/aws/${var.project_name}/${var.environment}/backend"
  retention_in_days = 30

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-backend-logs"
    }
  )
}

resource "aws_cloudwatch_log_group" "frontend_logs" {
  name              = "/aws/${var.project_name}/${var.environment}/frontend"
  retention_in_days = 30

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-frontend-logs"
    }
  )
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "${var.project_name}-${var.environment}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EKS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This metric monitors EKS cluster CPU utilization"
  treat_missing_data  = "notBreaching"

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "high_memory" {
  alarm_name          = "${var.project_name}-${var.environment}-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/EKS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This metric monitors EKS cluster memory utilization"
  treat_missing_data  = "notBreaching"

  tags = var.tags
}
