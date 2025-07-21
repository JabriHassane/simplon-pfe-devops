import type { DiscountType } from '../../../shared/constants';

export const formatPrice = (price: number) => {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'MAD',
	}).format(price);
};

export const formatDiscount = (discount: number, type: DiscountType) => {
	if (discount === 0) {
		return '0%';
	}

	if (type === 'percentage') {
		return `${discount}%`;
	}

	return formatPrice(discount);
};
