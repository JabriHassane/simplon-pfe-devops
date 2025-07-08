# TanStack Query Implementation

This document outlines the TanStack Query (React Query) implementation for efficient data fetching and state management in the React application.

## Overview

TanStack Query has been implemented across all major pages and components to replace manual state management with `useState` and `useEffect`. This provides:

- **Automatic caching** and background refetching
- **Optimistic updates** for better UX
- **Error handling** and retry logic
- **Loading states** management
- **Cache invalidation** on mutations
- **DevTools** for debugging

## Setup

### QueryClient Provider

The `QueryClient` is configured in `App.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			retry: 1,
		},
	},
});

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			{/* App content */}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
```

## Available Hooks

### Account Hooks (`useAccounts.ts`)

- `useAccounts()` - Fetch all accounts
- `useAccount(id)` - Fetch single account
- `useCreateAccount()` - Create new account
- `useUpdateAccount()` - Update existing account
- `useDeleteAccount()` - Delete account

### Client Hooks (`useClients.ts`)

- `useClients()` - Fetch all clients
- `useClient(id)` - Fetch single client
- `useCreateClient()` - Create new client
- `useUpdateClient()` - Update existing client
- `useDeleteClient()` - Delete client

### Product Hooks (`useProducts.ts`)

- `useProducts()` - Fetch all products
- `useProduct(id)` - Fetch single product
- `useCreateProduct()` - Create new product
- `useUpdateProduct()` - Update existing product
- `useDeleteProduct()` - Delete product

### Supplier Hooks (`useSuppliers.ts`)

- `useSuppliers()` - Fetch all suppliers
- `useSupplier(id)` - Fetch single supplier
- `useCreateSupplier()` - Create new supplier
- `useUpdateSupplier()` - Update existing supplier
- `useDeleteSupplier()` - Delete supplier

### Product Category Hooks (`useProductCategories.ts`)

- `useProductCategories()` - Fetch all categories
- `useProductCategory(id)` - Fetch single category
- `useCreateProductCategory()` - Create new category
- `useUpdateProductCategory()` - Update existing category
- `useDeleteProductCategory()` - Delete category

### Order Hooks (`useOrders.ts`)

- `useOrders()` - Fetch all orders
- `useOrder(id)` - Fetch single order
- `useCreateOrder()` - Create new order
- `useUpdateOrder()` - Update existing order
- `useDeleteOrder()` - Delete order

### Purchase Hooks (`usePurchases.ts`)

- `usePurchases()` - Fetch all purchases
- `usePurchase(id)` - Fetch single purchase
- `useCreatePurchase()` - Create new purchase
- `useUpdatePurchase()` - Update existing purchase
- `useDeletePurchase()` - Delete purchase

### Transaction Hooks (`useTransactions.ts`)

- `useTransactions()` - Fetch all transactions
- `useTransaction(id)` - Fetch single transaction
- `useCreateTransaction()` - Create new transaction
- `useUpdateTransaction()` - Update existing transaction
- `useDeleteTransaction()` - Delete transaction

## Usage Examples

### Basic Data Fetching

```tsx
import { useClients } from '../hooks/useClients';

function ClientsPage() {
	const { data: clients = [], isLoading, error } = useClients();

	if (isLoading) return <CircularProgress />;
	if (error) return <Alert severity='error'>Failed to load clients</Alert>;

	return (
		<div>
			{clients.map((client) => (
				<div key={client.id}>{client.name}</div>
			))}
		</div>
	);
}
```

### Mutations with Optimistic Updates

```tsx
import {
	useCreateClient,
	useUpdateClient,
	useDeleteClient,
} from '../hooks/useClients';

function ClientForm({ client, onSuccess }) {
	const createMutation = useCreateClient();
	const updateMutation = useUpdateClient();

	const handleSubmit = async (data) => {
		try {
			if (client) {
				await updateMutation.mutateAsync({ id: client.id, data });
			} else {
				await createMutation.mutateAsync(data);
			}
			onSuccess();
		} catch (error) {
			console.error('Error saving client:', error);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			{/* form fields */}
			<Button
				type='submit'
				disabled={createMutation.isPending || updateMutation.isPending}
			>
				{createMutation.isPending || updateMutation.isPending
					? 'Saving...'
					: 'Save'}
			</Button>
		</form>
	);
}
```

## Query Keys

Query keys are organized hierarchically for efficient cache management:

- `['accounts']` - All accounts
- `['accounts', id]` - Single account
- `['clients']` - All clients
- `['clients', id]` - Single client
- `['products']` - All products
- `['products', id]` - Single product
- `['suppliers']` - All suppliers
- `['suppliers', id]` - Single supplier
- `['product-categories']` - All categories
- `['product-categories', id]` - Single category
- `['orders']` - All orders
- `['orders', id]` - Single order
- `['purchases']` - All purchases
- `['purchases', id]` - Single purchase
- `['transactions']` - All transactions
- `['transactions', id]` - Single transaction

## Cache Invalidation

Mutations automatically invalidate related queries:

- Creating/updating/deleting an entity invalidates the list query
- Updating an entity also updates the individual entity cache
- Deleting an entity removes it from both list and individual caches

## Updated Pages

The following pages have been successfully migrated to use TanStack Query:

### ✅ Completed Pages

- **Clients** (`/clients`) - Full CRUD with `useClients` hooks
- **Users** (`/users`) - Full CRUD with `useUsers` hooks
- **Products** (`/products`) - Full CRUD with `useProducts` hooks
- **Suppliers** (`/suppliers`) - Full CRUD with `useSuppliers` hooks
- **Accounts** (`/accounts`) - Full CRUD with `useAccounts` hooks
- **Sales** (`/sales`) - Full CRUD with `useOrders` hooks
- **Purchases** (`/purchases`) - Full CRUD with `usePurchases` hooks
- **Transactions** (`/transactions`) - Full CRUD with `useTransactions` hooks
- **Dashboard** (`/dashboard`) - Data fetching with multiple hooks
- **Reports** (`/reports`) - Data fetching with multiple hooks

### ✅ Updated Components

- **ClientForm** - Updated to support `onCancel` and `isLoading` props
- **UserForm** - Updated to support `onCancel` and `isLoading` props
- **ProductForm** - Updated to support `onCancel` and `isLoading` props
- **SupplierForm** - Updated to support `onCancel` and `isLoading` props
- **AccountForm** - Updated to support `onCancel` and `isLoading` props
- **OrderForm** - Updated to support `onCancel` and `isLoading` props
- **PurchaseForm** - Updated to support `onCancel` and `isLoading` props
- **TransactionForm** - Updated to support `onCancel` and `isLoading` props

### ⚠️ Not Updated

- **Settings** (`/settings`) - Uses local state only, no API calls needed

## Benefits Achieved

1. **Improved Performance**: Automatic caching reduces unnecessary API calls
2. **Better UX**: Loading states, optimistic updates, and error handling
3. **Developer Experience**: DevTools for debugging, consistent patterns
4. **Maintainability**: Centralized data fetching logic
5. **Real-time Updates**: Background refetching keeps data fresh
6. **Error Recovery**: Automatic retries and error boundaries

## Best Practices

1. **Always provide default values** for data arrays: `data: clients = []`
2. **Handle loading and error states** in components
3. **Use `isPending` for mutation loading states**
4. **Leverage optimistic updates** for better UX
5. **Invalidate related queries** after mutations
6. **Use TypeScript interfaces** for type safety

## DevTools

React Query DevTools are available in development mode. Press `Ctrl+H` (or `Cmd+H` on Mac) to toggle the DevTools panel for debugging queries, mutations, and cache state.
