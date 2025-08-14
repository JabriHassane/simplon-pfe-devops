export const DICT = {
	transactionType: {
		purchase: 'Achat',
		sale: 'Vente',
		send: 'Envoi',
		receive: 'Réception',
		cashing: 'Encaissement',
		deposit: 'Dépôt',
	},
	orderStatus: {
		partially_paid: 'Règlement',
		paid: 'Payé',
	},
	methods: {
		cash: 'Espèce',
		check: 'Chèque',
		tpe: 'TPE',
		bank_transfer: 'Virement',
		deposit: 'Dépôt',
	},
	role: {
		super_admin: 'Super admin',
		admin: 'Admin',
		agent: 'Agent',
	},
} as const;
