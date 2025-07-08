export interface Account {
	id: string;
	ref: string;
	name: string;
	balance: number;
	createdAt: string;
	updatedAt: string | null;
	deletedAt: string | null;
	createdBy: string;
	updatedBy: string | null;
	deletedBy: string | null;
}

export interface CreateAccountData {
	name: string;
	balance?: number;
}

export interface UpdateAccountData {
	name?: string;
	balance?: number;
}

export interface AccountsResponse {
	accounts: Account[];
}

export interface AccountResponse {
	account: Account;
}
