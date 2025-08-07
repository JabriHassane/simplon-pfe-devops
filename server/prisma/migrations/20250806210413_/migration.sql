/*
  Warnings:

  - You are about to drop the column `transferTransactionId` on the `transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[depositTransactionId]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_transferTransactionId_fkey";

-- DropIndex
DROP INDEX "transactions_transferTransactionId_key";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "transferTransactionId",
ADD COLUMN     "depositTransactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "transactions_depositTransactionId_key" ON "transactions"("depositTransactionId");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_depositTransactionId_fkey" FOREIGN KEY ("depositTransactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
