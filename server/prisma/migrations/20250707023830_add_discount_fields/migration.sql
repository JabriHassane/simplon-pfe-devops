-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "discountType" "DiscountType" NOT NULL DEFAULT 'fixed';

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "discountType" "DiscountType" NOT NULL DEFAULT 'fixed';
