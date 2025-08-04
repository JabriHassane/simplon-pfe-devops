import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRouter from './routers/auth.router';
import userRouter from './routers/user.router';
import clientRouter from './routers/client.router';
import supplierRouter from './routers/supplier.router';
import saleRouter from './routers/sale.router';
import purchaseRouter from './routers/purchase.router';
import transactionRouter from './routers/transaction.router';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Prisma
export const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(
	cors({
		origin: 'http://localhost:5173',
		credentials: true,
	})
);
// app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
	res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/clients', clientRouter);
app.use('/api/suppliers', supplierRouter);
app.use('/api/sales', saleRouter);
app.use('/api/purchases', purchaseRouter);
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
	console.log(`🚀 Server running on port ${PORT}`);
	console.log(`📊 Health check: http://localhost:${PORT}/health`);
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
