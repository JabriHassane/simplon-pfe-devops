/*
  Warnings:

  - Made the column `paymentMethod` on table `transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "purchases" ALTER COLUMN "receiptNumber" DROP NOT NULL,
ALTER COLUMN "invoiceNumber" DROP NOT NULL,
ALTER COLUMN "note" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sales" ALTER COLUMN "receiptNumber" DROP NOT NULL,
ALTER COLUMN "invoiceNumber" DROP NOT NULL,
ALTER COLUMN "note" DROP NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "paymentMethod" SET NOT NULL;
