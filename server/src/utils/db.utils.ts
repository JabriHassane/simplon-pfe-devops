import { PrismaClient } from '@prisma/client';

const TABLE_PREFIX_MAP = {
	users: 'UTI',
	accounts: 'COM',
	contacts: 'CON',
	orders: 'ORD',
	transactions: 'TRA',
};

export const getNextRef = async (table: keyof typeof TABLE_PREFIX_MAP) => {
	const prisma = new PrismaClient();

	const [result] = await prisma.$queryRawUnsafe<{ nextval: number }[]>(
		`SELECT nextval('${table}_ref_seq')`
	);
	const nextId = result.nextval;
	return `${TABLE_PREFIX_MAP[table]}-${nextId}`;
};
