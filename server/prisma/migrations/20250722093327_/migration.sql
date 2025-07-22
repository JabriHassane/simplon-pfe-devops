-- DropForeignKey
ALTER TABLE "purchase_items" DROP CONSTRAINT "purchase_items_articleId_fkey";

-- AlterTable
ALTER TABLE "purchase_items" ADD COLUMN     "articleName" TEXT,
ALTER COLUMN "articleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
