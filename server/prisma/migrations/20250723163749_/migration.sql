/*
  Warnings:

  - Changed the type of `status` on the `purchases` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `sales` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'partially_paid', 'paid', 'cancelled');

-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL;

-- AlterTable
ALTER TABLE "sales" DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "transferActor" TEXT;

-- DropEnum
DROP TYPE "SaleStatus";
