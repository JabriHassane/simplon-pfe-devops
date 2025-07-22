import { z } from 'zod';
import { CreateOrderDto, OrderDto } from './order.dto';
import { ClientDto } from './client.dto';

export const CreateSaleDto = CreateOrderDto.extend({
	clientId: z.string().optional(),
});

export const UpdateSaleDto = CreateSaleDto;

export const SaleDto = OrderDto.extend({
	client: ClientDto.optional(),
});

export type CreateSaleDtoType = z.infer<typeof CreateSaleDto>;
export type UpdateSaleDtoType = z.infer<typeof UpdateSaleDto>;
export type SaleDtoType = z.infer<typeof SaleDto>;
