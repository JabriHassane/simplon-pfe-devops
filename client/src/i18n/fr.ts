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
	paymentMethods: {
		cash: "Espèce",
		check: "Chèque",
		tpe: "TPE",
		bankTransfer: "Virement",
	}
} as const;
