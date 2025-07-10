import { z } from 'zod';
import { ROLES } from '../constants';

export const LoginDto = z.object({
	name: z.string().min(1, "Nom d'utilisateur requis"),
	password: z.string().min(1, 'Mot de passe requis'),
});

export const RegisterDto = z.object({
	name: z
		.string()
		.min(1, "Le nom d'utilisateur est requis")
		.regex(
			/^[a-zA-Z0-9]+$/,
			"Le nom d'utilisateur ne peut contenir que des lettres et des chiffres"
		),
	email: z.string().email('Email invalide'),
	password: z
		.string()
		.min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
	role: z.enum(ROLES),
});

export type LoginDtoType = z.infer<typeof LoginDto>;
export type RegisterDtoType = z.infer<typeof RegisterDto>;
