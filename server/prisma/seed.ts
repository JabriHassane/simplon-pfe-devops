import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getNextRef } from '../src/utils/db.utils';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Starting database seed...');

	// Clear existing data (in correct sale due to foreign key constraints)
	await prisma.transaction.deleteMany();
	await prisma.sale.deleteMany();
	await prisma.purchase.deleteMany();
	await prisma.client.deleteMany();
	await prisma.supplier.deleteMany();
	await prisma.user.deleteMany();

	const sequences = [
		'users',
		'clients',
		'suppliers',
		'sales',
		'purchases',
		'transactions',
	];

	for (const sequence of sequences) {
		await prisma.$executeRawUnsafe(
			`DROP SEQUENCE IF EXISTS ${sequence}_ref_seq`
		);
		await prisma.$queryRawUnsafe(
			`CREATE SEQUENCE IF NOT EXISTS ${sequence}_ref_seq START 1`
		);
	}

	const x = await bcrypt.hash('123456', 10);
	const y = await prisma.user.create({
		data: {
			ref: await getNextRef('users'),
			name: 'PPP',
			password: x,
			role: 'super_admin',
		},
	});
	return;

	console.log('🗑️  Cleared existing data');

	// Create super admin user
	const hashedPassword = await bcrypt.hash('admin123', 10);
	const superAdmin = await prisma.user.create({
		data: {
			ref: await getNextRef('users'),
			name: 'PPP',
			password: hashedPassword,
			role: 'super_admin',
		},
	});

	// Create admin users
	const admin1 = await prisma.user.create({
		data: {
			ref: await getNextRef('users'),
			name: 'Nabil',
			password: hashedPassword,
			role: 'admin',
			createdById: superAdmin.id,
		},
	});

	const admin2 = await prisma.user.create({
		data: {
			ref: await getNextRef('users'),
			name: 'Faycal',
			password: hashedPassword,
			role: 'admin',
			createdById: superAdmin.id,
		},
	});

	// Create agent user
	const agent = await prisma.user.create({
		data: {
			ref: await getNextRef('users'),
			name: 'Oussama',
			password: hashedPassword,
			role: 'agent',
			createdById: superAdmin.id,
		},
	});

	console.log('👥 Created users');

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
				agentId: agent.id,
				clientId: clients[0].id,
				createdById: agent.id,
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
				agentId: admin1.id,
				clientId: clients[1].id,
				createdById: admin1.id,
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
				agentId: agent.id,
				clientId: clients[2].id,
				createdById: agent.id,
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
				agentId: admin2.id,
				clientId: clients[4].id,
				createdById: admin2.id,
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
				agentId: admin1.id,
				clientId: clients[5].id,
				createdById: admin1.id,
			},
		}),
	]);

	console.log('📋 Created sales');

	// Create more purchases
	const purchases = await Promise.all([
		// Original purchases
		prisma.purchase.create({
			data: {
				ref: await getNextRef('purchases'),
				date: '2024-01-10T00:00:00.000Z',
				receiptNumber: 'ACH-REC-001',
				invoiceNumber: 'ACH-INV-001',
				totalPrice: 800,
				totalPaid: 800,
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
				totalPrice: 600,
				totalPaid: 400,
				totalDue: 200,
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
				totalPrice: 900,
				totalPaid: 500,
				totalDue: 400,
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
				totalPrice: 1200,
				totalPaid: 1200,
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
				totalPrice: 1500,
				totalPaid: 0,
				totalDue: 1500,
				status: 'pending',
				note: 'Commande saisonnière',
				agentId: superAdmin.id,
				supplierId: suppliers[4].id,
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('🛒 Created purchases');

	// Create more transactions
	await Promise.all([
		// Original transactions
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-15T00:00:00.000Z',
				type: 'sale',
				method: 'cash',
				amount: 200,
				agentId: agent.id,
				saleId: sales[0].id,
				createdById: agent.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-15T00:00:00.000Z',
				type: 'sale',
				method: 'bank_transfer',
				amount: 189.98,
				agentId: agent.id,
				saleId: sales[0].id,
				createdById: agent.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-20T00:00:00.000Z',
				type: 'sale',
				method: 'check',
				amount: 200,
				agentId: admin1.id,
				saleId: sales[1].id,
				createdById: admin1.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-10T00:00:00.000Z',
				type: 'purchase',
				method: 'bank_transfer',
				amount: 500,
				agentId: superAdmin.id,
				purchaseId: purchases[0].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-10T00:00:00.000Z',
				type: 'purchase',
				method: 'check',
				amount: 300,
				agentId: superAdmin.id,
				purchaseId: purchases[0].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-18T00:00:00.000Z',
				type: 'purchase',
				method: 'cash',
				amount: 250,
				agentId: superAdmin.id,
				purchaseId: purchases[1].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-18T00:00:00.000Z',
				type: 'purchase',
				method: 'bank_transfer',
				amount: 150,
				agentId: superAdmin.id,
				purchaseId: purchases[1].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-25T00:00:00.000Z',
				type: 'purchase',
				method: 'bank_transfer',
				amount: 400,
				agentId: superAdmin.id,
				purchaseId: purchases[2].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-25T00:00:00.000Z',
				type: 'purchase',
				method: 'check',
				amount: 100,
				agentId: superAdmin.id,
				purchaseId: purchases[2].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-22T00:00:00.000Z',
				type: 'cashing',
				method: 'bank_transfer',
				amount: 1000,
				agentId: superAdmin.id,
				createdById: superAdmin.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-24T00:00:00.000Z',
				type: 'receive',
				method: 'cash',
				amount: 3000,
				transferActor: 'Bank ABC',
				agentId: superAdmin.id,
				createdById: superAdmin.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-26T00:00:00.000Z',
				type: 'cashing',
				method: 'check',
				amount: 1500,
				agentId: superAdmin.id,
				createdById: superAdmin.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-27T00:00:00.000Z',
				type: 'send',
				method: 'cash',
				amount: 4000,
				transferActor: 'Bank DEF',
				agentId: superAdmin.id,
				createdById: superAdmin.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-28T00:00:00.000Z',
				type: 'receive',
				method: 'cash',
				amount: 2500,
				transferActor: 'Bank GHI',
				agentId: superAdmin.id,
				createdById: superAdmin.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-01-29T00:00:00.000Z',
				type: 'cashing',
				method: 'tpe',
				amount: 1000,
				agentId: superAdmin.id,
				createdById: superAdmin.id,
			},
		}),
		// Missing transactions for paid sales
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-02-01T00:00:00.000Z',
				type: 'sale',
				method: 'tpe',
				amount: 299.97,
				agentId: admin2.id,
				saleId: sales[3].id,
				createdById: admin2.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-02-01T00:00:00.000Z',
				type: 'sale',
				method: 'cash',
				amount: 300,
				agentId: admin2.id,
				saleId: sales[3].id,
				createdById: admin2.id,
			},
		}),
		// Missing transactions for partially paid sales
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-02-05T00:00:00.000Z',
				type: 'sale',
				method: 'bank_transfer',
				amount: 250,
				agentId: admin1.id,
				saleId: sales[4].id,
				createdById: admin1.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-02-05T00:00:00.000Z',
				type: 'sale',
				method: 'check',
				amount: 150,
				agentId: admin1.id,
				saleId: sales[4].id,
				createdById: admin1.id,
			},
		}),
		// Missing transactions for paid purchases
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-02-01T00:00:00.000Z',
				type: 'purchase',
				method: 'tpe',
				amount: 500,
				agentId: superAdmin.id,
				purchaseId: purchases[3].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-02-01T00:00:00.000Z',
				type: 'purchase',
				method: 'cash',
				amount: 400,
				agentId: superAdmin.id,
				purchaseId: purchases[3].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-02-01T00:00:00.000Z',
				type: 'purchase',
				method: 'bank_transfer',
				amount: 300,
				agentId: superAdmin.id,
				purchaseId: purchases[3].id,
				createdById: superAdmin.id,
			},
		}),
		prisma.transaction.create({
			data: {
				ref: await getNextRef('transactions'),
				date: '2024-02-18T00:00:00.000Z',
				type: 'cashing',
				method: 'tpe',
				amount: 800,
				agentId: superAdmin.id,
				createdById: superAdmin.id,
			},
		}),
	]);

	console.log('💳 Created transactions');

	console.log('✅ Database seeded successfully!');
}

main()
	.catch((e) => {
		console.error('❌ Error seeding database:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
