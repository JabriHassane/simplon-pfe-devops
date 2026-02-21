import { prisma } from "../../prisma/prisma.config";

const TABLE_PREFIX_MAP = {
	users: 'UTI',
	accounts: 'COM',
	clients: 'CLI',
	suppliers: 'FOU',
	sales: 'VEN',
	purchases: 'ACH',
	transactions: 'TRA',
};

export const getNextRef = async (table: keyof typeof TABLE_PREFIX_MAP) => {
	const result = await prisma.refCounter.upsert({
		where: { table },
		update: { counter: { increment: 1 } },
		create: { table, counter: 1 },
	});
	return `${TABLE_PREFIX_MAP[table]}-${result.counter}`;
};
