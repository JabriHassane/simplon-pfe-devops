import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Starting database seed...');

	// Check if super admin already exists
	const existingSuperAdmin = await prisma.user.findFirst({
		where: { role: 'SUPER_ADMIN' },
	});

	if (existingSuperAdmin) {
		console.log('✅ Super admin already exists, skipping seed');
		return;
	}

	// Create super admin user
	const hashedPassword = await bcrypt.hash('admin123', 12);

	const superAdmin = await prisma.user.create({
		data: {
			username: 'admin',
			email: 'admin@ppp.com',
			password: hashedPassword,
			role: 'SUPER_ADMIN',
			ref: `USER-${Date.now()}`,
			createdBy: 'system',
		},
	});

	console.log('✅ Super admin created:', {
		id: superAdmin.id,
		username: superAdmin.username,
		email: superAdmin.email,
		role: superAdmin.role,
	});

	// Create default accounts
	const defaultAccounts = [
		{ name: 'Caisse Espèces', balance: 0 },
		{ name: 'Caisse Chèques', balance: 0 },
		{ name: 'Banque', balance: 0 },
	];

	for (const account of defaultAccounts) {
		const createdAccount = await prisma.account.create({
			data: {
				name: account.name,
				balance: account.balance,
				ref: `ACC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				createdBy: superAdmin.id,
			},
		});

		console.log('✅ Account created:', createdAccount.name);
	}

	console.log('🎉 Database seed completed successfully!');
	console.log('📝 Default credentials:');
	console.log('   Username: admin');
	console.log('   Password: admin123');
	console.log('   Email: admin@ppp.com');
}

main()
	.catch((e) => {
		console.error('❌ Seed error:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
