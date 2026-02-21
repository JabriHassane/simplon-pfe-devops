import { SQSService } from '../services/sqs.service';
import { prisma } from '../index';

/**
 * Process a message from SQS
 */
async function processMessage(message: any): Promise<void> {
  try {
    const body = message.Body;
    if (!body) {
      console.warn('Received message with no body');
      return;
    }

    console.log('Processing message:', body.type, body.id);

    // Handle different message types
    switch (body.type) {
      case 'ORDER_CREATED':
        await handleOrderCreated(body.data);
        break;
      case 'TRANSACTION_PROCESSED':
        await handleTransactionProcessed(body.data);
        break;
      case 'CONTACT_UPDATED':
        await handleContactUpdated(body.data);
        break;
      default:
        console.warn('Unknown message type:', body.type);
    }

    // Delete message after successful processing
    await SQSService.deleteMessage(message.ReceiptHandle);
    console.log('Message processed and deleted successfully');
  } catch (error) {
    console.error('Error processing message:', error);
    // Message will be retried automatically by SQS
    // After maxReceiveCount, it will go to DLQ
    throw error;
  }
}

/**
 * Handle ORDER_CREATED message
 */
async function handleOrderCreated(data: any): Promise<void> {
  console.log('Handling order created:', data);
  // Example: Send notification, update analytics, etc.
  // This is where you would add your business logic
}

/**
 * Handle TRANSACTION_PROCESSED message
 */
async function handleTransactionProcessed(data: any): Promise<void> {
  console.log('Handling transaction processed:', data);
  // Example: Update order status, send receipt, etc.
}

/**
 * Handle CONTACT_UPDATED message
 */
async function handleContactUpdated(data: any): Promise<void> {
  console.log('Handling contact updated:', data);
  // Example: Sync with external systems, update cache, etc.
}

/**
 * Main worker loop
 */
async function workerLoop(): Promise<void> {
  console.log('SQS Worker started');

  while (true) {
    try {
      // Receive messages from SQS
      const messages = await SQSService.receiveMessages(10);

      if (messages.length === 0) {
        // No messages, wait a bit before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      // Process messages in parallel
      await Promise.allSettled(
        messages.map(message => processMessage(message))
      );

      // Small delay before next poll
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error in worker loop:', error);
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Start the worker
if (require.main === module) {
  workerLoop().catch(error => {
    console.error('Fatal error in SQS worker:', error);
    process.exit(1);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});
