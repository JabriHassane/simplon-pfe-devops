import type { Entity } from './general.types';

export interface Supplier extends Entity {
	name: string;
	phone: string;
	address: string;
}
