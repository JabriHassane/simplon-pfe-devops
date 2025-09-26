import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRouter from './routers/auth.router';
import userRouter from './routers/user.router';
import contactRouter from './routers/contact.router';
import orderRouter from './routers/order.router';
import transactionRouter from './routers/transaction.router';
import cookieParser from 'cookie-parser';

dotenv.config({
	path: `.env.${process.env.NODE_ENV!}`,
});

const app = express();
const PORT = process.env.PORT;

// Initialize Prisma
export const prisma = new PrismaClient({
	datasourceUrl: process.env.DATABASE_URL!,
});

// Middleware
app.use(helmet());
// Configure CORS based on environment
const allowedOrigins = [process.env.CLIENT_URL];

app.use(
	cors({
		origin: (origin, callback) => {
			console.log("Origin", origin)
			// Allow requests with no origin (like mobile apps or curl requests)
			if (!origin) return callback(null, true);

			if (allowedOrigins.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
);

// app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', async (req, res) => {
	try {
		const usersCount = await prisma.user.count()
		res.json({ status: 'OK', usersCount, timestamp: new Date().toISOString() });
	} catch (error: any) {
		console.error('Error in health check', error);
		return res
			.status(500)
			.json({ message: error.message || 'Internal server error' });
	}
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/contacts', contactRouter);
app.use('/api/orders', orderRouter);
app.use('/api/transactions', transactionRouter);

// 404 handler
app.use('*', (req, res) => {
	res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(
	(
		err: any,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		console.error(err.stack);
		res.status(500).json({ message: 'Something went wrong!' });
	}
);

// Start server
app.listen(PORT, () => {
	console.log(`🚀 Server running on port: ${PORT}`);
});

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
