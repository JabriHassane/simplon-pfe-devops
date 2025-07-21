import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Starting database seed...');

	// Clear existing data (in correct sale due to foreign key constraints)
	await prisma.transaction.deleteMany();
	await prisma.saleItem.deleteMany();
	await prisma.purchaseItem.deleteMany();
	await prisma.sale.deleteMany();
	await prisma.purchase.deleteMany();
	await prisma.product.deleteMany();
	await prisma.productCategory.deleteMany();
	await prisma.client.deleteMany();
	await prisma.supplier.deleteMany();
	await prisma.account.deleteMany();
	await prisma.user.deleteMany();

	console.log('🗑️  Cleared existing data');

	// Create super admin user
	const hashedPassword = await bcrypt.hash('admin123', 10);
	const superAdmin = await prisma.user.create({
		data: {
			ref: 'USR-001',
			name: 'admin',
			password: hashedPassword,
			role: 'super_admin',
		},
	});

	// Create regular users/agents
	const agent1 = await prisma.user.create({
		data: {
			ref: 'USR-002',
			name: 'ahmed',
			password: hashedPassword,
			role: 'agent',
			createdById: superAdmin.id,
		},
	});

	const agent2 = await prisma.user.create({
		data: {
			ref: 'USR-003',
			name: 'fatima',
			password: hashedPassword,
			role: 'agent',
			createdById: superAdmin.id,
		},
	});

	console.log('👥 Created users');

	// Create accounts
	const accounts = await Promise.all([
		prisma.account.create({
			data: {
				ref: 'ACC-001',
				name: 'Caisse Espèces',
				balance: 15000,
				createdById: superAdmin.id,
			},
		}),
		prisma.account.create({
			data: {
				ref: 'ACC-002',
				name: 'Caisse Chèques',
				balance: 25000,
				createdById: superAdmin.id,
			},
		}),
		prisma.account.create({
			data: {
				ref: 'ACC-003',
				name: 'Banque Principale',
				balance: 150000,
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('💰 Created accounts');

	// Create product categories
	const categories = await Promise.all([
		prisma.productCategory.create({
			data: {
				ref: 'CAT-001',
				name: 'Électronique',
				createdById: superAdmin.id,
			},
		}),
		prisma.productCategory.create({
			data: {
				ref: 'CAT-002',
				name: 'Vêtements',
				createdById: superAdmin.id,
			},
		}),
		prisma.productCategory.create({
			data: {
				ref: 'CAT-003',
				name: 'Livres',
				createdById: superAdmin.id,
			},
		}),
		prisma.productCategory.create({
			data: {
				ref: 'CAT-004',
				name: 'Maison & Jardin',
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('📂 Created product categories');

	// Create products
	const products = await Promise.all([
		prisma.product.create({
			data: {
				ref: 'PROD-001',
				name: 'Smartphone Samsung Galaxy',
				image: 'https://via.placeholder.com/300x300?text=Smartphone',
				price: 899.99,
				inventory: 25,
				categoryId: categories[0].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.product.create({
			data: {
				ref: 'PROD-002',
				name: 'Laptop HP Pavilion',
				image: 'https://via.placeholder.com/300x300?text=Laptop',
				price: 1299.99,
				inventory: 15,
				categoryId: categories[0].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.product.create({
			data: {
				ref: 'PROD-003',
				name: 'T-shirt Homme',
				image: 'https://via.placeholder.com/300x300?text=T-shirt',
				price: 29.99,
				inventory: 100,
				categoryId: categories[1].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.product.create({
			data: {
				ref: 'PROD-004',
				name: 'Robe Femme',
				image: 'https://via.placeholder.com/300x300?text=Robe',
				price: 89.99,
				inventory: 50,
				categoryId: categories[1].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.product.create({
			data: {
				ref: 'PROD-005',
				name: 'Livre de Cuisine',
				image: 'https://via.placeholder.com/300x300?text=Livre',
				price: 24.99,
				inventory: 75,
				categoryId: categories[2].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.product.create({
			data: {
				ref: 'PROD-006',
				name: 'Lampe de Bureau',
				image: 'https://via.placeholder.com/300x300?text=Lampe',
				price: 45.99,
				inventory: 30,
				categoryId: categories[3].id,
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('📦 Created products');

	// Create clients
	const clients = await Promise.all([
		prisma.client.create({
			data: {
				ref: 'CLI-001',
				name: 'Mohammed Alami',
				phone: '0612345678',
				address: '123 Rue Hassan II, Casablanca',
				createdById: superAdmin.id,
			},
		}),
		prisma.client.create({
			data: {
				ref: 'CLI-002',
				name: 'Amina Benjelloun',
				phone: '0623456789',
				address: '456 Avenue Mohammed V, Rabat',
				createdById: superAdmin.id,
			},
		}),
		prisma.client.create({
			data: {
				ref: 'CLI-003',
				name: 'Karim Tazi',
				phone: '0634567890',
				address: '789 Boulevard Al Massira, Marrakech',
				createdById: superAdmin.id,
			},
		}),
		prisma.client.create({
			data: {
				ref: 'CLI-004',
				name: 'Sara El Fassi',
				phone: '0645678901',
				address: '321 Rue Ibn Batouta, Fès',
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('👤 Created clients');

	// Create suppliers
	const suppliers = await Promise.all([
		prisma.supplier.create({
			data: {
				ref: 'SUP-001',
				name: 'TechImport SARL',
				phone: '0522345678',
				address: '100 Rue de la Technologie, Casablanca',
				createdById: superAdmin.id,
			},
		}),
		prisma.supplier.create({
			data: {
				ref: 'SUP-002',
				name: 'TextilePlus',
				phone: '0523456789',
				address: '200 Avenue du Textile, Tanger',
				createdById: superAdmin.id,
			},
		}),
		prisma.supplier.create({
			data: {
				ref: 'SUP-003',
				name: 'Librairie Centrale',
				phone: '0524567890',
				address: '300 Boulevard des Livres, Rabat',
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('🏢 Created suppliers');

	// Create some sales
	const sales = await Promise.all([
		prisma.sale.create({
			data: {
				ref: 'ORD-001',
				date: '2024-01-15T00:00:00.000Z',
				receiptNumber: 'REC-001',
				invoiceNumber: 'INV-001',
				totalPrice: 929.98,
				totalPaid: 929.98,
				totalDue: 0,
				status: 'paid',
				note: 'Livraison à domicile',
				agentId: agent1.id,
				clientId: clients[0].id,
				createdById: agent1.id,
			},
		}),
		prisma.sale.create({
			data: {
				ref: 'ORD-002',
				date: '2024-01-20T00:00:00.000Z',
				receiptNumber: 'REC-002',
				invoiceNumber: 'INV-002',
				totalPrice: 179.98,
				totalPaid: 100,
				totalDue: 79.98,
				status: 'partially_paid',
				note: 'Paiement en plusieurs fois',
				agentId: agent2.id,
				clientId: clients[1].id,
				createdById: agent2.id,
			},
		}),
		prisma.sale.create({
			data: {
				ref: 'ORD-003',
				date: '2024-01-25T00:00:00.000Z',
				receiptNumber: 'REC-003',
				invoiceNumber: 'INV-003',
				totalPrice: 1349.98,
				totalPaid: 0,
				totalDue: 1349.98,
				status: 'pending',
				note: 'Commande en attente de paiement',
				agentId: agent1.id,
				clientId: clients[2].id,
				createdById: agent1.id,
			},
		}),
	]);

	console.log('📋 Created sales');

	// Create sale items
	await Promise.all([
		prisma.saleItem.create({
			data: {
				price: 899.99,
				quantity: 1,
				saleId: sales[0].id,
				productId: products[0].id,
				createdById: agent1.id,
			},
		}),
		prisma.saleItem.create({
			data: {
				price: 29.99,
				quantity: 1,
				saleId: sales[0].id,
				productId: products[2].id,
				createdById: agent1.id,
			},
		}),
		prisma.saleItem.create({
			data: {
				price: 89.99,
				quantity: 2,
				saleId: sales[1].id,
				productId: products[3].id,
				createdById: agent2.id,
			},
		}),
		prisma.saleItem.create({
			data: {
				price: 1299.99,
				quantity: 1,
				saleId: sales[2].id,
				productId: products[1].id,
				createdById: agent1.id,
			},
		}),
		prisma.saleItem.create({
			data: {
				price: 49.99,
				quantity: 1,
				saleId: sales[2].id,
				productId: products[5].id,
				createdById: agent1.id,
			},
		}),
	]);

	console.log('📦 Created sale items');

	// Create purchases
	const purchases = await Promise.all([
		prisma.purchase.create({
			data: {
				ref: 'PUR-001',
				date: '2024-01-10T00:00:00.000Z',
				receiptNumber: 'PUR-REC-001',
				invoiceNumber: 'PUR-INV-001',
				totalPrice: 5000,
				totalPaid: 5000,
				totalDue: 0,
				status: 'paid',
				note: 'Stock initial',
				agentId: superAdmin.id,
				supplierId: suppliers[0].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.purchase.create({
			data: {
				ref: 'PUR-002',
				date: '2024-01-18T00:00:00.000Z',
				receiptNumber: 'PUR-REC-002',
				invoiceNumber: 'PUR-INV-002',
				totalPrice: 2000,
				totalPaid: 1500,
				totalDue: 500,
				status: 'partially_paid',
				note: 'Réapprovisionnement',
				agentId: superAdmin.id,
				supplierId: suppliers[1].id,
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('🛒 Created purchases');

	// Create purchase items
	await Promise.all([
		prisma.purchaseItem.create({
			data: {
				price: 800,
				quantity: 5,
				purchaseId: purchases[0].id,
				productId: products[0].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.purchaseItem.create({
			data: {
				price: 1100,
				quantity: 3,
				purchaseId: purchases[0].id,
				productId: products[1].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.purchaseItem.create({
			data: {
				price: 20,
				quantity: 50,
				purchaseId: purchases[1].id,
				productId: products[2].id,
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('📦 Created purchase items');

	// Create transactions
	await Promise.all([
		// Sale 1 payments (fully paid - 929.98)
		prisma.transaction.create({
			data: {
				ref: 'TXN-001',
				date: '2024-01-15T00:00:00.000Z',
				type: 'sale',
				paymentMethod: 'cash',
				amount: 500,
				agentId: agent1.id,
				saleId: sales[0].id,
				toId: accounts[0].id,
				createdById: agent1.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: 'TXN-002',
				date: '2024-01-15T00:00:00.000Z',
				type: 'sale',
				paymentMethod: 'bankTransfer',
				amount: 429.98,
				agentId: agent1.id,
				saleId: sales[0].id,
				toId: accounts[2].id,
				createdById: agent1.id,
			},
		}),

		// Sale 2 payments (partially paid - 100 out of 179.98)
		prisma.transaction.create({
			data: {
				ref: 'TXN-003',
				date: '2024-01-20T00:00:00.000Z',
				type: 'sale',
				paymentMethod: 'check',
				amount: 100,
				agentId: agent2.id,
				saleId: sales[1].id,
				toId: accounts[1].id,
				createdById: agent2.id,
			},
		}),

		// Purchase 1 payments (fully paid - 5000)
		prisma.transaction.create({
			data: {
				ref: 'TXN-004',
				date: '2024-01-10T00:00:00.000Z',
				type: 'purchase',
				paymentMethod: 'bankTransfer',
				amount: 3000,
				agentId: superAdmin.id,
				purchaseId: purchases[0].id,
				fromId: accounts[2].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: 'TXN-005',
				date: '2024-01-10T00:00:00.000Z',
				type: 'purchase',
				paymentMethod: 'check',
				amount: 2000,
				agentId: superAdmin.id,
				purchaseId: purchases[0].id,
				fromId: accounts[1].id,
				createdById: superAdmin.id,
			},
		}),

		// Purchase 2 payments (partially paid - 1500 out of 2000)
		prisma.transaction.create({
			data: {
				ref: 'TXN-006',
				date: '2024-01-18T00:00:00.000Z',
				type: 'purchase',
				paymentMethod: 'cash',
				amount: 1000,
				agentId: superAdmin.id,
				purchaseId: purchases[1].id,
				fromId: accounts[0].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: 'TXN-007',
				date: '2024-01-18T00:00:00.000Z',
				type: 'purchase',
				paymentMethod: 'bankTransfer',
				amount: 500,
				agentId: superAdmin.id,
				purchaseId: purchases[1].id,
				fromId: accounts[2].id,
				createdById: superAdmin.id,
			},
		}),

		// Account transfer
		prisma.transaction.create({
			data: {
				ref: 'TXN-008',
				date: '2024-01-22T00:00:00.000Z',
				type: 'transfer',
				amount: 5000,
				agentId: superAdmin.id,
				fromId: accounts[2].id,
				toId: accounts[0].id,
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('💳 Created transactions');

	console.log('✅ Database seeded successfully!');
	console.log('\n📊 Summary:');
	console.log(`- Users: 3 (1 admin, 2 agents)`);
	console.log(`- Accounts: 3`);
	console.log(`- Product Categories: 4`);
	console.log(`- Products: 6`);
	console.log(`- Clients: 4`);
	console.log(`- Suppliers: 3`);
	console.log(`- Sales: 3`);
	console.log(`- Purchases: 2`);
	console.log(`- Transactions: 8`);
}

main()
	.catch((e) => {
		console.error('❌ Error seeding database:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
