export const DICT = {
	transactionType: {
		purchase: 'Achat',
		sale: 'Vente',
		send: 'Envoi',
		receive: 'Réception',
		cashing: 'Encaissement',
	},
	orderStatus: {
		pending: 'En attente',
		partially_paid: 'Règlement',
		paid: 'Payé',
		cancelled: 'Annulé',
	},
	methods: {
		cash: 'Espèce',
		check: 'Chèque',
		tpe: 'TPE',
		bank_transfer: 'Virement',
	},
} as const;
