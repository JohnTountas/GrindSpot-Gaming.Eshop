-- Align Category column naming with current Prisma schema
ALTER TABLE "Category" RENAME COLUMN "slug" TO "slang";
ALTER INDEX "Category_slug_key" RENAME TO "Category_slang_key";
ALTER INDEX "Category_slug_idx" RENAME TO "Category_slang_idx";
