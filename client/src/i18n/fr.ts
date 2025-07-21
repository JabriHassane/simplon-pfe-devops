export const DICT = {
	transactionType: {
		purchase: 'Achat',
		sale: 'Vente',
		transfer: 'Transfert',
	},
	orderStatus: {
		pending: 'En attente',
		partially_paid: 'Règlement',
		paid: 'Payé',
		cancelled: 'Annulé',
	},
	discountType: {
		fixed: 'Montant fixe',
		percentage: 'Pourcentage',
	},
} as const;
