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

	const agent3 = await prisma.user.create({
		data: {
			ref: await getNextRef('users'),
			name: 'omar',
			password: hashedPassword,
			role: 'agent',
			createdById: superAdmin.id,
		},
	});

	const agent4 = await prisma.user.create({
		data: {
			ref: await getNextRef('users'),
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
		prisma.account.create({
			data: {
				ref: await getNextRef('accounts'),
				name: 'Banque Secondaire',
				balance: 75000,
				createdById: superAdmin.id,
			},
		}),
		prisma.account.create({
			data: {
				ref: await getNextRef('accounts'),
				name: 'Compte Épargne',
				balance: 200000,
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
		prisma.category.create({
			data: {
				ref: await getNextRef('categories'),
				name: 'Plantes Grimpantes',
				createdById: superAdmin.id,
			},
		}),
		prisma.category.create({
			data: {
				ref: await getNextRef('categories'),
				name: 'Cactus et Succulentes',
				createdById: superAdmin.id,
			},
		}),
		prisma.category.create({
			data: {
				ref: await getNextRef('categories'),
				name: 'Herbes Aromatiques',
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
		prisma.article.create({
			data: {
				ref: await getNextRef('articles'),
				name: 'Jasmin Grimpant',
				image: 'https://via.placeholder.com/300x300?text=Jasmin',
				price: 129.99,
				inventory: 45,
				categoryId: categories[4].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.article.create({
			data: {
				ref: await getNextRef('articles'),
				name: 'Cactus Barrel',
				image: 'https://via.placeholder.com/300x300?text=Cactus',
				price: 69.99,
				inventory: 80,
				categoryId: categories[5].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.article.create({
			data: {
				ref: await getNextRef('articles'),
				name: 'Basilic Bio',
				image: 'https://via.placeholder.com/300x300?text=Basilic',
				price: 29.99,
				inventory: 120,
				categoryId: categories[6].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.article.create({
			data: {
				ref: await getNextRef('articles'),
				name: 'Menthe Fraîche',
				image: 'https://via.placeholder.com/300x300?text=Menthe',
				price: 24.99,
				inventory: 150,
				categoryId: categories[6].id,
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
		prisma.client.create({
			data: {
				ref: await getNextRef('clients'),
				name: 'Hassan Berrada',
				phone: '0656789012',
				address: '567 Avenue des FAR, Tanger',
				createdById: superAdmin.id,
			},
		}),
		prisma.client.create({
			data: {
				ref: await getNextRef('clients'),
				name: 'Leila Kadiri',
				phone: '0667890123',
				address: '890 Rue Zerktouni, Meknès',
				createdById: superAdmin.id,
			},
		}),
		prisma.client.create({
			data: {
				ref: await getNextRef('clients'),
				name: 'Youssef Chraibi',
				phone: '0678901234',
				address: '234 Boulevard Moulay Ismail, Tétouan',
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
		prisma.supplier.create({
			data: {
				ref: await getNextRef('suppliers'),
				name: 'Fleurs du Rif',
				phone: '0525678901',
				address: '400 Zone Artisanale, Al Hoceima',
				createdById: superAdmin.id,
			},
		}),
		prisma.supplier.create({
			data: {
				ref: await getNextRef('suppliers'),
				name: 'Bio Plantes Maroc',
				phone: '0526789012',
				address: '500 Route Principale, Khemisset',
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('🏢 Created suppliers');

	// Create more sales with varied statuses and payment methods
	const sales = await Promise.all([
		// Original sales
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
		// Additional sales
		prisma.sale.create({
			data: {
				ref: await getNextRef('sales'),
				date: '2024-02-01T00:00:00.000Z',
				receiptNumber: 'REC-004',
				invoiceNumber: 'INV-004',
				totalPrice: 599.97,
				totalPaid: 599.97,
				totalDue: 0,
				status: 'paid',
				note: 'Paiement comptant',
				agentId: agent3.id,
				clientId: clients[4].id,
				createdById: agent3.id,
			},
		}),
		prisma.sale.create({
			data: {
				ref: await getNextRef('sales'),
				date: '2024-02-05T00:00:00.000Z',
				receiptNumber: 'REC-005',
				invoiceNumber: 'INV-005',
				totalPrice: 849.95,
				totalPaid: 400,
				totalDue: 449.95,
				status: 'partially_paid',
				note: 'Paiement échelonné',
				agentId: agent4.id,
				clientId: clients[5].id,
				createdById: agent4.id,
			},
		}),
	]);

	console.log('📋 Created sales');

	// Create more sale items
	await Promise.all([
		// Original sale items
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
		// Additional sale items
		prisma.saleItem.create({
			data: {
				price: 129.99,
				quantity: 2,
				saleId: sales[3].id,
				articleId: articles[6].id,
				createdById: agent3.id,
			},
		}),
		prisma.saleItem.create({
			data: {
				price: 69.99,
				quantity: 3,
				saleId: sales[3].id,
				articleId: articles[7].id,
				createdById: agent3.id,
			},
		}),
		prisma.saleItem.create({
			data: {
				price: 29.99,
				quantity: 5,
				saleId: sales[4].id,
				articleId: articles[8].id,
				createdById: agent4.id,
			},
		}),
		prisma.saleItem.create({
			data: {
				price: 24.99,
				quantity: 10,
				saleId: sales[4].id,
				articleId: articles[9].id,
				createdById: agent4.id,
			},
		}),
	]);

	console.log('🌿 Created sale items');

	// Create more purchases
	const purchases = await Promise.all([
		// Original purchases
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
		// Additional purchases
		prisma.purchase.create({
			data: {
				ref: await getNextRef('purchases'),
				date: '2024-02-01T00:00:00.000Z',
				receiptNumber: 'ACH-REC-004',
				invoiceNumber: 'ACH-INV-004',
				totalPrice: 4500,
				totalPaid: 4500,
				totalDue: 0,
				status: 'paid',
				note: 'Commande plantes exotiques',
				agentId: superAdmin.id,
				supplierId: suppliers[3].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.purchase.create({
			data: {
				ref: await getNextRef('purchases'),
				date: '2024-02-08T00:00:00.000Z',
				receiptNumber: 'ACH-REC-005',
				invoiceNumber: 'ACH-INV-005',
				totalPrice: 6000,
				totalPaid: 0,
				totalDue: 6000,
				status: 'pending',
				note: 'Commande saisonnière',
				agentId: superAdmin.id,
				supplierId: suppliers[4].id,
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('🛒 Created purchases');

	// Create more purchase items
	await Promise.all([
		// Original purchase items
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
		// Additional purchase items
		prisma.purchaseItem.create({
			data: {
				price: 80,
				quantity: 30,
				purchaseId: purchases[3].id,
				articleId: articles[6].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.purchaseItem.create({
			data: {
				price: 40,
				quantity: 50,
				purchaseId: purchases[3].id,
				articleId: articles[7].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.purchaseItem.create({
			data: {
				price: 15,
				quantity: 100,
				purchaseId: purchases[4].id,
				articleId: articles[8].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.purchaseItem.create({
			data: {
				price: 12,
				quantity: 150,
				purchaseId: purchases[4].id,
				articleId: articles[9].id,
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('🌿 Created purchase items');

	// Create more transactions
	await Promise.all([
		// Original transactions
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
