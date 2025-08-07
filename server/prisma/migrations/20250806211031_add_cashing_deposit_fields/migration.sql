-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "isCashed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDeposited" BOOLEAN NOT NULL DEFAULT false;
