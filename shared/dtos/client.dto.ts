import { z } from 'zod';

export const CreateClientDto = z.object({
	body: z.object({
		name: z
			.string()
			.min(2, 'Le nom du client doit contenir au moins 2 caractères')
			.max(100, 'Le nom du client ne peut pas dépasser 100 caractères'),
		phone: z
			.string()
			.min(8, 'Le numéro de téléphone doit contenir au moins 8 caractères')
			.max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères'),
		address: z.string().optional(),
	}),
});

export const UpdateClientDto = z.object({
	params: z.object({
		id: z.string(),
	}),
	body: CreateClientDto.partial(),
});

export const ClientIdDto = z.object({
	params: z.object({
		id: z.string().min(1, 'ID client requis'),
	}),
});

export type CreateClientDtoType = z.infer<typeof CreateClientDto>;
export type UpdateClientDtoType = z.infer<typeof UpdateClientDto>;
export type ClientIdDtoType = z.infer<typeof ClientIdDto>;
