# IAM Role for EKS Pods (IRSA - IAM Roles for Service Accounts)
resource "aws_iam_role" "sqs_consumer" {
  name = "${var.project_name}-${var.environment}-sqs-consumer-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = "arn:aws:iam::${var.account_id}:oidc-provider/oidc.eks.${var.region}.amazonaws.com/id/${var.eks_oidc_provider_id}"
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "oidc.eks.${var.region}.amazonaws.com/id/${var.eks_oidc_provider_id}:sub" = "system:serviceaccount:default:sqs-consumer"
          "oidc.eks.${var.region}.amazonaws.com/id/${var.eks_oidc_provider_id}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })

  tags = var.tags
}

# IAM Policy for SQS Access
resource "aws_iam_policy" "sqs_access" {
  name        = "${var.project_name}-${var.environment}-sqs-access-policy"
  description = "Policy for SQS queue access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:ChangeMessageVisibility"
        ]
        Resource = var.sqs_queue_arn
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage"
        ]
        Resource = var.sqs_queue_arn
      }
    ]
  })

  tags = var.tags
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "sqs_consumer" {
  role       = aws_iam_role.sqs_consumer.name
  policy_arn = aws_iam_policy.sqs_access.arn
}
