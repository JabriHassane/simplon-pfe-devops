import type { Entity } from './general.types';

export interface ProductCategory extends Entity {
	name: string;
}

export interface Product extends Entity {
	name: string;
	image: string;
	category: string | ProductCategory;
	price: number;
	inventory: number;
}
