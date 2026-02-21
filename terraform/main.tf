terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }

  # Backend configuration (uncomment and configure for remote state)
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "devops-project/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "DevOps-PFE"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# VPC Module
module "vpc" {
  source = "./modules/vpc"
  
  project_name     = var.project_name
  environment      = var.environment
  vpc_cidr         = var.vpc_cidr
  availability_zones = data.aws_availability_zones.available.names
  
  tags = var.tags
}

# EKS Module (created first to get security group)
module "eks" {
  source = "./modules/eks"
  
  project_name     = var.project_name
  environment      = var.environment
  vpc_id           = module.vpc.vpc_id
  private_subnets  = module.vpc.private_subnet_ids
  public_subnets   = module.vpc.public_subnet_ids
  cluster_version  = var.eks_cluster_version
  instance_types   = var.eks_instance_types
  desired_capacity = var.eks_desired_capacity
  min_size         = var.eks_min_size
  max_size         = var.eks_max_size
  
  tags = var.tags
}

# RDS Module (created after EKS to use its security group)
module "rds" {
  source = "./modules/rds"
  
  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  private_subnets       = module.vpc.private_subnet_ids
  eks_security_group_id = module.eks.cluster_security_group_id
  db_name               = var.db_name
  db_username           = var.db_username
  db_password           = var.db_password
  
  tags = var.tags
  
  depends_on = [module.eks]
}

# SQS Module
module "sqs" {
  source = "./modules/sqs"
  
  project_name = var.project_name
  environment  = var.environment
  
  tags = var.tags
}

# ECR Repositories
module "ecr" {
  source = "./modules/ecr"
  
  project_name = var.project_name
  environment  = var.environment
  
  repositories = [
    "backend",
    "frontend"
  ]
  
  tags = var.tags
}

# IAM Roles for EKS Pods
module "iam" {
  source = "./modules/iam"
  
  project_name = var.project_name
  environment  = var.environment
  account_id   = data.aws_caller_identity.current.account_id
  region       = var.aws_region
  
  sqs_queue_arn = module.sqs.queue_arn
  
  tags = var.tags
}

# CloudWatch Log Groups
module "cloudwatch" {
  source = "./modules/cloudwatch"
  
  project_name = var.project_name
  environment  = var.environment
  
  tags = var.tags
}


