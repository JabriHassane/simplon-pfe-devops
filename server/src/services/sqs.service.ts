import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand, GetQueueAttributesCommand } from '@aws-sdk/client-sqs';
import { config } from 'dotenv';

config({
  path: `.env.${process.env.NODE_ENV!}`,
});

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const QUEUE_URL = process.env.SQS_QUEUE_URL;

if (!QUEUE_URL) {
  console.warn('SQS_QUEUE_URL not configured. SQS functionality will be disabled.');
}

export interface SQSMessage {
  id?: string;
  type: string;
  data: any;
  timestamp?: string;
}

export class SQSService {
  /**
   * Send a message to the SQS queue
   */
  static async sendMessage(message: SQSMessage): Promise<void> {
    if (!QUEUE_URL) {
      console.warn('SQS queue not configured. Message not sent:', message);
      return;
    }

    try {
      const command = new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify({
          ...message,
          timestamp: new Date().toISOString(),
        }),
        MessageAttributes: {
          Type: {
            DataType: 'String',
            StringValue: message.type,
          },
        },
      });

      const response = await sqsClient.send(command);
      console.log('Message sent to SQS:', response.MessageId);
    } catch (error) {
      console.error('Error sending message to SQS:', error);
      throw error;
    }
  }

  /**
   * Receive messages from the SQS queue
   */
  static async receiveMessages(maxMessages: number = 10): Promise<any[]> {
    if (!QUEUE_URL) {
      return [];
    }

    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: maxMessages,
        WaitTimeSeconds: 20, // Long polling
        MessageAttributeNames: ['All'],
      });

      const response = await sqsClient.send(command);
      
      if (!response.Messages || response.Messages.length === 0) {
        return [];
      }

      return response.Messages.map(msg => ({
        ReceiptHandle: msg.ReceiptHandle,
        Body: msg.Body ? JSON.parse(msg.Body) : null,
        MessageId: msg.MessageId,
        Attributes: msg.Attributes,
      }));
    } catch (error) {
      console.error('Error receiving messages from SQS:', error);
      throw error;
    }
  }

  /**
   * Delete a message from the queue after processing
   */
  static async deleteMessage(receiptHandle: string): Promise<void> {
    if (!QUEUE_URL) {
      return;
    }

    try {
      const command = new DeleteMessageCommand({
        QueueUrl: QUEUE_URL,
        ReceiptHandle: receiptHandle,
      });

      await sqsClient.send(command);
      console.log('Message deleted from SQS');
    } catch (error) {
      console.error('Error deleting message from SQS:', error);
      throw error;
    }
  }

  /**
   * Get queue attributes (approximate number of messages)
   */
  static async getQueueAttributes(): Promise<any> {
    if (!QUEUE_URL) {
      return null;
    }

    try {
      const command = new GetQueueAttributesCommand({
        QueueUrl: QUEUE_URL,
        AttributeNames: ['ApproximateNumberOfMessages', 'ApproximateNumberOfMessagesNotVisible'],
      });

      const response = await sqsClient.send(command);
      return response.Attributes;
    } catch (error) {
      console.error('Error getting queue attributes:', error);
      throw error;
    }
  }
}
