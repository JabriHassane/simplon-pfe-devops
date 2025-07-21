import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getNextRef } from '../src/utils/db.utils';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Starting database seed...');

	// Clear existing data (in correct sale due to foreign key constraints)
	await prisma.transaction.deleteMany();
	await prisma.saleItem.deleteMany();
	await prisma.purchaseItem.deleteMany();
	await prisma.sale.deleteMany();
	await prisma.purchase.deleteMany();
	await prisma.article.deleteMany();
	await prisma.category.deleteMany();
	await prisma.client.deleteMany();
	await prisma.supplier.deleteMany();
	await prisma.account.deleteMany();
	await prisma.user.deleteMany();

	console.log('🗑️  Cleared existing data');

	// console.log('Creating ref sequences');
	// await prisma.$executeRawUnsafe(`DELETE SEQUENCE user_ref_seq START 1`);
	// await prisma.$executeRawUnsafe(`DELETE SEQUENCE account_ref_seq START 1`);
	// await prisma.$executeRawUnsafe(`DELETE SEQUENCE category_ref_seq START 1`);
	// await prisma.$executeRawUnsafe(`DELETE SEQUENCE article_ref_seq START 1`);
	// await prisma.$executeRawUnsafe(`DELETE SEQUENCE client_ref_seq START 1`);
	// await prisma.$executeRawUnsafe(`DELETE SEQUENCE supplier_ref_seq START 1`);
	// await prisma.$executeRawUnsafe(`DELETE SEQUENCE sale_ref_seq START 1`);
	// await prisma.$executeRawUnsafe(`DELETE SEQUENCE purchase_ref_seq START 1`);
	// await prisma.$executeRawUnsafe(`DELETE SEQUENCE transaction_ref_seq START 1`);

	// await prisma.$executeRawUnsafe(`CREATE SEQUENCE users_ref_seq START 1`);
	// await prisma.$executeRawUnsafe(`CREATE SEQUENCE accounts_ref_seq START 1`);
	// await prisma.$executeRawUnsafe(`CREATE SEQUENCE categories_ref_seq START 1`);
	// await prisma.$executeRawUnsafe(`CREATE SEQUENCE articles_ref_seq START 1`);
	// await prisma.$executeRawUnsafe(`CREATE SEQUENCE clients_ref_seq START 1`);
	// await prisma.$executeRawUnsafe(`CREATE SEQUENCE suppliers_ref_seq START 1`);
	// await prisma.$executeRawUnsafe(`CREATE SEQUENCE sales_ref_seq START 1`);
	// await prisma.$executeRawUnsafe(`CREATE SEQUENCE purchases_ref_seq START 1`);
	// await prisma.$executeRawUnsafe(`CREATE SEQUENCE transactions_ref_seq START 1`);
	// console.log('Ref sequences created');

	// Create super admin user
	const hashedPassword = await bcrypt.hash('admin123', 10);
	const superAdmin = await prisma.user.create({
		data: {
			ref: await getNextRef('users'),
			name: 'admin',
			password: hashedPassword,
			role: 'super_admin',
		},
	});

	// Create regular users/agents
	const agent1 = await prisma.user.create({
		data: {
			ref: await getNextRef('users'),
			name: 'rachid',
			password: hashedPassword,
			role: 'agent',
			createdById: superAdmin.id,
		},
	});

	const agent2 = await prisma.user.create({
		data: {
			ref: await getNextRef('users'),
			name: 'yasmine',
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
				ref: await getNextRef('accounts'),
				name: 'Caisse Espèces',
				balance: 15000,
				createdById: superAdmin.id,
			},
		}),
		prisma.account.create({
			data: {
				ref: await getNextRef('accounts'),
				name: 'Caisse Chèques',
				balance: 25000,
				createdById: superAdmin.id,
			},
		}),
		prisma.account.create({
			data: {
				ref: await getNextRef('accounts'),
				name: 'Banque Principale',
				balance: 150000,
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('💰 Created accounts');

	// Create plant categories
	const categories = await Promise.all([
		prisma.category.create({
			data: {
				ref: await getNextRef('categories'),
				name: "Plantes d'Intérieur",
				createdById: superAdmin.id,
			},
		}),
		prisma.category.create({
			data: {
				ref: await getNextRef('categories'),
				name: 'Arbres Fruitiers',
				createdById: superAdmin.id,
			},
		}),
		prisma.category.create({
			data: {
				ref: await getNextRef('categories'),
				name: 'Fleurs',
				createdById: superAdmin.id,
			},
		}),
		prisma.category.create({
			data: {
				ref: await getNextRef('categories'),
				name: 'Matériel de Jardinage',
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('📂 Created plant categories');

	// Create plants and materials
	const articles = await Promise.all([
		prisma.article.create({
			data: {
				ref: await getNextRef('articles'),
				name: 'Monstera Deliciosa',
				image: 'https://via.placeholder.com/300x300?text=Monstera',
				price: 299.99,
				inventory: 25,
				categoryId: categories[0].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.article.create({
			data: {
				ref: await getNextRef('articles'),
				name: 'Olivier 5 ans',
				image: 'https://via.placeholder.com/300x300?text=Olivier',
				price: 899.99,
				inventory: 15,
				categoryId: categories[1].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.article.create({
			data: {
				ref: await getNextRef('articles'),
				name: 'Rosier Rouge',
				image: 'https://via.placeholder.com/300x300?text=Rose',
				price: 89.99,
				inventory: 100,
				categoryId: categories[2].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.article.create({
			data: {
				ref: await getNextRef('articles'),
				name: 'Lavande',
				image: 'https://via.placeholder.com/300x300?text=Lavande',
				price: 49.99,
				inventory: 150,
				categoryId: categories[2].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.article.create({
			data: {
				ref: await getNextRef('articles'),
				name: "Kit d'Outils de Jardinage",
				image: 'https://via.placeholder.com/300x300?text=Outils',
				price: 199.99,
				inventory: 75,
				categoryId: categories[3].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.article.create({
			data: {
				ref: await getNextRef('articles'),
				name: 'Terreau Premium 40L',
				image: 'https://via.placeholder.com/300x300?text=Terreau',
				price: 79.99,
				inventory: 200,
				categoryId: categories[3].id,
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('🌿 Created plants and materials');

	// Create clients
	const clients = await Promise.all([
		prisma.client.create({
			data: {
				ref: await getNextRef('clients'),
				name: 'Mohammed Alami',
				phone: '0612345678',
				address: '123 Rue Hassan II, Casablanca',
				createdById: superAdmin.id,
			},
		}),
		prisma.client.create({
			data: {
				ref: await getNextRef('clients'),
				name: 'Amina Benjelloun',
				phone: '0623456789',
				address: '456 Avenue Mohammed V, Rabat',
				createdById: superAdmin.id,
			},
		}),
		prisma.client.create({
			data: {
				ref: await getNextRef('clients'),
				name: 'Karim Tazi',
				phone: '0634567890',
				address: '789 Boulevard Al Massira, Marrakech',
				createdById: superAdmin.id,
			},
		}),
		prisma.client.create({
			data: {
				ref: await getNextRef('clients'),
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
				ref: await getNextRef('suppliers'),
				name: 'Pépinière Atlas',
				phone: '0522345678',
				address: '100 Route de Marrakech, Benslimane',
				createdById: superAdmin.id,
			},
		}),
		prisma.supplier.create({
			data: {
				ref: await getNextRef('suppliers'),
				name: 'Jardins du Souss',
				phone: '0523456789',
				address: '200 Zone Industrielle, Agadir',
				createdById: superAdmin.id,
			},
		}),
		prisma.supplier.create({
			data: {
				ref: await getNextRef('suppliers'),
				name: 'GardenTools Pro',
				phone: '0524567890',
				address: '300 Quartier Industriel, Tanger',
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('🏢 Created suppliers');

	// Create some sales
	const sales = await Promise.all([
		prisma.sale.create({
			data: {
				ref: await getNextRef('sales'),
				date: '2024-01-15T00:00:00.000Z',
				receiptNumber: 'REC-001',
				invoiceNumber: 'INV-001',
				totalPrice: 389.98,
				totalPaid: 389.98,
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
				ref: await getNextRef('sales'),
				date: '2024-01-20T00:00:00.000Z',
				receiptNumber: 'REC-002',
				invoiceNumber: 'INV-002',
				totalPrice: 279.98,
				totalPaid: 200,
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
				ref: await getNextRef('sales'),
				date: '2024-01-25T00:00:00.000Z',
				receiptNumber: 'REC-003',
				invoiceNumber: 'INV-003',
				totalPrice: 1099.98,
				totalPaid: 0,
				totalDue: 1099.98,
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
				price: 299.99,
				quantity: 1,
				saleId: sales[0].id,
				articleId: articles[0].id,
				createdById: agent1.id,
			},
		}),
		prisma.saleItem.create({
			data: {
				price: 89.99,
				quantity: 1,
				saleId: sales[0].id,
				articleId: articles[2].id,
				createdById: agent1.id,
			},
		}),
		prisma.saleItem.create({
			data: {
				price: 49.99,
				quantity: 2,
				saleId: sales[1].id,
				articleId: articles[3].id,
				createdById: agent2.id,
			},
		}),
		prisma.saleItem.create({
			data: {
				price: 899.99,
				quantity: 1,
				saleId: sales[2].id,
				articleId: articles[1].id,
				createdById: agent1.id,
			},
		}),
		prisma.saleItem.create({
			data: {
				price: 199.99,
				quantity: 1,
				saleId: sales[2].id,
				articleId: articles[4].id,
				createdById: agent1.id,
			},
		}),
	]);

	console.log('🌿 Created sale items');

	// Create purchases
	const purchases = await Promise.all([
		prisma.purchase.create({
			data: {
				ref: await getNextRef('purchases'),
				date: '2024-01-10T00:00:00.000Z',
				receiptNumber: 'ACH-REC-001',
				invoiceNumber: 'ACH-INV-001',
				totalPrice: 5000,
				totalPaid: 5000,
				totalDue: 0,
				status: 'paid',
				note: 'Stock initial plantes',
				agentId: superAdmin.id,
				supplierId: suppliers[0].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.purchase.create({
			data: {
				ref: await getNextRef('purchases'),
				date: '2024-01-18T00:00:00.000Z',
				receiptNumber: 'ACH-REC-002',
				invoiceNumber: 'ACH-INV-002',
				totalPrice: 2000,
				totalPaid: 1500,
				totalDue: 500,
				status: 'partially_paid',
				note: 'Réapprovisionnement arbres',
				agentId: superAdmin.id,
				supplierId: suppliers[1].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.purchase.create({
			data: {
				ref: await getNextRef('purchases'),
				date: '2024-01-25T00:00:00.000Z',
				receiptNumber: 'ACH-REC-003',
				invoiceNumber: 'ACH-INV-003',
				totalPrice: 3500,
				totalPaid: 2000,
				totalDue: 1500,
				status: 'partially_paid',
				note: 'Commande matériel',
				agentId: superAdmin.id,
				supplierId: suppliers[2].id,
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('🛒 Created purchases');

	// Create purchase items
	await Promise.all([
		prisma.purchaseItem.create({
			data: {
				price: 200,
				quantity: 15,
				purchaseId: purchases[0].id,
				articleId: articles[0].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.purchaseItem.create({
			data: {
				price: 600,
				quantity: 5,
				purchaseId: purchases[0].id,
				articleId: articles[1].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.purchaseItem.create({
			data: {
				price: 30,
				quantity: 50,
				purchaseId: purchases[1].id,
				articleId: articles[2].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.purchaseItem.create({
			data: {
				price: 150,
				quantity: 20,
				purchaseId: purchases[2].id,
				articleId: articles[4].id,
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('🌿 Created purchase items');

	// Create transactions
	await Promise.all([
		// Sale 1 payments (fully paid - 389.98)
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-15T00:00:00.000Z',
				type: 'sale',
				paymentMethod: 'cash',
				amount: 200,
				agentId: agent1.id,
				saleId: sales[0].id,
				toId: accounts[0].id,
				createdById: agent1.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-15T00:00:00.000Z',
				type: 'sale',
				paymentMethod: 'bankTransfer',
				amount: 189.98,
				agentId: agent1.id,
				saleId: sales[0].id,
				toId: accounts[2].id,
				createdById: agent1.id,
			},
		}),

		// Sale 2 payments (partially paid - 200 out of 279.98)
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-20T00:00:00.000Z',
				type: 'sale',
				paymentMethod: 'check',
				amount: 200,
				agentId: agent2.id,
				saleId: sales[1].id,
				toId: accounts[1].id,
				createdById: agent2.id,
			},
		}),

		// Purchase 1 payments (fully paid - 5000)
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
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
				ref: await getNextRef('transactions'),
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
				ref: await getNextRef('transactions'),
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
				ref: await getNextRef('transactions'),
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

		// Purchase 3 payments (partially paid - 2000 out of 3500)
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-25T00:00:00.000Z',
				type: 'purchase',
				paymentMethod: 'bankTransfer',
				amount: 1500,
				agentId: superAdmin.id,
				purchaseId: purchases[2].id,
				fromId: accounts[2].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-25T00:00:00.000Z',
				type: 'purchase',
				paymentMethod: 'check',
				amount: 500,
				agentId: superAdmin.id,
				purchaseId: purchases[2].id,
				fromId: accounts[1].id,
				createdById: superAdmin.id,
			},
		}),

		// Account transfer
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
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
	console.log(`- Plant Categories: 4`);
	console.log(`- Plants & Materials: 6`);
	console.log(`- Clients: 4`);
	console.log(`- Suppliers: 3`);
	console.log(`- Sales: 3`);
	console.log(`- Purchases: 3`);
	console.log(`- Transactions: 10`);
}

main()
	.catch((e) => {
		console.error('❌ Error seeding database:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
