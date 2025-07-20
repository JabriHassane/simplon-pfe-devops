export const DICT = {
	transactionType: {
		purchase: 'Achat',
		order: 'Vente',
		transfer: 'Transfert',
	},
	orderStatus: {
		pending: 'En attente',
		partially_paid: 'Réglement',
		paid: 'Payé',
		cancelled: 'Annulé',
	},
} as const;
