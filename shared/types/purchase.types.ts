import type { Supplier } from './supplier.types';
import type { Order } from './order.types';

export interface Purchase extends Omit<Order, 'client'> {
	supplier: string | Supplier;
}
