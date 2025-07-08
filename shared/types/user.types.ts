import type { Entity } from './general.types';

export const Role = {
	SUPER_ADMIN: 'SUPER_ADMIN',
	ADMIN: 'ADMIN',
	AGENT: 'AGENT',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface User extends Entity {
	id: string;
	username: string;
	email: string;
	password: string;
	role: Role;
}
