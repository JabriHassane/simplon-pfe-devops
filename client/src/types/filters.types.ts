import type { OrderType, OrderStatus, Role, TransferActor } from '../../../shared/constants';
import type { ContactType } from '../../../shared/dtos/contact.dto';

export interface UserFilterParams {
	search?: string;
	role?: Role;
}

export interface ContactFilterParams {
	type?: ContactType;
	search?: string;
}

export interface OrderFilterParams {
	search?: string;
	type?: OrderType;
	dateFrom?: string;
	dateTo?: string;
	agentId?: string;
	contactId?: string;
	status?: OrderStatus;
}

export interface TransactionFilterParams {
	search?: string;
	dateFrom?: string;
	dateTo?: string;
	transferActor?: TransferActor;
}