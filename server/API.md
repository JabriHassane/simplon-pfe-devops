# PPP API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/login

Login with name and password.

**Request Body:**

```json
{
	"name": "admin",
	"password": "admin123"
}
```

**Response:**

```json
{
	"message": "Login successful",
	"user": {
		"id": "user-id",
		"name": "admin",
		"email": "admin@ppp.com",
		"role": "super_admin"
	},
	"token": "jwt-token-here"
}
```

#### POST /auth/register

Register a new user (requires admin role).

**Request Body:**

```json
{
	"name": "newuser",
	"email": "user@example.com",
	"password": "password123",
	"role": "agent"
}
```

#### GET /auth/profile

Get current user profile (requires authentication).

#### PUT /auth/profile

Update current user profile (requires authentication).

### Users

#### GET /users

Get all users (requires admin role).

#### GET /users/:id

Get user by ID (requires admin role).

#### POST /users

Create new user (requires admin role).

#### PUT /users/:id

Update user (requires admin role).

#### DELETE /users/:id

Delete user (requires admin role).

### Other Endpoints

The following endpoints are protected and require authentication:

- `GET /clients` - Get all clients
- `GET /suppliers` - Get all suppliers
- `GET /products` - Get all products
- `GET /orders` - Get all orders
- `GET /purchases` - Get all purchases
- `GET /transactions` - Get all transactions
- `GET /accounts` - Get all accounts
- `GET /reports` - Get reports

## Role-Based Access Control

- **super_admin**: Full access to all endpoints
- **admin**: Access to most endpoints, can manage users
- **agent**: Basic access to business operations

## Error Responses

### 401 Unauthorized

```json
{
	"message": "Authorization header required"
}
```

### 403 Forbidden

```json
{
	"message": "Insufficient permissions"
}
```

### 404 Not Found

```json
{
	"message": "User not found"
}
```

### 500 Internal Server Error

```json
{
	"message": "Internal server error"
}
```

## Setup Instructions

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment:**

   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. **Set up database:**

   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

4. **Start server:**
   ```bash
   npm run dev
   ```

## Default Credentials

After running the seed script:

- **Username:** admin
- **Password:** admin123
- **Email:** admin@ppp.com
- **Role:** super_admin
