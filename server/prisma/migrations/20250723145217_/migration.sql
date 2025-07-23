/*
  Warnings:

  - You are about to drop the `articles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchase_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sale_items` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "articles" DROP CONSTRAINT "articles_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "articles" DROP CONSTRAINT "articles_createdById_fkey";

-- DropForeignKey
ALTER TABLE "articles" DROP CONSTRAINT "articles_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "articles" DROP CONSTRAINT "articles_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_createdById_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "purchase_items" DROP CONSTRAINT "purchase_items_articleId_fkey";

-- DropForeignKey
ALTER TABLE "purchase_items" DROP CONSTRAINT "purchase_items_createdById_fkey";

-- DropForeignKey
ALTER TABLE "purchase_items" DROP CONSTRAINT "purchase_items_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "purchase_items" DROP CONSTRAINT "purchase_items_purchaseId_fkey";

-- DropForeignKey
ALTER TABLE "purchase_items" DROP CONSTRAINT "purchase_items_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "sale_items" DROP CONSTRAINT "sale_items_articleId_fkey";

-- DropForeignKey
ALTER TABLE "sale_items" DROP CONSTRAINT "sale_items_createdById_fkey";

-- DropForeignKey
ALTER TABLE "sale_items" DROP CONSTRAINT "sale_items_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "sale_items" DROP CONSTRAINT "sale_items_saleId_fkey";

-- DropForeignKey
ALTER TABLE "sale_items" DROP CONSTRAINT "sale_items_updatedById_fkey";

-- DropTable
DROP TABLE "articles";

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "purchase_items";

-- DropTable
DROP TABLE "sale_items";
