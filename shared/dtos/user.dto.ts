import { z } from 'zod';
import { ROLES } from '../constants';

export const CreateUserDto = z.object({
	name: z
		.string()
		.min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
		.regex(
			/^[a-zA-Z0-9_]+$/,
			"Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores"
		),
	password: z
		.string()
		.min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
	role: z.enum(ROLES),
});

export const UpdateUserDto = CreateUserDto.extend({
	password: z
		.string()
		.optional()
		.refine((val) => !val || val.length >= 6, {
			message: 'Le mot de passe doit contenir au moins 6 caractères',
		}),
});

export const UserDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreateUserDto.omit({ password: true }).shape,
});

export type CreateUserDtoType = z.infer<typeof CreateUserDto>;
export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;
export type UserDtoType = z.infer<typeof UserDto>;
