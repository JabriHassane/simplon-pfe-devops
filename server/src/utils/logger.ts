import winston from 'winston';
import CloudWatchTransport from 'winston-cloudwatch';
import { config } from 'dotenv';

config({
  path: `.env.${process.env.NODE_ENV!}`,
});

const isProduction = process.env.NODE_ENV === 'production';

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'devops-ppp-backend',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Add CloudWatch transport in production
if (isProduction && process.env.AWS_REGION) {
  const logGroupName = process.env.CLOUDWATCH_LOG_GROUP || `/aws/devops-ppp/production/backend`;
  const logStreamName = `backend-${Date.now()}`;

  logger.add(
    new CloudWatchTransport({
      logGroupName,
      logStreamName,
      awsRegion: process.env.AWS_REGION,
      messageFormatter: ({ level, message, meta }) => {
        return JSON.stringify({
          level,
          message,
          ...meta,
        });
      },
    })
  );
}

// Create a stream object for Morgan HTTP logger
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger;
