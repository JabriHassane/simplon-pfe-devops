output "sqs_consumer_role_arn" {
  description = "SQS Consumer IAM Role ARN"
  value       = aws_iam_role.sqs_consumer.arn
}
