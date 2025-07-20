# Shared DTOs and Validation

This folder contains shared Data Transfer Objects (DTOs) that are used for validation in both the server and client applications.

## Structure

```
shared/
├── dtos/           # Zod schemas for validation
│   ├── auth.dto.ts
│   ├── user.dto.ts
│   ├── client.dto.ts
│   ├── sale.dto.ts
│   ├── product.dto.ts
│   ├── product-category.dto.ts
│   ├── purchase.dto.ts
│   ├── supplier.dto.ts
│   ├── transaction.dto.ts
│   └── account.dto.ts
└── types/          # TypeScript type definitions
    ├── client.types.ts
    ├── user.types.ts
    ├── sale.types.ts
    ├── product.types.ts
    ├── purchase.types.ts
    ├── supplier.types.ts
    ├── transaction.types.ts
    ├── discount.types.ts
    └── general.types.ts
```

## Server Usage

### Import DTOs

```typescript
import { LoginDto, RegisterDto } from '../../../shared/dtos/auth.dto';
import {
	CreateClientDto,
	UpdateClientDto,
} from '../../../shared/dtos/client.dto';
```

### Use with Validation Middleware

```typescript
import { validate } from '../middlewares/validation.middleware';

// In your router
router.post('/login', validate(LoginDto), authController.login);
router.post('/clients', validate(CreateClientDto), clientController.create);
```

### Type Inference

```typescript
import type {
	LoginDtoType,
	CreateClientDtoType,
} from '../../../shared/dtos/auth.dto';

// Use the inferred types
const loginData: LoginDtoType = {
	name: 'user',
	password: 'password',
};
```

## Client Usage

### Import Validation Utilities

```typescript
import { useFormValidation } from '../hooks/useFormValidation';
import { CreateClientDto, LoginDto } from '../utils/validation';
```

### Use with React Hook

```typescript
const { values, errors, isValid, setValue, validate, reset } =
	useFormValidation(
		CreateClientDto,
		{
			name: '',
			phone: '',
			address: '',
		},
		{ validateOnChange: true }
	);
```

### Form Component Example

```typescript
<TextField
	fullWidth
	label='Nom du client'
	value={values.name}
	onChange={(e) => setValue('name', e.target.value)}
	error={errors.some((err) => err.field === 'name')}
	helperText={errors.find((err) => err.field === 'name')?.message}
/>
```

## Available DTOs

### Auth DTOs

- `LoginDto` - Login form validation
- `RegisterDto` - Registration form validation
- `UpdateProfileDto` - Profile update validation

### Client DTOs

- `CreateClientDto` - Create client validation
- `UpdateClientDto` - Update client validation
- `ClientIdDto` - Client ID parameter validation

### User DTOs

- `CreateUserDto` - Create user validation
- `UpdateUserDto` - Update user validation
- `UserIdDto` - User ID parameter validation

### Sale DTOs

- `CreateSaleDto` - Create sale validation
- `UpdateSaleDto` - Update sale validation
- `SaleIdDto` - Sale ID parameter validation

### Product DTOs

- `CreateProductDto` - Create product validation
- `UpdateProductDto` - Update product validation
- `ProductIdDto` - Product ID parameter validation

### And more...

## Validation Features

### Server-side

- Automatic request validation using Zod
- Structured error responses
- Type-safe request handling

### Client-side

- Real-time form validation
- Field-level error display
- Form state management
- Type-safe form handling

## Error Handling

Both server and client use the same error structure:

```typescript
interface ValidationError {
	field: string;
	message: string;
}

interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
}
```

## Benefits

1. **Single Source of Truth**: Validation rules are defined once and shared
2. **Type Safety**: Full TypeScript support across server and client
3. **Consistency**: Same validation logic on both sides
4. **Maintainability**: Changes to validation rules only need to be made in one place
5. **Developer Experience**: Better IntelliSense and error detection
