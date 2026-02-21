output "app_log_group_name" {
  description = "Application CloudWatch Log Group Name"
  value       = aws_cloudwatch_log_group.app_logs.name
}

output "backend_log_group_name" {
  description = "Backend CloudWatch Log Group Name"
  value       = aws_cloudwatch_log_group.backend_logs.name
}

output "frontend_log_group_name" {
  description = "Frontend CloudWatch Log Group Name"
  value       = aws_cloudwatch_log_group.frontend_logs.name
}
