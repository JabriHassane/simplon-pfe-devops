# Dead Letter Queue
resource "aws_sqs_queue" "dlq" {
  name = "${var.project_name}-${var.environment}-dlq"

  message_retention_seconds = 1209600 # 14 days

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-dlq"
    }
  )
}

# Main SQS Queue
resource "aws_sqs_queue" "main" {
  name = "${var.project_name}-${var.environment}-queue"

  visibility_timeout_seconds = 300
  message_retention_seconds  = 345600 # 4 days

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = 3
  })

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-${var.environment}-queue"
    }
  )
}
