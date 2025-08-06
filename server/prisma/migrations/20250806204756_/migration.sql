/*
  Warnings:

  - You are about to drop the column `isCashed` on the `transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cashingTransactionId]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transferTransactionId]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TransactionAccount" AS ENUM ('nabil', 'faycal', 'redouane', 'bank');

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "isCashed",
ADD COLUMN     "cashingTransactionId" TEXT,
ADD COLUMN     "transferTransactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "transactions_cashingTransactionId_key" ON "transactions"("cashingTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_transferTransactionId_key" ON "transactions"("transferTransactionId");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_cashingTransactionId_fkey" FOREIGN KEY ("cashingTransactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_transferTransactionId_fkey" FOREIGN KEY ("transferTransactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
