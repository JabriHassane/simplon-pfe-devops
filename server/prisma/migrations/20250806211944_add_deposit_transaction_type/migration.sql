/*
  Warnings:

  - You are about to drop the column `isCashed` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `isDeposited` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "isCashed",
DROP COLUMN "isDeposited";
