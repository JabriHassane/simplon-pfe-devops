# PPP Server

Backend server for the PPP (Point de Vente) application.

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Environment setup:**

   ```bash
   cp env.example .env
   ```

   Update the `.env` file with your database credentials.

3. **Database setup:**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database (for development)
   npm run db:push

   # Or create migrations (for production)
   npm run db:migrate
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Database Schema

The Prisma schema includes the following models:

- **User** - System users with roles (super_admin, admin, agent)
- **Client** - Customer information
- **Supplier** - Supplier information
- **ProductCategory** - Product categories
- **Product** - Products with inventory tracking
- **Order** - Sales orders with items and payments
- **OrderItem** - Individual items in orders
- **Purchase** - Purchase orders from suppliers
- **PurchaseItem** - Individual items in purchases
- **Account** - Financial accounts (cash, bank, etc.)
- **Transaction** - Financial transactions between accounts
- **Discount** - Discounts applied to orders/purchases

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and apply migrations
- `npm run db:studio` - Open Prisma Studio for database management
