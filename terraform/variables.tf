variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-2"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "ppp-v4"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "pppdb"
  sensitive   = true
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "admin"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "eks_cluster_version" {
  description = "Kubernetes version for EKS"
  type        = string
  default     = "1.30"
}

variable "eks_instance_types" {
  description = "EC2 instance types for EKS nodes"
  type        = list(string)
  default     = ["t3.micro"]
}

variable "eks_desired_capacity" {
  description = "Desired number of nodes"
  type        = number
  default     = 2
}

variable "eks_min_size" {
  description = "Minimum number of nodes"
  type        = number
  default     = 1
}

variable "eks_max_size" {
  description = "Maximum number of nodes"
  type        = number
  default     = 4
}

variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}
