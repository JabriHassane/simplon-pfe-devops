export const formatPrice = (price: number, showCurrency = true) => {
	return (
		price
			.toFixed(2)
			.replace('.', ',')
			.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (showCurrency ? ' DH' : '')
	);
};
