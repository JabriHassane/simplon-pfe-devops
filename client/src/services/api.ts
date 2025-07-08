const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
	private getAuthHeaders(): HeadersInit {
		const token = localStorage.getItem('token');
		return {
			'Content-Type': 'application/json',
			...(token && { Authorization: `Bearer ${token}` }),
		};
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<T> {
		const url = `${API_BASE_URL}${endpoint}`;
		const config: RequestInit = {
			headers: this.getAuthHeaders(),
			...options,
		};

		try {
			const response = await fetch(url, config);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'API request failed');
			}

			return data;
		} catch (error) {
			console.error('API request error:', error);
			throw error;
		}
	}

	// Authentication
	async login(username: string, password: string) {
		return this.request<{ user: any; token: string }>('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ username, password }),
		});
	}

	async getProfile() {
		return this.request('/auth/profile');
	}

	// Accounts
	async getAccounts() {
		return this.request('/accounts');
	}

	async getAccount(id: string) {
		return this.request(`/accounts/${id}`);
	}

	async createAccount(data: { name: string; balance?: number }) {
		return this.request('/accounts', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async updateAccount(id: string, data: { name?: string; balance?: number }) {
		return this.request(`/accounts/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async deleteAccount(id: string) {
		return this.request(`/accounts/${id}`, {
			method: 'DELETE',
		});
	}

	// Users
	async getUsers() {
		return this.request('/users');
	}

	async getUser(id: string) {
		return this.request(`/users/${id}`);
	}

	async createUser(data: {
		username: string;
		email: string;
		password: string;
		role?: string;
	}) {
		return this.request('/users', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async updateUser(
		id: string,
		data: { username?: string; email?: string; role?: string }
	) {
		return this.request(`/users/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async deleteUser(id: string) {
		return this.request(`/users/${id}`, {
			method: 'DELETE',
		});
	}

	// Clients
	async getClients() {
		return this.request('/clients');
	}

	async getClient(id: string) {
		return this.request(`/clients/${id}`);
	}

	async createClient(data: {
		name: string;
		email: string;
		phone?: string;
		address?: string;
		type?: 'INDIVIDUAL' | 'COMPANY';
	}) {
		return this.request('/clients', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async updateClient(
		id: string,
		data: {
			name?: string;
			email?: string;
			phone?: string;
			address?: string;
			type?: 'INDIVIDUAL' | 'COMPANY';
		}
	) {
		return this.request(`/clients/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async deleteClient(id: string) {
		return this.request(`/clients/${id}`, {
			method: 'DELETE',
		});
	}

	// Suppliers
	async getSuppliers() {
		return this.request('/suppliers');
	}

	async getSupplier(id: string) {
		return this.request(`/suppliers/${id}`);
	}

	async createSupplier(data: {
		name: string;
		email: string;
		phone?: string;
		address?: string;
		contactPerson?: string;
	}) {
		return this.request('/suppliers', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async updateSupplier(
		id: string,
		data: {
			name?: string;
			email?: string;
			phone?: string;
			address?: string;
			contactPerson?: string;
		}
	) {
		return this.request(`/suppliers/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async deleteSupplier(id: string) {
		return this.request(`/suppliers/${id}`, {
			method: 'DELETE',
		});
	}

	// Products
	async getProducts() {
		return this.request('/products');
	}

	async getProduct(id: string) {
		return this.request(`/products/${id}`);
	}

	async createProduct(data: {
		name: string;
		description?: string;
		price: number;
		cost: number;
		stockQuantity: number;
		categoryId: string;
		sku?: string;
	}) {
		return this.request('/products', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async updateProduct(
		id: string,
		data: {
			name?: string;
			description?: string;
			price?: number;
			cost?: number;
			stockQuantity?: number;
			categoryId?: string;
			sku?: string;
		}
	) {
		return this.request(`/products/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async deleteProduct(id: string) {
		return this.request(`/products/${id}`, {
			method: 'DELETE',
		});
	}

	// Product Categories
	async getProductCategories() {
		return this.request('/product-categories');
	}

	async getProductCategory(id: string) {
		return this.request(`/product-categories/${id}`);
	}

	async createProductCategory(data: { name: string; description?: string }) {
		return this.request('/product-categories', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async updateProductCategory(
		id: string,
		data: {
			name?: string;
			description?: string;
		}
	) {
		return this.request(`/product-categories/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async deleteProductCategory(id: string) {
		return this.request(`/product-categories/${id}`, {
			method: 'DELETE',
		});
	}

	// Orders
	async getOrders() {
		return this.request('/orders');
	}

	async getOrder(id: string) {
		return this.request(`/orders/${id}`);
	}

	async createOrder(data: {
		clientId: string;
		items: Array<{
			productId: string;
			quantity: number;
			price: number;
		}>;
		discountAmount?: number;
		discountType?: 'PERCENTAGE' | 'FIXED';
		notes?: string;
	}) {
		return this.request('/orders', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async updateOrder(
		id: string,
		data: {
			clientId?: string;
			items?: Array<{
				productId: string;
				quantity: number;
				price: number;
			}>;
			discountAmount?: number;
			discountType?: 'PERCENTAGE' | 'FIXED';
			notes?: string;
		}
	) {
		return this.request(`/orders/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async deleteOrder(id: string) {
		return this.request(`/orders/${id}`, {
			method: 'DELETE',
		});
	}

	// Purchases
	async getPurchases() {
		return this.request('/purchases');
	}

	async getPurchase(id: string) {
		return this.request(`/purchases/${id}`);
	}

	async createPurchase(data: {
		supplierId: string;
		items: Array<{
			productId: string;
			quantity: number;
			price: number;
		}>;
		discountAmount?: number;
		discountType?: 'PERCENTAGE' | 'FIXED';
		notes?: string;
	}) {
		return this.request('/purchases', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async updatePurchase(
		id: string,
		data: {
			supplierId?: string;
			items?: Array<{
				productId: string;
				quantity: number;
				price: number;
			}>;
			discountAmount?: number;
			discountType?: 'PERCENTAGE' | 'FIXED';
			notes?: string;
		}
	) {
		return this.request(`/purchases/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async deletePurchase(id: string) {
		return this.request(`/purchases/${id}`, {
			method: 'DELETE',
		});
	}

	// Transactions
	async getTransactions() {
		return this.request('/transactions');
	}

	async getTransaction(id: string) {
		return this.request(`/transactions/${id}`);
	}

	async createTransaction(data: {
		accountId: string;
		type: 'INCOME' | 'EXPENSE';
		amount: number;
		description: string;
		reference?: string;
		date: string;
	}) {
		return this.request('/transactions', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async updateTransaction(
		id: string,
		data: {
			accountId?: string;
			type?: 'INCOME' | 'EXPENSE';
			amount?: number;
			description?: string;
			reference?: string;
			date?: string;
		}
	) {
		return this.request(`/transactions/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	}

	async deleteTransaction(id: string) {
		return this.request(`/transactions/${id}`, {
			method: 'DELETE',
		});
	}
}

export const apiService = new ApiService();
