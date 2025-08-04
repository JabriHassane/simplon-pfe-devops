import { z } from 'zod';

export const CreateClientDto = z.object({
	name: z.string().min(1, 'Le nom du client ne doit pas être vide'),
	phone: z.string().optional(),
	address: z.string().optional(),
});

export const UpdateClientDto = CreateClientDto;

export const ClientDto = z.object({
	id: z.string(),
	ref: z.string(),
	...CreateClientDto.shape,
});

export type CreateClientDtoType = z.infer<typeof CreateClientDto>;
export type UpdateClientDtoType = z.infer<typeof UpdateClientDto>;
export type ClientDtoType = z.infer<typeof ClientDto>;
