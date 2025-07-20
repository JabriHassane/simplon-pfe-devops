export const DICT = {
	transactionType: {
		purchase: 'Achat',
		sale: 'Vente',
		transfer: 'Transfert',
	},
	saleStatus: {
		pending: 'En attente',
		partially_paid: 'Règlement',
		paid: 'Payé',
		cancelled: 'Annulé',
	},
} as const;
