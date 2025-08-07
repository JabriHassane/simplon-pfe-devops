/*
  Warnings:

  - Made the column `agentId` on table `orders` required. This step will fail if there are existing NULL values in that column.
  - Made the column `agentId` on table `transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_agentId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_agentId_fkey";

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "agentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "agentId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
