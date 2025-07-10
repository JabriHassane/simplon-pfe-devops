/*
  Warnings:

  - You are about to drop the column `ref` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `ref` on the `purchase_items` table. All the data in the column will be lost.
  - You are about to drop the `discounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "discounts" DROP CONSTRAINT "discounts_orderId_fkey";

-- DropForeignKey
ALTER TABLE "discounts" DROP CONSTRAINT "discounts_purchaseId_fkey";

-- DropIndex
DROP INDEX "order_items_ref_key";

-- DropIndex
DROP INDEX "purchase_items_ref_key";

-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "address" SET DEFAULT '';

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "ref";

-- AlterTable
ALTER TABLE "purchase_items" DROP COLUMN "ref";

-- AlterTable
ALTER TABLE "suppliers" ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "address" SET DEFAULT '';

-- DropTable
DROP TABLE "discounts";
