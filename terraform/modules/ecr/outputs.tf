output "repository_urls" {
  description = "ECR Repository URLs"
  value       = { for k, v in aws_ecr_repository.repos : k => v.repository_url }
}

output "repository_arns" {
  description = "ECR Repository ARNs"
  value       = { for k, v in aws_ecr_repository.repos : k => v.arn }
}
