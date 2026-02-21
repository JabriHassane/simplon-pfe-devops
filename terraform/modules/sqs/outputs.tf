output "queue_url" {
  description = "SQS Queue URL"
  value       = aws_sqs_queue.main.id
}

output "queue_arn" {
  description = "SQS Queue ARN"
  value       = aws_sqs_queue.main.arn
}

output "dlq_url" {
  description = "Dead Letter Queue URL"
  value       = aws_sqs_queue.dlq.id
}

output "dlq_arn" {
  description = "Dead Letter Queue ARN"
  value       = aws_sqs_queue.dlq.arn
}
