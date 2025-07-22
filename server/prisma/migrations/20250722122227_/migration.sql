/*
  Warnings:

  - The `paymentMethods` column on the `accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "paymentMethods",
ADD COLUMN     "paymentMethods" TEXT[];
