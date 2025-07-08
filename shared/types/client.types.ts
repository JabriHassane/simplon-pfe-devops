import type { Entity } from './general.types';

export interface Client extends Entity {
	name: string;
	phone: string;
	address: string;
}
