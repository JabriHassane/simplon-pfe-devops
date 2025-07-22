/*
  Warnings:

  - You are about to drop the column `discountAmount` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `discountType` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `discountAmount` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `discountType` on the `sales` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "sale_items" DROP CONSTRAINT "sale_items_articleId_fkey";

-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "discountAmount",
DROP COLUMN "discountType";

-- AlterTable
ALTER TABLE "sale_items" ADD COLUMN     "articleName" TEXT,
ALTER COLUMN "articleId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "sales" DROP COLUMN "discountAmount",
DROP COLUMN "discountType";

-- DropEnum
DROP TYPE "DiscountType";

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
