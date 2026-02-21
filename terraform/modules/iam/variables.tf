variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "account_id" {
  description = "AWS Account ID"
  type        = string
}

variable "region" {
  description = "AWS Region"
  type        = string
}

variable "eks_oidc_provider_id" {
  description = "EKS OIDC Provider ID"
  type        = string
  default     = ""
}

variable "sqs_queue_arn" {
  description = "SQS Queue ARN"
  type        = string
}

variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}
