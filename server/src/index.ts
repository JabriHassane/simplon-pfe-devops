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
import productRouter from './routers/product.router';
import orderRouter from './routers/order.router';
import purchaseRouter from './routers/purchase.router';
import transactionRouter from './routers/transaction.router';
import accountRouter from './routers/account.router';
import productCategoryRouter from './routers/product-category.router';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Prisma
export const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
// app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
	res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/clients', clientRouter);
app.use('/api/suppliers', supplierRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/purchases', purchaseRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/accounts', accountRouter);
app.use('/api/product-categories', productCategoryRouter);

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
